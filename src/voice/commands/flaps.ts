import { delay } from "@/lib/utils"
import { moveFlapsLever } from "@/services/flapsLever"
import { playSound } from "@/services/playSounds"
import { useTelemetryStore } from "@/store/telemetryStore"

type A32XVariant = "A319" | "A320" | "A321"

// VFE placard by lever position; the A319 shares the A320 limits
const FLAP_SPEED_LIMITS: Record<A32XVariant, Record<number, number>> = {
  A319: {
    1: 230,
    2: 200,
    3: 185,
    4: 177
  },
  A320: {
    1: 230,
    2: 200,
    3: 185,
    4: 177
  },
  A321: {
    1: 235,
    2: 215,
    3: 195,
    4: 190
  }
}

const SOUND_MAP: Record<number, string> = {
  0: "flaps_0.ogg",
  1: "flaps_1.ogg",
  2: "flaps_2.ogg",
  3: "flaps_3.ogg",
  4: "flaps_full.ogg"
}

// Fenix titles read like "FenixA320 CFM SL"; neo variants share their ceo limits
function getA32XVariant(title?: string): A32XVariant | null {
  const match = title?.toUpperCase().match(/A\s*-?\s*(319|320|321)/)
  return match ? (`A${match[1]}` as A32XVariant) : null
}

export async function setFlaps(setting: number, skipAnnouncement = false) {
  try {
    const { telemetry, aircraftTitle } = useTelemetryStore.getState()
    const currentSpeed = telemetry?.ias ?? 0
    const isOnGround = telemetry?.onGround ?? 0
    const variant = getA32XVariant(aircraftTitle ?? undefined) ?? "A320"

    const speedLimit = FLAP_SPEED_LIMITS[variant][setting]

    if (speedLimit && currentSpeed > speedLimit) {
      playSound("check_speed.ogg")
      return
    }

    if (!isOnGround) {
      if (!skipAnnouncement) {
        playSound("speed_checked.ogg")
        await delay(1000)
      }
      await moveFlapsLever(setting)

      await delay(1000)
      const sound = SOUND_MAP[setting]
      if (sound) playSound(sound)
    } else {
      await moveFlapsLever(setting)

      await delay(1000)
      const sound = SOUND_MAP[setting]
      if (sound) playSound(sound)
    }
  } catch (error) {
    console.error("[Flaps] Error setting flaps:", error)
  }
}
