import { simvarSet } from "@/API/simvarApi"

const FLAPS_LEVER_MAX = 4

// Fenix ignores the sim flap events and keeps its own lever, which takes any detent directly
export async function moveFlapsLever(target: number) {
  if (!Number.isInteger(target) || target < 0 || target > FLAPS_LEVER_MAX) return
  await simvarSet(`${target} (>L:S_FC_FLAPS)`)
}
