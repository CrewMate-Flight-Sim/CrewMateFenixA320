import { pushPullKnob, readLvar } from "@/API/simvarApi"

// Each EFIS has its own knob
const KNOBS = [
  { efis: 1, label: "captain baro" },
  { efis: 2, label: "FO baro" }
]

// Pull selects STD, push goes back to QNH; checked first so a repeat can't flip a side back
export async function setStdBaro(std: boolean) {
  for (const { efis, label } of KNOBS) {
    const isStd = await readLvar(`B_FCU_EFIS${efis}_BARO_STD`)
    if (isStd === null || isStd > 0.5 === std) continue
    await pushPullKnob(`S_FCU_EFIS${efis}_BARO_STD`, std, label)
  }
}
