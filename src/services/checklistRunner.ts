import { listen } from "@tauri-apps/api/event"

import { readDataRef } from "@/API/fenixApi"
import { simvarGet } from "@/API/simvarApi"
import { delay } from "@/lib/utils"
import { getChecklistById } from "@/services/checklistLoader"
import { getTakeoffCg, getTakeoffTrim, readPitchTrim } from "@/services/pitchTrim"
import { playSound, playSoundSequence, waitForSoundFinished } from "@/services/playSounds"
import { getTakeoffPerformance } from "@/services/takeoffPerformance"
import { useChecklistStore } from "@/store/checklistStore"
import { usePerformanceStore } from "@/store/performanceStore"
import { useSettingsStore } from "@/store/settingsStore"
import { useTelemetryStore } from "@/store/telemetryStore"
import { useVoiceHintProgressStore } from "@/store/voiceHintProgressStore"
import type { Check, ChecklistItem, ValidationRule } from "@/types/checklist"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SIMVAR = { READ_RETRIES: 5, READ_RETRY_DELAY: 150 }
const SILENT_COMPLETION_DELAY_MS = 2000
const AUTO_CHECK_RETRY_DELAY = 2000

const NUMBER_WORD_PATTERN = `(?:zero|one|two|three|four|five|six|seven|eight|nine|niner|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand)`
const NUMBER_WORDS_RE = new RegExp(`\\b${NUMBER_WORD_PATTERN}(?:[\\s-]+${NUMBER_WORD_PATTERN}){0,3}\\b`, "i")

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

async function playSyncSound(soundFile: string): Promise<void> {
  await waitForSoundFinished()
  await playSound(soundFile)
  await waitForSoundFinished()
}

function checkAbort(signal: AbortSignal): void {
  if (signal.aborted) throw new Error("Checklist aborted")
}

// ---------------------------------------------------------------------------
// Speech input
// ---------------------------------------------------------------------------

async function waitForSpeechResponse(signal: AbortSignal): Promise<string | null> {
  if (signal.aborted) return null

  return new Promise<string | null>((resolve) => {
    let unlistenFn: (() => void) | null = null
    let resolved = false

    const done = (value: string | null) => {
      if (resolved) return
      resolved = true
      unlistenFn?.()
      resolve(value)
    }

    signal.addEventListener("abort", () => done(null), { once: true })

    listen<{ text?: string; type?: string }>("speech_recognized", (event) => {
      if (event.payload?.type === "speech_unrecognized") return
      const text = event.payload?.text?.trim().toLowerCase()
      if (text) done(text)
    }).then((fn) => {
      unlistenFn = fn
      if (signal.aborted) done(null)
    })
  })
}

function matchesResponse(spoken: string, token: string): boolean {
  if (token === "*") return true
  if (token === "#2") return /\b\d{2}\b/.test(spoken)
  if (token === "#3") return /\b\d{3}\b/.test(spoken)
  if (token === "#4") return /\b\d{4}\b/.test(spoken)
  return spoken.includes(token.toLowerCase())
}

function matchesAnyResponse(spoken: string, responses: string[]): boolean {
  return responses.some((r) => matchesResponse(spoken, r))
}

const SPOKEN_NUMBER_VALUES: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  niner: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90
}

// "twenty eight point nine percent", "two eight point nine percent" or "28.9 percent"
function parseSpokenPercent(spoken: string): number | null {
  const beforePercent = spoken.split("percent")[0]
  const digits = beforePercent.match(/(\d{1,2}(?:\.\d)?)\s*$/)
  if (digits) return parseFloat(digits[1])

  const [whole, fraction] = beforePercent.split(/\bpoint\b/)
  const values = whole
    .split(/[\s-]+/)
    .map((word) => SPOKEN_NUMBER_VALUES[word])
    .filter((value) => value !== undefined)
  // Two single digits are read digit by digit ("two eight" is 28); otherwise the words add up ("twenty eight")
  const wholeValue =
    values.length === 2 && values.every((value) => value < 10)
      ? values[0] * 10 + values[1]
      : values.reduce((sum, value) => sum + value, 0)
  if (wholeValue === 0) return null
  const tenth = SPOKEN_NUMBER_VALUES[fraction?.trim().split(/\s+/)[0] ?? ""]
  return tenth !== undefined && tenth < 10 ? wholeValue + tenth / 10 : wholeValue
}

const CG_TOLERANCE = 0.5
const PITCH_TRIM_TOLERANCE = 0.2

// The spoken CG has to match the loadsheet and the wheel the takeoff trim; "set and checked" skips the CG
async function isPitchTrimConfirmed(spoken: string): Promise<boolean> {
  if (!spoken.includes("set and checked")) {
    const spokenCg = parseSpokenPercent(spoken)
    const cg = await getTakeoffCg()
    if (spokenCg === null || (cg !== null && Math.abs(spokenCg - cg) > CG_TOLERANCE)) {
      console.log(`[ChecklistRunner] Pitch trim CG mismatch: spoken ${spokenCg}, loadsheet ${cg}`)
      return false
    }
  }

  const [target, wheel] = await Promise.all([getTakeoffTrim(), readPitchTrim()])
  if (target !== null && wheel !== null && Math.abs(target - wheel) > PITCH_TRIM_TOLERANCE) {
    console.log(`[ChecklistRunner] Pitch trim wheel ${wheel} does not match takeoff trim ${target}`)
    return false
  }
  return true
}

// ---------------------------------------------------------------------------
// SimVar / store readers
// ---------------------------------------------------------------------------

function getStoreValue(storePath: string): string | undefined {
  const state = usePerformanceStore.getState() as unknown as Record<string, Record<string, string>>
  const [section, key] = storePath.split(".")
  return state[section]?.[key]
}

async function readSimVar(expression: string): Promise<number | null> {
  for (let attempt = 0; attempt < SIMVAR.READ_RETRIES; attempt++) {
    try {
      const value = await simvarGet(expression)
      if (value !== null) {
        console.log(
          `[ChecklistRunner] readSimVar("${expression}") → ${value}${attempt > 0 ? ` (attempt ${attempt + 1})` : ""}`
        )
        return value
      }
    } catch (err) {
      console.warn(`[ChecklistRunner] Failed to read simvar "${expression}":`, err)
      return null
    }
    await delay(SIMVAR.READ_RETRY_DELAY)
  }
  console.warn(`[ChecklistRunner] readSimVar("${expression}") → null after retries`)
  return null
}

// ---------------------------------------------------------------------------
// Check evaluation
// ---------------------------------------------------------------------------

async function runChecks(checks: Check[], signal: AbortSignal): Promise<boolean> {
  for (const check of checks) {
    let pass = false

    if (check.type === "any") {
      for (const group of check.groups ?? []) {
        if (await runChecks(group, signal)) {
          pass = true
          break
        }
      }
    }

    if (check.type === "simvar") {
      const raw = await readSimVar(check.var!)
      checkAbort(signal)

      let expected: number | null = null
      if (typeof check.expected === "boolean") {
        expected = check.expected ? 1 : 0
      } else if (typeof check.expected === "number") {
        expected = check.expected
      } else if (typeof check.expected === "object" && check.expected !== null) {
        const storeRaw = getStoreValue(check.expected.store)
        if (storeRaw !== undefined) {
          const n = parseFloat(String(storeRaw))
          expected = isNaN(n) ? null : n
        }
      }

      if (typeof check.expected === "boolean") {
        // Boolean SimVars: compare truthy/falsy
        const rawBool = raw !== null ? (raw > 0.5 ? 1 : 0) : null
        pass = rawBool !== null && expected !== null && rawBool === expected
      } else {
        // Numeric SimVars: compare with tolerance
        pass = raw !== null && expected !== null && Math.abs(raw - expected) < 0.5
      }
    }

    if (check.type === "store") {
      pass = getStoreValue(check.store!) === check.equals
    }

    // Fenix GraphQL value, for state no LVar exposes (e.g. the CIDS slides)
    if (check.type === "dataref") {
      pass = (await readDataRef(check.var!)) === check.expected
      checkAbort(signal)
    }

    if (!pass) {
      console.log(
        `[ChecklistRunner] check FAILED: type="${check.type}" var="${check.var ?? check.store}" expected="${check.expected ?? check.equals}"`
      )
      return false
    }
  }

  return true
}

async function findPassingRule(
  validations: ValidationRule[],
  spoken: string,
  signal: AbortSignal
): Promise<ValidationRule | null> {
  // Find the rule whose response token best (longest) matches spoken
  let bestMatch: ValidationRule | undefined
  let bestLen = -1

  for (const rule of validations) {
    for (const token of rule.when.responses ?? []) {
      if (matchesResponse(spoken, token) && token.length > bestLen) {
        bestLen = token.length
        bestMatch = rule
      }
    }
  }

  // If a response-based rule matched, only check that one
  if (bestMatch) {
    const ok = await runChecks(bestMatch.checks ?? [], signal)
    return ok ? bestMatch : null
  }

  // Silent mode and items without response rules land here
  for (const rule of validations) {
    const w = rule.when
    const conditionMet = (w.store && getStoreValue(w.store.path) === w.store.equals) || w.always === true
    if (!conditionMet) continue

    const ok = await runChecks(rule.checks ?? [], signal)
    if (ok) return rule
  }

  return null
}

// ---------------------------------------------------------------------------
// Checklist runner
// ---------------------------------------------------------------------------

class ChecklistRunner {
  private abortController: AbortController | null = null

  // ── Public API ────────────────────────────────────────────────────────────

  abort(): void {
    this.abortController?.abort()
    this.abortController = null
  }

  async execute(checklistId: string): Promise<void> {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }

    const store = useChecklistStore.getState()
    const checklist = getChecklistById(checklistId)
    if (!checklist) {
      store.setError(`Checklist "${checklistId}" not found`)
      return
    }

    store.setChecklist(checklist)

    this.abortController = new AbortController()
    const { signal } = this.abortController

    const silent = checklist.mode === "silent"

    try {
      if (silent) {
        const allPassed = await this.runSilentItems(checklist.items, signal)
        if (allPassed) {
          await this.playSilentCompletion(checklist.completion)
          store.setExecutionState("completed")
          this.onChecklistCompleted(checklist.id)
        } else {
          store.setExecutionState("error")
        }
      } else {
        await this.runItems(checklist.items, signal)
        await playSyncSound(checklist.completion)
        store.setExecutionState("completed")
        this.onChecklistCompleted(checklist.id)
      }
    } catch (err) {
      const message = String(err)
      if (message.includes("aborted")) {
        store.setExecutionState("aborted")
      } else {
        store.setError(message)
      }
    } finally {
      this.abortController = null
    }
  }

  // ── Silent-mode item iteration ────────────────────────────────────────────

  private async runSilentItems(items: ChecklistItem[], signal: AbortSignal): Promise<boolean> {
    let allPassed = true
    for (let i = 0; i < items.length; i++) {
      checkAbort(signal)
      useChecklistStore.getState().setStepIndex(i)
      const passed = await this.runSilentItem(items[i], i, signal)
      if (!passed) allPassed = false
      checkAbort(signal)
    }
    return allPassed
  }

  private async runSilentItem(item: ChecklistItem, index: number, signal: AbortSignal): Promise<boolean> {
    const { setStepStatus } = useChecklistStore.getState()
    setStepStatus(index, "active")
    checkAbort(signal)

    if (item.validations?.length) {
      // Empty spoken string — silent mode has no speech, only always/store conditions apply
      const rule = await findPassingRule(item.validations, "", signal)

      if (!rule) {
        if (item.incorrect) await playSyncSound(item.incorrect)
        setStepStatus(index, "failed")
        return false
      }
    }

    setStepStatus(index, "complete")
    return true
  }

  private async playSilentCompletion(completionSound: string): Promise<void> {
    await waitForSoundFinished()
    await delay(SILENT_COMPLETION_DELAY_MS)
    await playSound(completionSound)
    await waitForSoundFinished()
  }

  // ── Normal-mode item iteration ────────────────────────────────────────────

  private async runItems(items: ChecklistItem[], signal: AbortSignal): Promise<void> {
    for (let i = 0; i < items.length; i++) {
      checkAbort(signal)
      useChecklistStore.getState().setStepIndex(i)
      await this.executeItem(items[i], i, signal)
      checkAbort(signal)
    }
  }

  private async executeItem(item: ChecklistItem, index: number, signal: AbortSignal): Promise<void> {
    const { setStepStatus } = useChecklistStore.getState()
    setStepStatus(index, "active")

    if (!item.challenge) {
      await this.runAutoCheckItem(item, signal)
      setStepStatus(index, "complete")
      return
    }

    const aborted = await this.runInteractiveItem(item, signal)
    if (aborted) return // status left as "active"; execution is stopping anyway

    if (item.copilot_response) {
      await playSyncSound(item.copilot_response)
    }

    setStepStatus(index, "complete")
  }

  // ── Auto-check phase (no challenge, validations only) ─────────────────────

  private async runAutoCheckItem(item: ChecklistItem, signal: AbortSignal): Promise<void> {
    if (!item.validations?.length) return

    let called = false
    while (true) {
      checkAbort(signal)
      if (await findPassingRule(item.validations, "", signal)) break

      // Said once, then waits for the switch
      if (!called) {
        called = true
        if (item.incorrect) await playSyncSound(item.incorrect)
      }

      if (!useSettingsStore.getState().holdOnIncorrect) break
      await delay(AUTO_CHECK_RETRY_DELAY)
    }
  }

  // ── Normal interactive phase (challenge → speech response → confirmations) ─
  // A validated response still goes on to the takeoff/baro confirmation audio

  // Returns true if the item ended because the checklist was aborted.
  private async runInteractiveItem(item: ChecklistItem, signal: AbortSignal): Promise<boolean> {
    const responseList = item.response ?? []
    const hold = () => useSettingsStore.getState().holdOnIncorrect

    while (true) {
      checkAbort(signal)
      await playSyncSound(item.challenge!)
      checkAbort(signal)

      const spoken = await this.waitForValidResponse(item, responseList, signal)
      if (spoken === null) return true // aborted
      checkAbort(signal)

      if (item.validations?.length) {
        const rule = await findPassingRule(item.validations, spoken, signal)

        if (!rule) {
          await playSyncSound(item.incorrect ?? "are_you_sure.ogg")
          if (hold()) continue
          else break
        }

        if (rule.copilot_response) {
          await playSyncSound(rule.copilot_response)
        }
      }

      if (item.cg_confirmation && !(await isPitchTrimConfirmed(spoken))) {
        await playSyncSound(item.incorrect ?? "are_you_sure.ogg")
        if (hold()) continue
        else break
      }

      if (item.takeoff_confirmation) {
        await this.playTakeoffConfirmation()
      }

      if (item.rwy_confirmation) {
        await this.playRwyConfirmation()
      }

      if (item.baro_confirmation) {
        await this.playBaroConfirmation(spoken)
      }

      break
    }

    return false
  }

  // A takeoff or baro readback missing its numbers is ignored, so the PF can say it again
  private async waitForValidResponse(
    item: ChecklistItem,
    responseList: string[],
    signal: AbortSignal
  ): Promise<string | null> {
    while (true) {
      const spoken = await waitForSpeechResponse(signal)
      if (spoken === null) return null

      if (responseList.length === 0 || matchesAnyResponse(spoken, responseList)) {
        if (item.takeoff_confirmation && !spoken.includes("set and checked")) {
          const { thrust } = getTakeoffPerformance(useTelemetryStore.getState().telemetry)
          const hasV1 = /\bv\s*1\b/.test(spoken) || /\bv\s*one\b/i.test(spoken)
          const hasVR = /\bv\s*r\b/.test(spoken) || /\bv\s*rotate\b/i.test(spoken)
          const hasV2 = /\bv\s*2\b/.test(spoken) || /\bv\s*two\b/i.test(spoken)
          const hasThrust = thrust === "flex" ? /\bflex\b/i.test(spoken) : /\btoga\b/i.test(spoken)
          if (!(hasV1 && hasVR && hasV2 && hasThrust)) continue
        }

        const expectsFeet = responseList.some((r) => r.toLowerCase().includes("feet"))
        // "no d h set" is a minimum answer that carries no number
        const noNumberAnswer = spoken.includes("set and checked") || spoken.includes("no d h set")
        if ((item.baro_confirmation || item.cg_confirmation || expectsFeet) && !noNumberAnswer) {
          if (!(/\b\d{2,4}\b/.test(spoken) || NUMBER_WORDS_RE.test(spoken))) continue
        }

        return spoken
      }
    }
  }

  private async playTakeoffConfirmation(): Promise<void> {
    const { v1, vr, v2, thrust, flexTemp } = getTakeoffPerformance(useTelemetryStore.getState().telemetry)
    const digits = (n: number) =>
      String(Math.round(n))
        .split("")
        .map((d) => `${d}.ogg`)

    const filenames: string[] = ["v_one.ogg", ...digits(v1), "v_r.ogg", ...digits(vr), "v_2.ogg", ...digits(v2)]

    if (thrust === "flex") {
      filenames.push("flex.ogg", ...digits(flexTemp))
    } else {
      filenames.push("TOGA.ogg")
    }

    await playSoundSequence(filenames)
  }

  private async playBaroConfirmation(spoken: string): Promise<void> {
    const t = useTelemetryStore.getState().telemetry
    if (t === null) return

    const spokenMatch = spoken.match(/\b(\d{3,4})\b/)
    const spokenNum = spokenMatch ? parseInt(spokenMatch[1], 10) : null
    const isHpa = spokenNum !== null ? spokenNum >= 920 && spokenNum <= 1060 : t.cptBaro === 1
    const value = isHpa ? Math.round(t.captAltimeterSettingMB ?? 0) : Math.round((t.captAltimeterSettingHG ?? 0) * 100)
    const filenames = [
      ...String(value)
        .split("")
        .map((d) => `${d}.ogg`),
      "set.ogg"
    ]
    await playSoundSequence(filenames)
  }

  private async playRwyConfirmation(): Promise<void> {
    const { runway } = usePerformanceStore.getState().takeoff

    // Separate runway numbers from trailing orientation letter (e.g., "08L" -> "08" and "L")
    const match = runway
      ?.trim()
      .toUpperCase()
      .match(/^([0-9]+)([LCR])?$/)

    // No runway set, or one we can't read back - still acknowledge the item
    if (!match) {
      await playSyncSound("confirmed.ogg")
      return
    }

    const [, numStr, parallel] = match

    // Turn runway numbers into individual sound files (e.g. "08" -> ["0.ogg", "8.ogg"])
    const filenames: string[] = numStr.split("").map((d) => `${d}.ogg`)

    // If parallel orientation exists, add it before the confirmation phrase
    if (parallel) {
      const parallelMap: Record<string, string> = {
        L: "left.ogg",
        C: "center.ogg",
        R: "right.ogg"
      }

      if (parallelMap[parallel]) {
        filenames.push(parallelMap[parallel])
      }
    }

    // Append confirmation at the very end
    filenames.push("confirmed.ogg")

    await playSoundSequence(filenames)
  }

  // ── Completion side-effects ───────────────────────────────────────────────

  private onChecklistCompleted(checklistId: string): void {
    useVoiceHintProgressStore.getState().recordChecklistCompleted(checklistId)
    if (checklistId === "shutdown") {
      useVoiceHintProgressStore.getState().resetForColdGround()
    }
  }
}

// ---------------------------------------------------------------------------
// Module-level singleton + public API
// ---------------------------------------------------------------------------

const runner = new ChecklistRunner()

export const executeChecklist = (checklistId: string): Promise<void> => runner.execute(checklistId)
export const abortChecklist = (): void => runner.abort()
