import { setLvar } from "@/API/simvarApi"
import { delay } from "@/lib/utils"

export async function setStartAPU(position: number) {
  const ok = await setLvar(position, "S_OH_ELEC_APU_MASTER", "APU master switch")
  if (!ok) return

  await delay(5000)

  await setLvar(position, "S_OH_ELEC_APU_START", "APU start button")
}
