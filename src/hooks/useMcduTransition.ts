import { useEffect } from "react"

import { readDataRef } from "@/API/fenixApi"
import { useTelemetryStore } from "@/store/telemetryStore"
import { useTransitionStore } from "@/store/transitionStore"

const POLL_MS = 2000
const MCDU_DISPLAYS = ["aircraft.mcdu1.display", "aircraft.mcdu2.display"]

// Lowercase letters on the display are colour and font codes; the text itself is all capitals
function displayLines(xml: string): string[] {
  return [...xml.matchAll(/<line>(.*?)<\/line>/g)].map((m) => m[1].replace(/[a-z]/g, "").trim())
}

// The value sits on the line under its label; "[ ]" or dashes mean nothing is entered yet
function valueUnder(lines: string[], label: string): string | null {
  const i = lines.findIndex((line) => line.startsWith(label))
  return i >= 0 && i + 1 < lines.length ? lines[i + 1] : null
}

// The PERF pages are only readable while shown, so the last value seen is kept
export function useMcduTransition() {
  useEffect(() => {
    const poll = async () => {
      if (useTelemetryStore.getState().status !== "connected") return
      const store = useTransitionStore.getState()

      for (const display of MCDU_DISPLAYS) {
        const xml = await readDataRef(display)
        if (!xml) continue
        const lines = displayLines(xml)

        // PERF TAKE OFF shows TRANS ALT in feet, e.g. 4000
        const ta = valueUnder(lines, "TRANS ALT")?.match(/^(\d{4,5})\b/)
        if (ta && Number(ta[1]) !== store.transitionAltitude) store.setTransitionAltitude(Number(ta[1]))

        // PERF APPR shows TRANS FL as a flight level, e.g. FL045
        const tl = valueUnder(lines, "TRANS FL")?.match(/^FL(\d{2,3})\b/)
        if (tl && Number(tl[1]) * 100 !== store.transitionLevel) store.setTransitionLevel(Number(tl[1]) * 100)
      }
    }

    const timer = setInterval(() => void poll(), POLL_MS)
    return () => clearInterval(timer)
  }, [])
}
