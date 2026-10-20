import { setLvar } from "@/API/simvarApi"
import { playSound } from "@/services/playSounds"
import { useTelemetryStore } from "@/store/telemetryStore"

const WIPERS_SPEED_LIMIT = 230 // knots

// Positions: 0 OFF, 1 SLOW, 2 FAST
export async function setWipers(position: number) {
  const { telemetry } = useTelemetryStore.getState()
  const currentSpeed = telemetry?.ias ?? 0
  if (position !== 0 && currentSpeed > WIPERS_SPEED_LIMIT) {
    playSound("check_speed.ogg")
    return
  }

  await setLvar(position, "S_MISC_WIPER_CAPT", "captain wiper")
  await setLvar(position, "S_MISC_WIPER_FO", "FO wiper")
  playSound("check.ogg")
}
