import { create } from "zustand"
import { persist } from "zustand/middleware"

// Feet, 0 until read from the MCDU PERF pages (hooks/useMcduTransition.ts)
interface TransitionStore {
  transitionAltitude: number
  transitionLevel: number
  setTransitionAltitude: (feet: number) => void
  setTransitionLevel: (feet: number) => void
  reset: () => void
}

export const useTransitionStore = create<TransitionStore>()(
  persist(
    (set) => ({
      transitionAltitude: 0,
      transitionLevel: 0,
      setTransitionAltitude: (feet) => set({ transitionAltitude: feet }),
      setTransitionLevel: (feet) => set({ transitionLevel: feet }),
      reset: () => set({ transitionAltitude: 0, transitionLevel: 0 })
    }),
    {
      name: "transition-data"
    }
  )
)
