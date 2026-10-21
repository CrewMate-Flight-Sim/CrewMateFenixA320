import { useEffect } from "react"

import { readDataRef } from "@/API/fenixApi"
import { getTakeoffCg } from "@/services/pitchTrim"
import { useFenixDataStore } from "@/store/fenixDataStore"
import { usePerformanceStore } from "@/store/performanceStore"
import { useTelemetryStore } from "@/store/telemetryStore"

const POLL_MS = 1000

// FMS landing config: 3 = CONF 3, 4 = FULL
const LANDING_FLAPS: Record<number, string> = { 3: "3", 4: "Full" }

const asNumber = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null)

export function useFenixData() {
  useEffect(() => {
    const poll = async () => {
      if (useTelemetryStore.getState().status !== "connected") return

      const [flex, toga, takeoffFlaps, landingFlaps, takeoffCg] = await Promise.all([
        readDataRef("aircraft.engines.limits.flex"),
        readDataRef("aircraft.engines.limits.toga"),
        readDataRef("aircraft.fms.perf.takeOff.flaps"),
        readDataRef("aircraft.fms.perf.landing.flaps"),
        getTakeoffCg()
      ])

      const store = useFenixDataStore.getState()
      const flexN1 = asNumber(flex)
      const togaN1 = asNumber(toga)
      if (flexN1 !== store.flexN1 || togaN1 !== store.togaN1) store.setThrustLimits(flexN1, togaN1)
      if (takeoffCg !== store.takeoffCg) store.setTakeoffCg(takeoffCg)

      const performance = usePerformanceStore.getState()

      // PERF TO flaps 1-3 is the lever position; 0 while the field is blank
      const toFlaps = asNumber(takeoffFlaps)
      if (toFlaps !== null) {
        const flaps = toFlaps >= 1 && toFlaps <= 3 ? String(toFlaps) : ""
        if (flaps !== performance.takeoff.flaps) performance.setTakeoffData({ flaps })
      }

      // The MCDU PERF APPR page is the source, so the landing window no longer asks for it
      const landing = LANDING_FLAPS[asNumber(landingFlaps) ?? 0]
      if (landing && landing !== performance.landing.flaps) performance.setLandingData({ flaps: landing })
    }

    const timer = setInterval(() => void poll(), POLL_MS)
    return () => clearInterval(timer)
  }, [])
}
