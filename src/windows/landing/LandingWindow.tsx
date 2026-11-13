import { emit } from "@tauri-apps/api/event"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { Info } from "lucide-react"
import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { usePerformanceStore } from "@/store/performanceStore"

const SELECT_CLS =
  "w-full h-8 bg-slate-900/50 border border-slate-600 text-white text-xs rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"

const MISSED_ALT_MIN = 1000
const MISSED_ALT_MAX = 20000
const MISSED_ALT_STEP = 100

export function LandingWindow() {
  const { landing, setLandingData } = usePerformanceStore()
  const missedRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getCurrentWindow()
      .show()
      .catch(() => {})
  }, [])

  // React's onWheel is passive and can't stop the browser's own number input scrolling
  useEffect(() => {
    const input = missedRef.current
    if (!input) return
    const handler = (e: WheelEvent) => e.preventDefault()
    input.addEventListener("wheel", handler, { passive: false })
    return () => input.removeEventListener("wheel", handler)
  }, [])

  const handleChange = (name: string, value: string | number | boolean) => {
    setLandingData({ [name]: value } as Partial<typeof landing>)
    emit("landing-updated", { ...landing, [name]: value })
  }

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e.target.name, Number(e.target.value))
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange(e.target.name, e.target.value)
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e.target.name, e.target.checked)
  }

  // Rounds too, so a typed 3550 steps to 3500 or 3600
  const handleMissedWheel = (deltaY: number) => {
    const step = deltaY > 0 ? -MISSED_ALT_STEP : MISSED_ALT_STEP
    const next = Math.round((landing.missedAltitude + step) / MISSED_ALT_STEP) * MISSED_ALT_STEP
    handleChange("missedAltitude", Math.max(MISSED_ALT_MIN, Math.min(MISSED_ALT_MAX, next)))
  }

  return (
    <TooltipProvider>
      <div className="h-screen overflow-hidden bg-black text-white p-3 flex flex-col gap-3">
        {/* Landing flaps come from the MCDU PERF APPR page */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-3">
          <Field id="missedAltitude" label="Missed App (ft)">
            <Input
              ref={missedRef}
              type="number"
              min={MISSED_ALT_MIN}
              max={MISSED_ALT_MAX}
              id="missedAltitude"
              name="missedAltitude"
              value={landing.missedAltitude}
              onChange={handleNumberInput}
              onWheel={(e) => handleMissedWheel(e.deltaY)}
              className="h-8 bg-slate-900/50 border-slate-600 text-white text-xs font-mono px-2 focus-visible:ring-cyan-500"
              placeholder="4000"
            />
          </Field>

          <Field
            id="selLs"
            label="LS"
            hint="Tells the FO whether to press the LS button. Untick it for an RNP AR approach, for example."
          >
            <label
              htmlFor="selLs"
              className="flex items-center gap-2 h-8 px-2 rounded-md border border-slate-600 bg-slate-900/50 text-xs cursor-pointer select-none"
            >
              <input
                type="checkbox"
                id="selLs"
                name="ls"
                checked={Boolean(landing.ls)}
                onChange={handleCheckboxChange}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
              {landing.ls ? "FO presses LS" : "Leave LS off"}
            </label>
          </Field>

          <Field
            id="antiIce"
            label="Anti Ice"
            hint="Any setting other than OFF keeps the flaps down in the After Landing flow."
          >
            <select
              id="antiIce"
              name="antiIce"
              value={landing.antiIce}
              onChange={handleSelectChange}
              className={SELECT_CLS}
            >
              <option value="off">OFF</option>
              <option value="oneng">ENG</option>
            </select>
          </Field>

          <Field id="apuStart" label="APU" hint="AUTO starts the APU in the After Landing flow.">
            <select
              id="apuStart"
              name="apuStart"
              value={landing.apuStart}
              onChange={handleSelectChange}
              className={SELECT_CLS}
            >
              <option value="auto">AUTO</option>
              <option value="manual">MANUAL</option>
            </select>
          </Field>
        </div>

        <Button
          onClick={() => getCurrentWindow().close()}
          className="w-full h-8 mt-auto bg-cyan-700 hover:bg-cyan-800 text-white font-semibold text-sm"
        >
          Ok
        </Button>
      </div>
    </TooltipProvider>
  )
}

interface FieldProps {
  id: string
  label: string
  hint?: string
  children: React.ReactNode
}

function Field({ id, label, hint, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 h-4">
        <Label htmlFor={id} className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
          {label}
        </Label>
        {hint && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3 h-3 text-slate-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="text-xs max-w-[200px]">{hint}</TooltipContent>
          </Tooltip>
        )}
      </div>
      {children}
    </div>
  )
}
