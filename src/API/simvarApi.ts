import { invoke } from "@tauri-apps/api/core"

import { delay } from "@/lib/utils"

export async function simvarSet(variableString: string): Promise<void> {
  return invoke<void>("simvar_set", { variableString })
}

export async function simvarGet(variableString: string): Promise<number | null> {
  return invoke<number | null>("simvar_get", { variableString })
}

// Logs instead of throwing: a failed write only means the FO's action didn't happen; the result lets callers skip the acknowledgement
export async function setLvar(value: number, name: string, label: string): Promise<boolean> {
  try {
    await simvarSet(`${value} (>L:${name})`)
    return true
  } catch (error) {
    console.error(`[SimVar] Failed to set ${label} (L:${name}):`, error)
    return false
  }
}

// Core starts watching a var on its first read, which comes back empty; the stream refreshes it within a frame
export async function readLvar(name: string): Promise<number | null> {
  const value = await simvarGet(`(L:${name})`)
  if (value !== null) return value
  await delay(100)
  return simvarGet(`(L:${name})`)
}

// Fenix momentary buttons are counters: press and release in one write, since an odd value in between counts as a press of its own
export async function pressButton(name: string, label: string): Promise<boolean> {
  const count = await readLvar(name)
  if (count === null) {
    console.error(`[SimVar] Failed to read ${label} (L:${name})`)
    return false
  }
  return setLvar(count + 2, name, label)
}

// Test buttons act only while held: the odd count is the press, the next count the release
export async function holdButton(name: string, ms: number, label: string): Promise<boolean> {
  const count = await readLvar(name)
  if (count === null) {
    console.error(`[SimVar] Failed to read ${label} (L:${name})`)
    return false
  }
  if (!(await setLvar(count + 1, name, label))) return false
  await delay(ms)
  return setLvar(count + 2, name, label)
}

// Lit buttons toggle, so the button is pressed only when its light differs
export async function setLitButton(button: string, light: string, on: boolean, label: string): Promise<boolean> {
  const lit = await readLvar(light)
  if (lit === null) {
    console.error(`[SimVar] Failed to read ${label} light (L:${light})`)
    return false
  }
  if (lit > 0.5 === on) return true
  return pressButton(button, label)
}

// Fenix push/pull knobs are counters: pull +1, push -1
export async function pushPullKnob(name: string, pull: boolean, label: string): Promise<boolean> {
  const count = await readLvar(name)
  if (count === null) {
    console.error(`[SimVar] Failed to read ${label} (L:${name})`)
    return false
  }
  return setLvar(count + (pull ? 1 : -1), name, label)
}

export async function getAircraftTitle(): Promise<string | null> {
  return invoke<string | null>("get_aircraft_title")
}
