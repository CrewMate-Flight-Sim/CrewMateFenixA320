import type { Telemetry } from "@/store/telemetryStore"

export interface TakeoffPerformance {
  v1: number
  vr: number
  v2: number
  thrust: "flex" | "toga"
  flexTemp: number
}

// Same test as the Fenix FMS: a flex temp below the TAT gives no flex thrust, so the takeoff is TOGA
export function getTakeoffPerformance(t: Telemetry | null): TakeoffPerformance {
  const flexTemp = Math.round(t?.flexTemperature ?? 0)
  const tat = t?.totalAirTemperature ?? 0
  return {
    v1: Math.round(t?.v1Speed ?? 0),
    vr: Math.round(t?.vrSpeed ?? 0),
    v2: Math.round(t?.v2Speed ?? 0),
    thrust: flexTemp > 0 && flexTemp >= tat ? "flex" : "toga",
    flexTemp
  }
}
