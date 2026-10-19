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
  { key: "parkingBrake", expression: "(A:BRAKE PARKING INDICATOR,Bool)" },
  { key: "taxiLight", expression: "(L:INI_LIGHTS_NOSE)" },
  { key: "brakeRightPosition", expression: "(A:BRAKE RIGHT POSITION,Number)" },
  { key: "aileronDeflection", expression: "(A:AILERON LEFT DEFLECTION PCT,Percent Over 100)" },
  { key: "elevatorDeflection", expression: "(A:ELEVATOR DEFLECTION PCT,Percent Over 100)" },
  { key: "rudderDeflection", expression: "(A:RUDDER DEFLECTION PCT,Percent Over 100)" },
  { key: "spoilersHandlePosition", expression: "(A:SPOILERS HANDLE POSITION,Position)" },
  { key: "transitionAltitude", expression: "(L:INI_TRANSITION_ALTITUDE)" },
  { key: "transitionLevel", expression: "(L:INI_TRANSITION_LEVEL)" },
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
  { key: "autopilotEngaged", expression: "(L:INI_AP1_BUTTON,Bool)" },
  { key: "captAltimeterSettingMB", expression: "(A:KOHLSMAN SETTING MB:1, Millibars)" },
  { key: "captAltimeterSettingHG", expression: "(A:KOHLSMAN SETTING HG:1, inHg)" },
  { key: "ignitionKnob", expression: "(L:INI_IGNITION_KNOB)" },
  { key: "flapsIndex", expression: "(A:FLAPS HANDLE INDEX,Number)" },
  { key: "mixture1", expression: "(L:INI_MIXTURE_RATIO1_HANDLE)" },
  { key: "mixture2", expression: "(L:INI_MIXTURE_RATIO2_HANDLE)" },
  { key: "spoilersArmed", expression: "(L:INI_SPOILERS_ARMED)" },
  { key: "fcuAlt", expression: "(L:N_FCU_ALTITUDE)" },
  { key: "cptBaro", expression: "(L:XMLVAR_BARO_Selector_HPA_1)" },
  { key: "foBaro", expression: "(L:XMLVAR_BARO_Selector_HPA_2)" },
  { key: "linkedInstruments", expression: "(L:INI_LINKED_INSTRUMENTS)" },
  { key: "arrRunwayHdg", expression: "(L:INI_ARR_RUNWAY_HDG)" },
  { key: "engine1InReverse", expression: "(L:A320_Sound:ENG_1_In_Reverse)" },
  { key: "engine2InReverse", expression: "(L:A320_Sound:ENG_2_In_Reverse)" },
  // Autobrake DECEL lights (upper legend)
  { key: "autobrakeLoDecel", expression: "(L:I_MIP_AUTOBRAKE_LO_U)" },
  { key: "autobrakeMedDecel", expression: "(L:I_MIP_AUTOBRAKE_MED_U)" },
  { key: "autobrakeMaxDecel", expression: "(L:I_MIP_AUTOBRAKE_MAX_U)" },
  { key: "thrustLeverClb", expression: "(L:INI_LEVER_IN_CL)" },
  { key: "foChrono", expression: "(L:INI_FO_CHRONO)" },
  { key: "baroMode", expression: "(L:XMLVAR_Baro1_Mode)" },
  { key: "pitchDegrees", expression: "(A:PLANE PITCH DEGREES,Degrees)" },
  { key: "bankDegrees", expression: "(A:PLANE BANK DEGREES,Degrees)" },
  { key: "speedTarget", expression: "(A:AUTOPILOT AIRSPEED HOLD VAR,Knots)" },
  { key: "locDeviation", expression: "(L:INI_LOC_DEV)" },
  { key: "glideDeviation", expression: "(L:INI_GS_DEV)" },
  { key: "locValid", expression: "(L:INI_LOC_VALID)" }
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
