import { setLvar } from "@/API/simvarApi"

// Latched pushbutton: 0 OFF, 1 ON
export async function setBrakeFan(position: number) {
  await setLvar(position, "S_MIP_BRAKE_FAN", "brake fan")
}
