import { invoke } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"
import { useEffect, useRef } from "react"

import { getAircraftTitle } from "@/API/simvarApi"
import { useTelemetryStore } from "@/store/telemetryStore"
import type { Telemetry } from "@/store/telemetryStore"

// Sent to the backend once per connection; it then pushes the values on "telemetry_data"
const SIM_VARS: { key: string; expression: string }[] = [
  { key: "ias", expression: "(A:AIRSPEED INDICATED,Knots)" },
  { key: "alt", expression: "(A:INDICATED ALTITUDE,Feet)" },
  { key: "radioAlt", expression: "(A:PLANE ALT ABOVE GROUND,Feet)" },
  { key: "pAlt", expression: "(A:PRESSURE ALTITUDE,Feet)" },
  { key: "vs", expression: "(A:VERTICAL SPEED,Feet per minute)" },
  { key: "onGround", expression: "(A:SIM ON GROUND,Bool)" },
  { key: "isSlewActive", expression: "(A:IS SLEW ACTIVE,Bool)" },
  { key: "engine1N1", expression: "(A:TURB ENG N1:1,Percent)" },
  { key: "engine2N1", expression: "(A:TURB ENG N1:2,Percent)" },
  { key: "throttleLever1", expression: "(A:GENERAL ENG THROTTLE LEVER POSITION:1,Number)" },
  { key: "throttleLever2", expression: "(A:GENERAL ENG THROTTLE LEVER POSITION:2,Number)" },
  { key: "landingGear", expression: "(A:GEAR HANDLE POSITION,Position)" },
  { key: "brakeLeftPosition", expression: "(A:BRAKE LEFT POSITION,Number)" },
  { key: "parkingBrake", expression: "(L:S_MIP_PARKING_BRAKE)" },
  { key: "taxiLight", expression: "(L:S_OH_EXT_LT_NOSE)" },
  { key: "beacon", expression: "(L:S_OH_EXT_LT_BEACON)" },
  { key: "brakeRightPosition", expression: "(A:BRAKE RIGHT POSITION,Number)" },
  // Fenix surface positions, 0-200 with 100 neutral; the sim deflection simvars follow the stick instead
  { key: "aileronDeflection", expression: "(L:A320_FC_AIL_L)" },
  { key: "elevatorDeflection", expression: "(L:A320_FC_L_ELEV)" },
  { key: "rudderDeflection", expression: "(L:A320_FC_RUDDER)" },
  { key: "spoilersHandlePosition", expression: "(A:SPOILERS HANDLE POSITION,Position)" },
  // MCDU PERF TAKE OFF page
  { key: "v1Speed", expression: "(L:N_MISC_PERF_TO_V1)" },
  { key: "vrSpeed", expression: "(L:N_MISC_PERF_TO_VR)" },
  { key: "v2Speed", expression: "(L:N_MISC_PERF_TO_V2)" },
  { key: "flexTemperature", expression: "(L:N_MISC_PERF_TO_FLEX)" },
  { key: "totalAirTemperature", expression: "(A:TOTAL AIR TEMPERATURE,Celsius)" },
  // Lever detents: 2 idle, 3 CL, 4 FLX/MCT, 5 TOGA
  { key: "throttleDetent1", expression: "(L:A_FC_THROTTLE_LEFT_INPUT)" },
  { key: "throttleDetent2", expression: "(L:A_FC_THROTTLE_RIGHT_INPUT)" },
  // E/WD N1 and its gap to the FADEC target; Fenix publishes the gap for engine 1 only
  { key: "engine1N1Display", expression: "(L:A320_Sound:ENG_1_N1)" },
  { key: "engine1N1DemandDelta", expression: "(L:A320_Sound:ENG_1_N1_Demand_Delta)" },
  { key: "autopilotEngaged", expression: "(L:I_FCU_AP1)" },
  { key: "captAltimeterSettingMB", expression: "(A:KOHLSMAN SETTING MB:1, Millibars)" },
  { key: "captAltimeterSettingHG", expression: "(A:KOHLSMAN SETTING HG:1, inHg)" },
  // 0 CRANK, 1 NORM, 2 IGN/START
  { key: "engineMode", expression: "(L:S_ENG_MODE)" },
  { key: "flapsIndex", expression: "(L:S_FC_FLAPS)" },
  { key: "engineMaster1", expression: "(L:S_ENG_MASTER_1)" },
  { key: "engineMaster2", expression: "(L:S_ENG_MASTER_2)" },
  // 0 armed, 1 retracted
  { key: "speedbrakeLever", expression: "(L:A_FC_SPEEDBRAKE)" },
  { key: "fcuAlt", expression: "(L:N_FCU_ALTITUDE)" },
  // Unit selectors, 0 inHg / 1 hPa (the reverse of the cockpit tooltip order)
  { key: "cptBaro", expression: "(L:S_FCU_EFIS1_BARO_MODE)" },
  { key: "foBaro", expression: "(L:S_FCU_EFIS2_BARO_MODE)" },
  { key: "arrRunwayHdg", expression: "(L:INI_ARR_RUNWAY_HDG)" },
  { key: "engine1InReverse", expression: "(L:A320_Sound:ENG_1_In_Reverse)" },
  { key: "engine2InReverse", expression: "(L:A320_Sound:ENG_2_In_Reverse)" },
  // Autobrake DECEL lights (upper legend)
  { key: "autobrakeLoDecel", expression: "(L:I_MIP_AUTOBRAKE_LO_U)" },
  { key: "autobrakeMedDecel", expression: "(L:I_MIP_AUTOBRAKE_MED_U)" },
  { key: "autobrakeMaxDecel", expression: "(L:I_MIP_AUTOBRAKE_MAX_U)" },
  { key: "foChrono", expression: "(L:N_MIP_CLOCK_CHRONO)" },
  { key: "baroStd", expression: "(L:B_FCU_EFIS1_BARO_STD)" },
  { key: "pitchDegrees", expression: "(A:PLANE PITCH DEGREES,Degrees)" },
  { key: "bankDegrees", expression: "(A:PLANE BANK DEGREES,Degrees)" },
  // Keeps the managed target behind the FCU speed
  { key: "speedTarget", expression: "(L:N_FCU_SPEED)" },
  // Fenix tunes the ILS on NAV 3 (the MMR)
  { key: "locDeviation", expression: "(A:NAV RADIAL ERROR:3,Degrees)" },
  { key: "glideDeviation", expression: "(A:NAV GLIDE SLOPE ERROR:3,Degrees)" },
  { key: "locValid", expression: "(A:NAV HAS LOCALIZER:3,Bool)" },
  { key: "glideValid", expression: "(A:NAV HAS GLIDE SLOPE:3,Bool)" }
]

const RETRY_INTERVAL_MS = 5000
const STREAM_INTERVAL_MS = 16

export function useSimConnection() {
  const retryRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const startStream = async () => {
      useTelemetryStore.getState().setStatus("connecting")
      try {
        // Always stop first to ensure a clean reconnect when the flight reloads.
        await invoke("stop_telemetry_stream").catch(() => {})
        await invoke("start_telemetry_stream", {
          variables: SIM_VARS,
          intervalMs: STREAM_INTERVAL_MS
        })
      } catch {
        useTelemetryStore.getState().setStatus("error")
      }
    }

    const stopStream = () => {
      if (retryRef.current) {
        clearInterval(retryRef.current)
        retryRef.current = null
      }
      invoke("stop_telemetry_stream").catch(() => {})
      useTelemetryStore.getState().setStatus("connecting")
    }

    // Retry logic: only active while a flight is loaded
    const startRetry = () => {
      if (retryRef.current) clearInterval(retryRef.current)
      retryRef.current = setInterval(() => {
        const current = useTelemetryStore.getState().status
        if (current !== "connected") {
          void startStream()
        }
      }, RETRY_INTERVAL_MS)
    }

    let unlistenFlightState: (() => void) | null = null
    const setupFlightStateListener = async () => {
      unlistenFlightState = await listen<boolean>("sim-in-flight", (event) => {
        if (event.payload) {
          // Flight loaded — restart the stream so LVARs register with correct slots
          void startStream()
          startRetry()
        } else {
          stopStream()
        }
      })

      // An app opened mid-flight may have missed the "sim-in-flight" event
      const alreadyInCockpit = await invoke<boolean>("get_in_cockpit").catch(() => false)
      if (alreadyInCockpit) {
        void startStream()
        startRetry()
      }
    }
    void setupFlightStateListener()

    let unlistenTelemetry: (() => void) | null = null
    const setupTelemetryListener = async () => {
      unlistenTelemetry = await listen<Record<string, number>>("telemetry_data", (event) => {
        const s = useTelemetryStore.getState()
        s.setTelemetry(event.payload as Telemetry)
        if (s.status !== "connected") {
          s.setStatus("connected")
        }
      })
    }
    void setupTelemetryListener()

    let unlistenTitle: (() => void) | null = null
    const setupTitleListener = async () => {
      unlistenTitle = await listen<string>("simconnect-aircraft-title", (event) => {
        const title = typeof event.payload === "string" ? event.payload.trim() : ""
        if (title) {
          useTelemetryStore.getState().setAircraftTitle(title)
        }
      })
    }
    void setupTitleListener()

    getAircraftTitle()
      .then((cached) => {
        if (cached) {
          useTelemetryStore.getState().setAircraftTitle(cached)
        }
      })
      .catch(() => {})

    return () => {
      if (retryRef.current) {
        clearInterval(retryRef.current)
        retryRef.current = null
      }
      if (unlistenFlightState) unlistenFlightState()
      if (unlistenTelemetry) unlistenTelemetry()
      if (unlistenTitle) unlistenTitle()

      invoke("stop_telemetry_stream").catch(() => {})
    }
  }, [])
}
