import { setLvar } from "@/API/simvarApi"

// Positions: landing 0 RETRACT, 1 OFF, 2 ON; strobe 0 OFF, 1 AUTO, 2 ON; nose 0 OFF, 1 TAXI, 2 TO
export async function setLandingLights(position: number) {
  await setLvar(position, "S_OH_EXT_LT_LANDING_L", "landing light left")
  await setLvar(position, "S_OH_EXT_LT_LANDING_R", "landing light right")
}

export async function setStrobeLights(position: number) {
  await setLvar(position, "S_OH_EXT_LT_STROBE", "strobe lights")
}

// The A320 runway turnoff lights go on and off with the nose light
export async function setTaxiLights(position: number) {
  await setLvar(position, "S_OH_EXT_LT_NOSE", "taxi lights")
  await setLvar(position > 0 ? 1 : 0, "S_OH_EXT_LT_RWY_TURNOFF", "runway turnoff lights")
}
