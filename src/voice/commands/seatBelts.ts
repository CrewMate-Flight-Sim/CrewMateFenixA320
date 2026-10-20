import { setLvar } from "@/API/simvarApi"

// The A320 switch has no AUTO: 0 OFF, 1 ON
export async function setSeatBelts(position: number) {
  await setLvar(position, "S_OH_SIGNS", "seat belts")
}
