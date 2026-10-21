import { pressButton, readLvar } from "@/API/simvarApi"
import { delay } from "@/lib/utils"

// Main panel clock: CHR toggles start/stop and resumes from the old time, so a fresh start goes through RST
const CHR = "S_MIP_CLOCK_CHR"
const RST = "S_MIP_CLOCK_RST"
const CHRONO = "N_MIP_CLOCK_CHRONO"

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
