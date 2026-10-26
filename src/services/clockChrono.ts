import { pressButton, readLvar, setLvar } from "@/API/simvarApi"
import { delay } from "@/lib/utils"

// Main panel clock: CHR toggles start/stop and resumes from the old time, so a fresh start goes through RST
const CHR = "S_MIP_CLOCK_CHR"
const RST = "S_MIP_CLOCK_RST"
const CHRONO = "N_MIP_CLOCK_CHRONO"

// ET knob positions: 0 RUN, 1 STP, 2 RST; RST clears the time, so RUN then counts up from zero
const ET = "S_MIP_CLOCK_ET"
const ET_RUN = 0
const ET_RST = 2
const ET_RESET_MS = 500

// The readout is minutes * 100 + seconds, -1 when cleared
export function chronoSeconds(value: number): number {
  if (value < 0) return value
  return Math.floor(value / 100) * 60 + (value % 100)
}

// RST restarts a running chrono from 0 but only clears a stopped one, which then needs CHR to start
export async function restartChrono() {
  if (!(await pressButton(RST, "clock RST"))) return
  await delay(1000)
  const value = await readLvar(CHRONO)
  if (value !== null && value < 0) await pressButton(CHR, "clock CHR")
}

export async function stopChrono() {
  await pressButton(CHR, "clock CHR")
}

export async function startElapsedTime() {
  if (!(await setLvar(ET_RST, ET, "clock ET"))) return
  await delay(ET_RESET_MS)
  await setLvar(ET_RUN, ET, "clock ET")
}
