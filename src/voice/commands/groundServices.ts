import { writeDataRef } from "@/API/fenixApi"
import { gsxClient } from "@/API/gsxApi"

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

export async function callPushback() {
  try {
    await gsxClient.triggerService("Departure")
  } catch (error) {
    console.error("[GroundServices] Failed to call GSX pushback:", error)
  }
}
