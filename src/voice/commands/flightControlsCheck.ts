import { executeFlow } from "@/services/flowRunner"
import { playSound, waitForSoundFinished } from "@/services/playSounds"
import { useTelemetryStore } from "@/store/telemetryStore"
import type { Telemetry } from "@/store/telemetryStore"

// Surface position, so each call waits for the surface to reach its stop, not just the stick
// Fenix stops measured on the ground: elevator 200 up / 50.75 down, left aileron 17.6 left / 183.4 right, rudder 1 / 200
const ELEVATOR_FULL_UP = 195
const ELEVATOR_FULL_DOWN = 55
const AILERON_FULL_LEFT = 22
const AILERON_FULL_RIGHT = 178
const RUDDER_FULL_LEFT = 5
const RUDDER_FULL_RIGHT = 195
const NEUTRAL = 100
const NEUTRAL_TOLERANCE = 5

const isNeutral = (position: number) => Math.abs(position - NEUTRAL) < NEUTRAL_TOLERANCE

interface Step {
  condition: (t: Telemetry) => boolean
  sound: string
}

const STEPS: Step[] = [
  { condition: (t) => t.elevatorDeflection > ELEVATOR_FULL_UP, sound: "full_up.ogg" },
  { condition: (t) => t.elevatorDeflection < ELEVATOR_FULL_DOWN, sound: "full_down.ogg" },
  { condition: (t) => isNeutral(t.elevatorDeflection), sound: "neutral.ogg" },

  { condition: (t) => t.aileronDeflection < AILERON_FULL_LEFT, sound: "full_left.ogg" },
  { condition: (t) => t.aileronDeflection > AILERON_FULL_RIGHT, sound: "full_right.ogg" },
  { condition: (t) => isNeutral(t.aileronDeflection), sound: "neutral.ogg" },

  { condition: (t) => t.rudderDeflection < RUDDER_FULL_LEFT, sound: "full_left.ogg" },
  { condition: (t) => t.rudderDeflection > RUDDER_FULL_RIGHT, sound: "full_right.ogg" },
  { condition: (t) => isNeutral(t.rudderDeflection), sound: "neutral.ogg" }
]

function waitFor(condition: (t: Telemetry) => boolean): Promise<void> {
  return new Promise((resolve) => {
    // Check immediately in case the condition is already true
    const current = useTelemetryStore.getState().telemetry
    if (current && condition(current)) {
      resolve()
      return
    }

    // Subscribe — fires on every telemetry push from the backend
    const unsub = useTelemetryStore.subscribe((state) => {
      const t = state.telemetry
      if (t && condition(t)) {
        unsub()
        resolve()
      }
    })
  })
}

// Bumped on every call, so a check still waiting goes quiet once a newer one starts
let latestCheck = 0

export async function flightControlsCheck() {
  const check = ++latestCheck
  await waitForSoundFinished()

  for (const step of STEPS) {
    await waitFor(step.condition)
    if (check !== latestCheck) return
    await playSound(step.sound)
    await waitForSoundFinished()
  }

  executeFlow("after_flight_controls_check")
}
