import { writeDataRef } from "@/API/fenixApi"
import { gsxClient } from "@/API/gsxApi"
import { readLvar } from "@/API/simvarApi"
import { delay } from "@/lib/utils"
import { playSound } from "@/services/playSounds"
import { useSettingsStore } from "@/store/settingsStore"

gsxClient.connect()

export async function setGPU(on: boolean) {
  await writeDataRef("groundservice.groundpower", on)
}

export async function setPCA(on: boolean) {
  await writeDataRef("groundservice.preconditionedAir", on)
}

export async function disconnectAllGround() {
  await setGPU(false)
  await setPCA(false)
}

// Before pushback the PM asks for ground power and air off, but only once the APU can take over
export async function requestGroundDisconnect() {
  if ((await readLvar("I_OH_ELEC_APU_START_U")) !== 1) return
  await delay(5000 + Math.random() * 7000)
  await disconnectAllGround()
  await playSound("all_off.ogg", { pack: useSettingsStore.getState().geSoundPack })
}

export async function callPushback() {
  try {
    await gsxClient.triggerService("Departure")
  } catch (error) {
    console.error("[GroundServices] Failed to call GSX pushback:", error)
  }
}
