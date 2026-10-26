import { useEffect, useRef } from "react"

import { useTelemetryTick } from "@/hooks/useTelemetryTick"
import { startElapsedTime } from "@/services/clockChrono"
import { executeFlow } from "@/services/flowRunner"
import { useFlowStore } from "@/store/flowStore"
import { useGoAroundStore } from "@/store/goAroundStore"
import { useTelemetryStore } from "@/store/telemetryStore"

// Thrust lever detent (A_FC_THROTTLE_*_INPUT): 2 idle, 3 CL, 4 FLX/MCT, 5 TOGA
const DETENT_CL = 3

// Auto flows fire once per phase; the ground/airborne transitions re-arm them
interface TriggeredFlags {
  afterStart: boolean
  packsOn: boolean
  afterTakeoff: boolean
  landing: boolean
  afterLanding: boolean
  climbTenK: boolean
  descTenK: boolean
  shutdown: boolean
  clockStart: boolean
}

interface PrevValues {
  engineMode: number
  flapsIndex: number
  speedbrakeLever: number
  landingGear: number
  alt: number
  engineMaster1: number
  engineMaster2: number
  leversInClb: boolean
  parkingBrake: number
}

export function useAutoFlows() {
  const triggered = useRef<TriggeredFlags>({
    afterStart: false,
    packsOn: false,
    afterTakeoff: false,
    landing: false,
    afterLanding: false,
    climbTenK: false,
    descTenK: false,
    shutdown: false,
    clockStart: false
  })

  const prev = useRef<PrevValues>({
    engineMode: 0,
    flapsIndex: 0,
    speedbrakeLever: 1,
    landingGear: 1,
    alt: 0,
    engineMaster1: 1,
    engineMaster2: 1,
    leversInClb: false,
    parkingBrake: 1
  })

  const phase = useRef<"ground" | "airborne">("ground")
  const primed = useRef(false)

  // Re-arm after-takeoff flow on go-around
  const goAroundCount = useRef(useGoAroundStore.getState().count)
  useEffect(() => {
    return useGoAroundStore.subscribe((s) => {
      if (s.count !== goAroundCount.current) {
        goAroundCount.current = s.count
        triggered.current.afterTakeoff = false
        triggered.current.landing = false
      }
    })
  }, [])

  const tick = () => {
    const t = useTelemetryStore.getState().telemetry
    if (!t || t.isSlewActive) return

    // Seeded from live telemetry, or a switch already on at app start (e.g. engine mode IGN) would look like an edge
    if (!primed.current) {
      primed.current = true
      prev.current.engineMode = t.engineMode ?? 0
      prev.current.flapsIndex = t.flapsIndex ?? 0
      prev.current.speedbrakeLever = t.speedbrakeLever ?? 1
      prev.current.landingGear = t.landingGear ?? 1
      prev.current.alt = t.alt ?? 0
      prev.current.leversInClb = t.throttleDetent1 === DETENT_CL && t.throttleDetent2 === DETENT_CL
      prev.current.engineMaster1 = t.engineMaster1 ?? 1
      prev.current.engineMaster2 = t.engineMaster2 ?? 1
      prev.current.parkingBrake = t.parkingBrake ?? 1
      phase.current = t.onGround ? "ground" : "airborne"
      return
    }

    const fl = triggered.current
    const p = prev.current
    const isRunning = useFlowStore.getState().executionState === "running"
    const leversInClb = t.throttleDetent1 === DETENT_CL && t.throttleDetent2 === DETENT_CL

    if (phase.current === "ground" && !t.onGround && t.vs > 200) {
      // Ground → Airborne
      phase.current = "airborne"
      fl.afterStart = false
      fl.shutdown = false
      fl.afterLanding = false
    }

    if (phase.current === "airborne" && t.onGround && t.ias < 80) {
      // Airborne → Ground
      phase.current = "ground"
      fl.afterTakeoff = false
      fl.landing = false
      fl.packsOn = false
      fl.climbTenK = false
      fl.descTenK = false
    }

    // The PM starts the clock when the parking brake comes off for pushback (beacon on), once per departure
    if (!fl.clockStart && t.onGround && t.beacon === 1 && p.parkingBrake === 1 && t.parkingBrake === 0) {
      fl.clockStart = true
      void startElapsedTime()
    }

    if (!isRunning) {
      // After Start: engine mode selector IGN/START → NORM while on ground
      if (!fl.afterStart && t.onGround && p.engineMode === 2 && t.engineMode === 1) {
        fl.afterStart = true
        executeFlow("after_start")
      }

      // Packs on: both thrust levers moved to the CL detent while airborne
      else if (!fl.packsOn && !t.onGround && !p.leversInClb && leversInClb) {
        fl.packsOn = true
        executeFlow("packs_on")
      }

      // Landing: gear extended while airborne
      else if (!fl.landing && !t.onGround && p.landingGear === 0 && t.landingGear === 1) {
        fl.landing = true
        executeFlow("landing")
      }

      if (!fl.afterTakeoff && !t.onGround && p.flapsIndex > 0 && t.flapsIndex === 0) {
        fl.afterTakeoff = true
        executeFlow("after_takeoff")
      }

      // After Landing: spoilers disarmed on ground; the lever is analog, so the halfway point marks the move
      else if (!fl.afterLanding && t.onGround && p.speedbrakeLever < 0.5 && t.speedbrakeLever >= 0.5) {
        fl.afterLanding = true
        executeFlow("after_landing")
      }

      // Climb through 10,000 ft
      else if (!fl.climbTenK && !t.onGround && t.vs > 100 && p.alt < 10000 && t.alt >= 10000) {
        fl.climbTenK = true
        executeFlow("climb_ten_thousand_flow")
      }

      // Descend through 10,000 ft
      else if (!fl.descTenK && !t.onGround && t.vs < -100 && p.alt > 10000 && t.alt <= 10000) {
        fl.descTenK = true
        executeFlow("desc_ten_thousand_flow")
      }

      // Shutdown: both engine master switches to cutoff on ground
      else if (
        !fl.shutdown &&
        t.onGround &&
        (p.engineMaster1 === 1 || p.engineMaster2 === 1) &&
        t.engineMaster1 === 0 &&
        t.engineMaster2 === 0
      ) {
        fl.shutdown = true
        fl.clockStart = false
        executeFlow("shutdown")
      }
    }

    p.leversInClb = leversInClb
    p.engineMode = t.engineMode ?? 0
    p.flapsIndex = t.flapsIndex ?? 0
    p.speedbrakeLever = t.speedbrakeLever ?? 1
    p.landingGear = t.landingGear ?? 1
    p.alt = t.alt ?? 0
    p.engineMaster1 = t.engineMaster1 ?? 1
    p.engineMaster2 = t.engineMaster2 ?? 1
    p.parkingBrake = t.parkingBrake ?? 1
  }

  useTelemetryTick(tick)
}
