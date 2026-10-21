import { create } from "zustand"

// Live values from the Fenix GraphQL API (hooks/useFenixData.ts), null while unreadable
interface FenixDataStore {
  flexN1: number | null
  togaN1: number | null
  takeoffCg: number | null
  setThrustLimits: (flexN1: number | null, togaN1: number | null) => void
  setTakeoffCg: (takeoffCg: number | null) => void
}

export const useFenixDataStore = create<FenixDataStore>()((set) => ({
  flexN1: null,
  togaN1: null,
  takeoffCg: null,
  setThrustLimits: (flexN1, togaN1) => set({ flexN1, togaN1 }),
  setTakeoffCg: (takeoffCg) => set({ takeoffCg })
}))
