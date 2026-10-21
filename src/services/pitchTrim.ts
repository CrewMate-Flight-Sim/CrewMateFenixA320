import { readDataRef } from "@/API/fenixApi"
import { readLvar } from "@/API/simvarApi"

// The trim wheel LVar is thousandths of a degree, positive nose up
export const PITCH_TRIM_SCALE = 1000

// Takeoff trim is neutral at 28.5 % CG and moves about 0.22° per % (nose up forward, nose down aft)
const NEUTRAL_CG = 28.5
const TRIM_PER_CG_PERCENT = 0.22

// The final loadsheet CG is what the PF reads out
export async function getTakeoffCg(): Promise<number | null> {
  const loadsheet = await readDataRef("fenix.efb.finalLoadsheet")
  if (typeof loadsheet !== "string") return null
  try {
    const macTow = (JSON.parse(loadsheet) as { macTow?: unknown }).macTow
    return typeof macTow === "number" ? macTow : null
  } catch {
    return null
  }
}

// Degrees, positive nose up; PERF TO THS when entered (a blank field reads 0), otherwise from the CG
export async function getTakeoffTrim(): Promise<number | null> {
  const ths = await readDataRef("aircraft.fms.perf.takeOff.ths")
  if (typeof ths === "number" && ths !== 0) return ths
  const cg = await getTakeoffCg()
  return cg !== null ? Math.round((NEUTRAL_CG - cg) * TRIM_PER_CG_PERCENT * 10) / 10 : null
}

export async function readPitchTrim(): Promise<number | null> {
  const value = await readLvar("A_FC_ELEVATOR_TRIM")
  return value !== null ? value / PITCH_TRIM_SCALE : null
}
