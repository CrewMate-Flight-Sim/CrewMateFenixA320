import { listen } from "@tauri-apps/api/event"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// V-speeds, flex and thrust come from the MCDU PERF page (services/takeoffPerformance.ts)
interface TakeoffData {
  flaps?: string
  packs?: string
  antiIce?: string
  runway: string
}

interface LandingData {
  flaps: string
  missedAltitude: number
  antiIce?: string
  apuStart?: string
  ls: boolean
}

interface PerformanceStore {
  takeoff: TakeoffData
  landing: LandingData
  setTakeoffData: (data: Partial<TakeoffData>) => void
  setLandingData: (data: Partial<LandingData>) => void
  resetTakeoffData: () => void
  resetLandingData: () => void
}

const DEFAULT_TAKEOFF_DATA: TakeoffData = {
  packs: "on",
  antiIce: "off",
  runway: ""
}

const DEFAULT_LANDING_DATA: LandingData = {
  flaps: "Full",
  missedAltitude: 4000,
  antiIce: "off",
  apuStart: "auto",
  ls: true
}

export const usePerformanceStore = create<PerformanceStore>()(
  persist(
    (set) => ({
      takeoff: DEFAULT_TAKEOFF_DATA,
      landing: DEFAULT_LANDING_DATA,
      setTakeoffData: (data) =>
        set((state) => ({
          takeoff: { ...state.takeoff, ...data }
        })),
      setLandingData: (data) =>
        set((state) => ({
          landing: { ...state.landing, ...data }
        })),
      resetTakeoffData: () => set({ takeoff: DEFAULT_TAKEOFF_DATA }),
      resetLandingData: () => set({ landing: DEFAULT_LANDING_DATA })
    }),
    {
      name: "performance-data"
    }
  )
)

listen<Partial<TakeoffData>>("takeoff-updated", (event) => {
  usePerformanceStore.getState().setTakeoffData(event.payload)
})

listen<Partial<LandingData>>("landing-updated", (event) => {
  usePerformanceStore.getState().setLandingData(event.payload)
})
