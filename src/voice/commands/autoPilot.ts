import { pushPullKnob, readLvar, setLitButton, setLvar } from "@/API/simvarApi"
import { delay } from "@/lib/utils"
import { playSound } from "@/services/playSounds"

// Readback rounds are capped so a dashed window, which keeps showing the managed target, can't keep the knob turning
const MAX_TURN_ROUNDS = 5

// Writes the whole difference to the encoder at once, then reads back and corrects
async function turnKnob(
  encoder: string,
  readout: string,
  target: number,
  unitsPerClick: number,
  label: string,
  wrap = false
): Promise<boolean> {
  for (let round = 0; round < MAX_TURN_ROUNDS; round++) {
    const current = await readLvar(readout)
    const count = await readLvar(encoder)
    if (current === null || count === null) return false

    let diff = target - current
    // Heading goes the short way round
    if (wrap) diff = (((diff % 360) + 540) % 360) - 180
    const clicks = Math.round(diff / unitsPerClick)
    if (clicks === 0) return true

    if (!(await setLvar(count + clicks, encoder, label))) return false
    await delay(150)
  }
  return false
}

export async function engageAutoPilot() {
  await setLitButton("S_FCU_AP1", "I_FCU_AP1", true, "autopilot 1")
}

export async function setLevelOff() {
  await pushPullKnob("S_FCU_VERTICAL_SPEED", false, "V/S knob")
}

export async function setLOC() {
  await setLitButton("S_FCU_LOC", "I_FCU_LOC", true, "localizer")
}

export async function setAPPR() {
  await setLitButton("S_FCU_APPR", "I_FCU_APPR", true, "approach")
}

// Each EFIS has its own FD button
export async function setFlightDirector(on: boolean) {
  for (const efis of [1, 2]) {
    await setLitButton(`S_FCU_EFIS${efis}_FD`, `I_FCU_EFIS${efis}_FD`, on, `EFIS ${efis} flight director`)
  }
}

// The bird comes with the FCU TRK-FPA mode
export async function setBird(on: boolean) {
  await setLitButton("S_FCU_HDGVS_TRKFPA", "I_FCU_TRACK_FPA_MODE", on, "HDG-V/S TRK-FPA")
}

// Speed commands; the encoder steps Mach in Mach mode, so knots are only dialled in SPD
export async function setAirspeedDial(knots: number) {
  if (knots < 50 || knots > 400) return
  if (((await readLvar("B_FCU_SPEED_MACH")) ?? 0) > 0.5) return
  if (await turnKnob("E_FCU_SPEED", "N_FCU_SPEED", knots, 1, "speed knob")) {
    playSound("check.ogg")
  }
}

export async function setSelSpeed() {
  await pushPullKnob("S_FCU_SPEED", true, "speed knob")
}

export async function setManagedSpeed() {
  await pushPullKnob("S_FCU_SPEED", false, "speed knob")
}

// Heading commands
export async function setHeadingDial(degrees: number) {
  if (degrees < 0 || degrees > 360) return
  if (await turnKnob("E_FCU_HEADING", "N_FCU_HEADING", degrees % 360, 1, "heading knob", true)) {
    playSound("check.ogg")
  }
}

export async function setSelHeading() {
  await pushPullKnob("S_FCU_HEADING", true, "heading knob")
}

export async function setManagedHeading() {
  await pushPullKnob("S_FCU_HEADING", false, "heading knob")
}

// Altitude commands; turned on the 100 ft scale (0), then the PF's scale is put back
export async function setAltitudeDial(feet: number) {
  if (feet < 100 || feet > 49000) return
  const scale = await readLvar("S_FCU_ALTITUDE_SCALE")
  if (scale !== 0) {
    await setLvar(0, "S_FCU_ALTITUDE_SCALE", "altitude scale")
    await delay(250)
  }
  await turnKnob("E_FCU_ALTITUDE", "N_FCU_ALTITUDE", Math.round(feet / 100) * 100, 100, "altitude knob")
  if (scale !== null && scale !== 0) await setLvar(scale, "S_FCU_ALTITUDE_SCALE", "altitude scale")
}

export async function setSelAlt() {
  await pushPullKnob("S_FCU_ALTITUDE", true, "altitude knob")
}

export async function setManagedAlt() {
  await pushPullKnob("S_FCU_ALTITUDE", false, "altitude knob")
}
