import { useTelemetryStore } from "@/store/telemetryStore"

// SOP: the APU air intake flap closes about two minutes after the AVAIL light goes out
const FLAP_CLOSE_MS = 120000

let avail = false
let availOffAt = 0

useTelemetryStore.subscribe(({ telemetry }) => {
  const nowAvail = telemetry?.apuAvail === 1
  if (avail && !nowAvail) availOffAt = Date.now()
  avail = nowAvail
})

export function isApuAvail(): boolean {
  return avail
}

export function apuFlapRemainingMs(): number {
  return Math.max(0, availOffAt + FLAP_CLOSE_MS - Date.now())
}
