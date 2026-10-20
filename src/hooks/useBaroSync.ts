import { useEffect, useRef } from "react"

import { simvarSet } from "@/API/simvarApi"
import { useTelemetryStore } from "@/store/telemetryStore"

const COOLDOWN_MS = 500

// The Fenix FO side never follows the captain on its own, so the FO inHg/hPa unit is kept in step here
export function useBaroSync() {
  const lastWriteRef = useRef<number>(0)

  useEffect(() => {
    const unsubscribe = useTelemetryStore.subscribe((state) => {
      const t = state.telemetry
      if (!t) return

      const cptBaro = t.cptBaro
      const foBaro = t.foBaro
      if (cptBaro === undefined || foBaro === undefined) return
      if (cptBaro === foBaro) return

      const now = Date.now()
      if (now - lastWriteRef.current < COOLDOWN_MS) return

      lastWriteRef.current = now
      void simvarSet(`${cptBaro} (>L:S_FCU_EFIS2_BARO_MODE)`)
    })

    return unsubscribe
  }, [])
}
