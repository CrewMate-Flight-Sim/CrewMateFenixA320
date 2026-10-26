# CrewMate Fenix A320 — User Manual

**CrewMate Fenix A320** is a virtual First Officer companion for the **Fenix A320** in Microsoft Flight Simulator. It listens to your voice, responds with audio callouts, runs automated cockpit flows, and guides you through interactive checklists — just like a real crew member.

---

<div style="text-align: center;">
  <img src="../crewmate.png" alt="Crewmate avatar" width="800">
</div>

## Table of Contents

1. [Standard Operating Procedures](#standard-operating-procedures)
2. [Getting Started](#getting-started)
3. [Tutorial](#tutorial)
4. [Voice Commands](#voice-commands)
5. [Checklist Responses](#checklist-responses)
6. [Tips & Troubleshooting](#tips--troubleshooting)

---

## Standard Operating Procedures

The FO's flows, callouts and preflight timeline follow the **A320 Normal Procedures** published by [TheAirlinePilots.com](https://theairlinepilots.com), used with the permission of its author. The FO carries out the items assigned to the PM or CM2, and the items both pilots do. Everything assigned to the PF or CM1 is left to you.

For the aircraft procedures themselves (what each item is, when it is done and who does it), see the manual: [A320 Normal Procedures (PDF)](https://theairlinepilots.com/forumarchive/a320/a320-normal-procedures.pdf). This manual only covers what CrewMate does and how to talk to it.

The checklists are the exception: they follow the Normal Checklist on the back cover of the Fenix QRH, as the aircraft implements it.

---

## Getting Started

### Requirements

- Install **an English** Windows speech recognition language pack (Settings → Time & language → Speech). Regional variants (e.g. US, UK, Australia, India) are supported — whichever English recognizer Windows exposes. If several English packs are installed, the active engine follows Windows' installed-recognizer order.
- **Set up Windows Speech Recognition once** before using the Voice Trainer. The trainer teaches Windows your voice, and Windows needs an existing speech profile to train. If the setup has never been run, there is no profile and training cannot start.
- To use the trainer app, set your Display Language to EN‑US while training (you can change it back afterward).

### Voice Modes

CrewMate supports two voice recognition modes, chosen with **Voice Mode** in Settings:

| Mode                 | How it works                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Always listening** | The microphone is always listening. Speak naturally.                                                            |
| **Push-to-talk**     | The FO only listens while you hold the **PTT button**. Keep holding until you finish the command, then release. |

The mic button on the toolbar is the master switch in both modes. When it is off the FO hears nothing, even with PTT held. The icon shows what the FO can hear:

| Toolbar mic | Meaning                                            |
| ----------- | -------------------------------------------------- |
| Crossed out | Off. The FO hears nothing.                         |
| Red         | Always listening. The FO hears everything.         |
| Faded red   | Push-to-talk, ready. Hold the PTT button to speak. |
| Green       | Push-to-talk, PTT held. The FO is listening.       |

### PTT and Mic On/Off Buttons

Both buttons can be a keyboard key, mouse button 4 or 5, or a button or hat on a joystick, yoke, throttle or game controller. They work while MSFS has focus, including in fullscreen.

- **PTT Button**: hold to talk in Push-to-talk mode.
- **Mic On/Off**: works like clicking the toolbar mic, in either mode. It only works while the sim is connected.

To set one, open **Settings → Microphone**, click **Set** and press the key or button. Press **Esc** or click **Cancel** to stop without changing it, and click **×** to clear it.

CrewMate does not take the key or button away from MSFS, so pick one that is not bound to anything in the sim. Analog triggers and axes cannot be bound.

### Settings

| Setting                                      | What it does                                                                                                                                       |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Copilot**                                  | Which voice the FO speaks with (Jenny, Aria, Guy, Christopher).                                                                                    |
| **Ground Eng.**                              | The voice used by the ground engineer on the interphone.                                                                                           |
| **Output Device**                            | Where the FO's audio is played. Useful if you keep the sim on one device and voices on another.                                                    |
| **Input Device**                             | Which microphone the speech engine listens to.                                                                                                     |
| **Sound Volume**                             | How loud the FO's audio is (0–200; above 100 amplifies).                                                                                           |
| **Voice Sensitivity**                        | How confident the engine must be before accepting a command (50–100). Lower is more tolerant and may accept the wrong command; higher is stricter. |
| **Voice Mode**                               | **Always listening** or **Push-to-talk**. See [Voice Modes](#voice-modes).                                                                         |
| **PTT Button**                               | The key or button held to talk in Push-to-talk mode.                                                                                               |
| **Mic On/Off**                               | A key or button that switches the mic on and off, like the toolbar mic.                                                                            |
| **Hold checklist on incorrect item**         | On: the FO repeats the challenge until the item is answered correctly. Off: the item is skipped and the checklist moves on.                        |
| **Auto Ground lights control**               | On: the FO operates landing, taxi and strobe lights during the flows. Off: the lights are left to you.                                             |
| **5 minutes cool down (for engine shutoff)** | On: the FO refuses to shut an engine down until five minutes have passed since landing, and says so. Off: engines can be shut down at any time.    |
| **Approach deviation calls**                 | On: the FO calls speed, sink rate, bank, pitch, localizer and glide deviations between 1,000 ft and 50 ft. Off: no deviation calls.                |

---

## Tutorial

### Assumptions

This tutorial assumes you are parked at the gate with the aircraft cold and dark. You are the Captain and PF (Pilot Flying); CrewMate acts as PM (Pilot Monitoring). Each phase below lists what the FO does and what starts it. For the full procedure of each phase, including your own PF items, see the [A320 Normal Procedures](#standard-operating-procedures).

### Preflight timeline

Say "Let's prepare the aircraft" to start the preflight timer. The times count down to the planned off-block time.

- **T-48:** the FO does the preliminary cockpit preparation:
  - weather radar and predictive windshear off, engine masters off, engine mode selector NORM, gear lever down, wipers off;
  - battery check (both batteries off, then AUTO), external power on when it is available;
  - RMP 2 on and the ACP 2 VHF 1 volume up;
  - APU fire test, APU master on and APU start;
  - all three IRs to NAV, dome light on at night;
  - the ECAM ENG, HYD and DOOR pages, then the parking brake on.
- **T-44:** the FO leaves for the walkaround. You start your cockpit preparation.
- **T-35:** the FO comes back, reports "walkaround completed, all good no issues found" and does the cockpit preparation on the right-hand side: APU bleed on once the APU is available, table open, the FO EFIS (CSTR, VOR 1 and 2, ND in ARC at the smallest range) and the FO oxygen mask test.
- **T-25:** departure briefing. Enter the takeoff data in the **Takeoff Performance** window; the flows read packs, anti-ice and flaps from it.
- **T-20:** call for the COCKPIT PREPARATION checklist.
- **T-5:** the FO closes the table and, once the APU is available, asks the ground crew to disconnect ground power and air conditioning.
- **T-1:** say "Before start procedure". The FO closes the table and the cockpit door, sets the transponder to AUTO and makes the PA "Cabin crew, arm slides and cross check". Then call for the BEFORE START checklist.

> **The FO is outside between T-44 and T-35.** While away on the walkaround the FO does not answer any command, and an **FO outside** indicator is shown. Ground engineer calls and the preflight timer still work, because the ground engineer is a different person on the interphone.

### Pushback and Engine Start

- When you release the parking brake for pushback with the beacon on, the FO starts the elapsed time on the clock.
- Announce each engine start ("Starting engine one", "Starting engine two"); the FO answers "check".
- When you set the engine mode selector back to NORM, the FO runs the **After Start** flow: ground spoilers armed, rudder trim reset, flaps set for takeoff (left up when anti-ice is used for taxi), pitch trim set, ECAM STATUS shown and the dome light off.
- Say "Flight controls check". The FO calls each position as you reach it: full up, full down, neutral, full left, full right, neutral, then rudder full left, full right, neutral.
- When the check is complete, call for the AFTER START checklist.

### Taxi

- Say "Clear left" when the left side is clear. The FO answers "clear right" and, with **Auto Ground lights control** on, sets the nose light to TAXI and the runway turnoff lights on.
- At the end of the flight controls check the FO runs the **Taxi** flow: autobrake MAX, weather radar on, predictive windshear AUTO, terrain on the FO ND, both FDs on and the T.O CONFIG test.
- Then call for the TAXI checklist.

### Line-up & Takeoff

- When cleared to line up, say "Runway entry procedure" or "Clear to line up". The FO makes the PA "Cabin crew, please be seated for takeoff", switches the brake fans off if they are on, sets TCAS to TA/RA, sets the packs and APU bleed per the Takeoff Performance window and the FO ND range, and turns the strobes on. Then the FO reports "approach path clear of traffic, ready".
- Call for the LINE-UP checklist.
- When cleared for takeoff, say "Takeoff". The FO sets the landing lights on, the nose light to T.O and the runway turnoff lights on, and starts the chrono.

### Rejected Takeoff

- To reject, announce **"STOP"**. The FO calls **"reverse green"** once reverse is selected, then **"decel"** or **"no decel"**.
- Nothing is said about reverse if it is never selected, so a low speed reject produces no reverse call at all.

### After Takeoff

- When you set the thrust levers to CL, the FO turns the packs on if you took off with them off, then stops and resets the chrono.
- When the flaps are retracted to zero, the FO runs the **After Takeoff** flow: ground spoilers disarmed, nose and runway turnoff lights off, APU bleed and APU off.

### Climb through 10,000 ft

- The FO retracts the landing lights, selects ARPT and terrain off on the FO ND, sets the ND and opens the table.

### Descent Preparation

- Enter the landing data in the **Landing Performance** window; the after landing flow reads the APU start and anti-ice from it.

### Descent through 10,000 ft

- The FO closes the table, turns the landing and wing lights on and the seat belt signs on, selects terrain on and CSTR on the FO ND, sets the ND and presses the FO LS.

### Approach

- After passing the transition level, call "set altimeters" or "set QNH" (see [Altimeter](#altimeter)), then call for the APPROACH checklist.
- The transition altitude and transition level calls are skipped when the altimeter has already been set, so setting standard early does not produce a redundant call later.
- Between 1,000 ft and 50 ft radio altitude with the gear down, the FO calls the approach deviations: "speed" (below the speed target -5 kt or above +10 kt), "sink rate" (more than 1,000 ft/min), "bank" (more than 6°), "pitch" (above 10° or below 0°), "localizer" and "glide" (more than ½ dot, ILS only). Each call is made once and again only after the value has come back inside the limit. They stop after a go-around until the next approach, and can be switched off in Settings.

### Landing

- When the gear goes down, the FO makes the PA "Cabin crew, please be seated for landing", arms the ground spoilers and sets the nose light to T.O and the runway turnoff lights on.
- When the landing configuration is set, call for the LANDING checklist.
- Announce "Continue" at minima or "Go-around, flaps" as appropriate.
- After touchdown the FO calls "spoilers", "reverse green" and "decel".

### After Landing

- Disarming the ground spoilers starts the **After Landing** flow:
  - weather radar and predictive windshear off, engine mode selector NORM, TCAS standby;
  - flaps up, unless anti-ice is used per the Landing Performance window;
  - APU master on and APU start, when the Landing Performance window says so;
  - engine anti-ice per the Landing Performance window;
  - with **Auto Ground lights control** on: landing lights retracted, strobes AUTO, nose light TAXI.
- When the flow is done, call for the AFTER LANDING checklist.
- To taxi in on one engine, say "Shutdown engine two". The FO switches engine 2 anti-ice off, engine 2 master off and the yellow electric pump on.

### Parking

- Shutting down both engines starts the **Parking** flow: anti-ice off, APU bleed on (or external power on when available), all fuel pumps off, transponder to standby, dome light on at night, FO LS off and the cockpit door open, then the PA "Cabin crew, disarm slides please".
- After the flow, call for the PARKING checklist.

> **Engine shutdown is held for five minutes after landing.** With **5 minutes cool down** enabled, asking the FO to shut an engine down before the cooling period has elapsed is refused with "five minutes not passed". The countdown starts automatically at the 70 knot call.

### Shutdown

- After the last passenger leaves (if shutting the aircraft down), say "Secure the aircraft". The FO switches the crew oxygen off, all exterior lights off, the APU bleed off, the APU master off, the emergency exit lights off and both batteries off. When the APU was running, the batteries go off two minutes after the APU master, once the APU flap has closed.
- Then call for the SHUTDOWN checklist.

---

## Voice Commands

Speak these phrases clearly during flight. The FO uses partial matching — you don't need to be word‑perfect, but include the key phrase. **"Please" may be added before or after any command** ("please gear up", "gear up please").

Where a command takes a number, say it naturally: "two seven zero", "three hundred fifty", "one zero one three".

### Preflight Timer

| Say                                                                                     | What happens                                                             |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| "Let's prepare the aircraft" / "Let's prepare the flight" / "Let's set up the aircraft" | Starts the preflight countdown timer to help you track preparation time. |

### Launching Flows by Voice

| Say                                                                        | Flow launched                                            |
| -------------------------------------------------------------------------- | -------------------------------------------------------- |
| "Clear left" / "Clear on the left" / "Left side clear" / "Clear left side" | Clear Left flow                                          |
| "Before start procedure"                                                   | Before Start flow                                        |
| "Runway entry procedure" / "Clear to line up"                              | Before Takeoff flow                                      |
| "Takeoff"                                                                  | Takeoff flow                                             |
| "Flight controls check"                                                    | Flight controls sequence, then the next After Start hint |
| "Secure the aircraft"                                                      | Securing the Aircraft flow                               |

### Launching Checklists by Voice

| Say                                                       | Checklist launched          |
| --------------------------------------------------------- | --------------------------- |
| "Cockpit preparation checklist"                           | COCKPIT PREPARATION         |
| "Before start checklist"                                  | BEFORE START                |
| "After start checklist"                                   | AFTER START                 |
| "Taxi checklist"                                          | TAXI                        |
| "Departure change checklist"                              | DEPARTURE CHANGE            |
| "Lineup checklist"                                        | LINE-UP                     |
| "Approach checklist"                                      | APPROACH                    |
| "Landing checklist"                                       | LANDING                     |
| "After landing checklist"                                 | AFTER LANDING               |
| "Parking checklist"                                       | PARKING                     |
| "Shutdown checklist"                                      | SHUTDOWN                    |
| "Cancel checklist" / "Stop checklist" / "Abort checklist" | Aborts the active checklist |

### Gear

| Say         | What happens                                                      |
| ----------- | ----------------------------------------------------------------- |
| "Gear down" | Lowers the landing gear. **Speed must be at or below 255 knots.** |
| "Gear up"   | Raises the landing gear.                                          |

### Flaps

The FO will confirm speed limits before moving flaps while airborne.

| Say           | Flap Setting        | Max Speed (A319 / A320) | Max Speed (A321) |
| ------------- | ------------------- | ----------------------- | ---------------- |
| "Flaps zero"  | Flaps 0 (retracted) | —                       | —                |
| "Flaps one"   | Flaps 1             | 230 kts                 | 235 kts          |
| "Flaps two"   | Flaps 2             | 200 kts                 | 215 kts          |
| "Flaps three" | Flaps 3             | 185 kts                 | 195 kts          |
| "Flaps full"  | Flaps Full          | 177 kts                 | 190 kts          |

### Autopilot

| Say                                                     | What happens                                    |
| ------------------------------------------------------- | ----------------------------------------------- |
| "Autopilot on"                                          | Engages Autopilot 1.                            |
| "Set speed \_\_\_" / "Pull speed \_\_\_"                | Sets the commanded speed. "Knots" may be added. |
| "Pull speed"                                            | Pulls the speed knob (selected speed).          |
| "Manage speed"                                          | Pushes the speed knob (managed speed).          |
| "Set heading \_\_\_"                                    | Sets the commanded heading.                     |
| "Pull heading \_\_\_"                                   | Sets the heading and pulls the knob.            |
| "Pull heading"                                          | Pulls the heading knob (selected heading).      |
| "Manage nav"                                            | Pushes the heading knob (managed NAV).          |
| "Set altitude \_\_\_"                                   | Sets the commanded altitude in feet.            |
| "Set flight level \_\_\_"                               | Sets the commanded altitude as a flight level.  |
| "Altitude \_\_\_ pull" / "Flight level \_\_\_ pull"     | Sets the altitude and pulls the knob.           |
| "Altitude \_\_\_ manage" / "Flight level \_\_\_ manage" | Sets the altitude and pushes the knob.          |
| "Altitude pull" / "Flight level pull"                   | Pulls the altitude knob.                        |
| "Altitude manage" / "Flight level manage"               | Pushes the altitude knob.                       |
| "Press alt"                                             | Pushes the level-off pushbutton.                |
| "Arm approach"                                          | Arms APPR.                                      |
| "Arm localizer" / "Arm loc"                             | Arms LOC.                                       |

### Flight Director

| Say                           | What happens                                         |
| ----------------------------- | ---------------------------------------------------- |
| "Flight director on"          | Activates the Flight Director.                       |
| "Flight director off"         | Deactivates the Flight Director.                     |
| "Flight director off bird on" | Deactivates FD and selects TRK/FPA on the autopilot. |
| "Bird on"                     | Selects TRK/FPA on the autopilot.                    |
| "Bird off"                    | Deselects TRK/FPA on the autopilot.                  |

### Altimeter

| Say                          | What happens                                                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| "Set standard"               | Sets STD on both sides. In the climb the FO calls "standard crosschecked, passing flight level \_\_\_", then "now" as the level is reached. |
| "Set altimeters" / "Set QNH" | Sets the altimeters to the current QNH.                                                                                                     |

### Missed Approach Altitude

| Say                                                       | What happens                                                    |
| --------------------------------------------------------- | --------------------------------------------------------------- |
| "Set go around altitude" / "Set missed approach altitude" | Uses the missed approach altitude from the Landing Plan window. |
| "Set go around altitude \_\_\_ feet"                      | Sets an explicit altitude in feet.                              |
| "Set go around altitude flight level \_\_\_"              | Sets an explicit flight level.                                  |

The FO reads the altitude back — "go around altitude, four thousand, feet set".

### Lights

| Say                 | What happens                 |
| ------------------- | ---------------------------- |
| "Landing light on"  | Turns on landing lights.     |
| "Landing light off" | Turns off landing lights.    |
| "Taxi light on"     | Turns on nose taxi light.    |
| "Taxi light off"    | Turns off nose taxi light.   |
| "Takeoff light on"  | Turns on nose takeoff light. |
| "Strobe light on"   | Turns on strobes.            |
| "Strobe light auto" | Sets strobes to AUTO.        |
| "Strobe light off"  | Turns off strobes.           |

### Engine Anti‑Ice

| Say                   | What happens                               |
| --------------------- | ------------------------------------------ |
| "Engine anti ice on"  | Turns on engine anti‑ice for both engines. |
| "Engine anti ice off" | Turns off engine anti‑ice.                 |

### Wing Anti‑Ice

| Say                 | What happens             |
| ------------------- | ------------------------ |
| "Wing anti ice on"  | Turns on wing anti‑ice.  |
| "Wing anti ice off" | Turns off wing anti‑ice. |

### Wipers

Wipers are refused above 230 knots unless you are selecting OFF.

| Say           | What happens     |
| ------------- | ---------------- |
| "Wipers off"  | Wipers off.      |
| "Wipers slow" | Slow continuous. |
| "Wipers fast" | Fast continuous. |

### Engines and APU

| Say                                                                                           | What happens                                                                         |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| "Starting engine one" / "Starting engine number one" / "Starting one" / "Starting number one" | You announce the start; the FO acknowledges with "check".                            |
| "Starting engine two" / "Starting engine number two" / "Starting two" / "Starting number two" | You announce the start; the FO acknowledges with "check".                            |
| "Shutdown engine two"                                                                         | Shuts down engine 2 for single-engine taxi and switches the yellow electric pump on. |
| "Start the apu" / "Start apu"                                                                 | Starts the APU.                                                                      |

### Cabin and Doors

| Say                                                               | What happens                                                   |
| ----------------------------------------------------------------- | -------------------------------------------------------------- |
| "Cabin crew arm slides" / "Cabin crew arm slides and cross check" | The FO makes the arm-slides PA; the cabin crew arm them.       |
| "Cabin crew disarm slides"                                        | The FO makes the disarm-slides PA; the cabin crew disarm them. |
| "Seat belts on"                                                   | Seat belt signs on.                                            |
| "Seat belts off"                                                  | Seat belt signs off.                                           |

### Brakes

| Say             | What happens                                                  |
| --------------- | ------------------------------------------------------------- |
| "Brake check"   | The FO answers "pressure zero".                               |
| "Brake fan on"  | Turns the brake fans on, if the aircraft is fitted with them. |
| "Brake fan off" | Turns the brake fans off.                                     |

If the aircraft has no brake fans, the FO answers "are you sure?" instead.

### Control Handover

| Say                | What happens                       |
| ------------------ | ---------------------------------- |
| "You have control" | The FO answers "I have control".   |
| "I have control"   | The FO answers "you have control". |

### Takeoff and Go‑Around

| Say               | What happens                                                           |
| ----------------- | ---------------------------------------------------------------------- |
| "Takeoff"         | Runs the Takeoff flow.                                                 |
| "Stop"            | Rejected takeoff — the FO calls reverse green, then decel or no decel. |
| "Go around flaps" | Retracts one flap stage and re-arms the after takeoff flow.            |
| "Continue"        | Acknowledged at minima.                                                |

### Ground Engineer

Call the ground engineer first — the rest are only answered once the interphone call has been made.

| Say                                          | What happens                            |
| -------------------------------------------- | --------------------------------------- |
| "Ground from cockpit" / "Cockpit to ground"  | The ground engineer answers "go ahead". |
| "Connect GPU" / "Connect ground power"       | Connects ground power.                  |
| "Disconnect GPU" / "Disconnect ground power" | Disconnects ground power.               |
| "Connect air conditioner"                    | Connects the air conditioning unit.     |
| "Disconnect air conditioner"                 | Disconnects the air conditioning unit.  |
| "Disconnect all" / "Disconnect all services" | Disconnects everything.                 |
| "We are ready for pushback"                  | Requests pushback.                      |

### FMA Callouts

The FMA can be read out loud as the PF ("man toga, srs, runway, autothrust blue"). The FO recognises the standard thrust, vertical, lateral, approach and armed mode wording, including "man flex" with a flex temperature.

---

## Checklist Responses

During a challenge/response checklist the FO reads each item and waits for your answer. **"Set and checked" is accepted for every item**, and items marked _auto_ are verified silently without a spoken response.

Some items are also verified against the aircraft — if the switch is not actually set, the FO answers "are you sure?" and, depending on the **Hold checklist on incorrect item** setting, either repeats the challenge or moves on.

The answers that carry numbers — speeds, altimeter settings, minimums, the runway, fuel — are only understood **while a checklist is running**. They are readbacks, not commands: saying them at any other time does nothing.

### Cockpit Preparation

| Item                 | Say                                                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gear Pins and Covers | "removed"                                                                                                                                                        |
| Fuel Quantity        | "fuel quantity \_\_\_ kilograms / pounds / tons", optionally "balanced". The short forms "tons" / "kilograms" / "pounds" also match.                             |
| Seat Belts           | "on" — verified against the seat belt switch                                                                                                                     |
| ADIRS                | "nav" — verified against all three IR mode selectors                                                                                                             |
| Barometric Reference | "altimeter \_\_\_\_ set" / "QNH \_\_\_\_ set" / "\_\_\_\_ set" / "set" — the FO reads the setting back. inHg (2700–3100) and hPa (900–1100) are both understood. |

### Before Start

| Item                      | Say                                                                                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parking Brake             | "set" — verified against the parking brake                                                                                                                        |
| Takeoff Speeds and Thrust | "V1 \_\_\_ VR \_\_\_ V2 \_\_\_ flex \_\_" or "V1 \_\_\_ VR \_\_\_ V2 \_\_\_ toga" — all three speeds and the thrust setting must be said; the FO reads them back. |
| Windows                   | "closed" — verified against both side windows; the FO answers "closed" too                                                                                        |
| Beacon                    | "on" — verified against the beacon switch                                                                                                                         |

### After Start

| Item             | Say                                                                                                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anti Ice         | "engines on" / "engines on wings on" / "off"                                                                                                                                                                        |
| ECAM Status      | "checked"                                                                                                                                                                                                           |
| Pitch Trim       | the takeoff CG, e.g. "twenty eight point nine percent" or "two eight point nine percent" — checked against the loadsheet CG, and the trim wheel against the PERF TO THS (or the trim for that CG when THS is blank) |
| Rudder Trim      | "neutral" / "zero" — verified against the rudder trim                                                                                                                                                               |
| Ground Clearance | "received" — the FO answers "received" too                                                                                                                                                                          |

### Taxi

| Item             | Say                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| Flight Controls  | "checked" — the FO answers "checked" too                                                          |
| Flap Settings    | "config one" / "config one plus f" / "config two" / "config three" — the FO reads the config back |
| Radar & PRED W/S | "on and auto" — checked against the radar system switch (not OFF) and PWS (AUTO)                  |
| ENG Mode Sel     | "normal" / "ignition" — checked against the engine mode selector                                  |
| ECAM Memo        | "takeoff no blue"                                                                                 |

### Departure Change

| Item                      | Say                                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Runway and SID            | "set and checked"                                                                                          |
| Flap Settings             | "config one" / "config one plus f" / "config two" / "config three" — the FO reads the config back          |
| Takeoff Speeds and Thrust | "V1 \_\_\_ VR \_\_\_ V2 \_\_\_ flex \_\_" or "V1 \_\_\_ VR \_\_\_ V2 \_\_\_ toga" — the FO reads them back |
| FCU ALT                   | "set"                                                                                                      |

### Line-Up

| Item           | Say                                                                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Takeoff Runway | The runway, then "confirmed" — e.g. "zero nine left confirmed". "Left", "right", "center" and "centre" are understood; the FO reads back the F-PLN departure runway. |
| TCAS           | "TA RA" / "TA only" — checked against the TCAS mode selector                                                                                                         |
| Packs Settings | "on" / "on supplied by apu" / "off"                                                                                                                                  |

### Approach

| Item                 | Say                                                                                                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Barometric Reference | "altimeter \_\_\_\_ set" / "QNH \_\_\_\_ set" / "\_\_\_\_ set" / "set" — the FO reads the setting back.                                                                      |
| Seat Belts           | "on" — checked against the seat belts sign                                                                                                                                   |
| Minimums Reference   | "baro \_\_\_ feet" or "radio \_\_\_ feet", as a number or digit by digit — e.g. "baro four hundred fifty feet" or "baro four five zero feet"; "no DH set" when there is none |
| Auto Brake           | "low" / "brake low" / "medium" / "brake medium" — checked against the autobrake ON light                                                                                     |
| ENG Mode Sel         | "normal" / "ignition" — checked against the engine mode selector                                                                                                             |

### Landing

The FO first checks spoilers armed, flaps in the landing config and gear down, and calls out anything that is not set.

| Item      | Say               |
| --------- | ----------------- |
| ECAM Memo | "landing no blue" |

### After Landing

| Item             | Say                                                                 |
| ---------------- | ------------------------------------------------------------------- |
| Radar & PRED W/S | "off" — checked against the radar system switch (OFF) and PWS (OFF) |

### Parking

| Item                    | Say                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| Slides                  | "disarmed" — checked against every door slide                                                     |
| Parking Brake or Chocks | "set" / "chocks in place" / "parking brake set" — checked against the parking brake or the chocks |
| Engines                 | "off" — checked against both engine masters                                                       |
| Fuel Pumps              | "off" — checked against all six fuel pumps                                                        |
| Yellow Elec Pump        | "off" — checked against the yellow electric pump                                                  |
| Wing Lights             | "off" — checked against the wing lights switch                                                    |

### Shutdown

| Item         | Say                                              |
| ------------ | ------------------------------------------------ |
| Oxygen       | "off" — checked against the crew oxygen supply   |
| Emer Exit Lt | "off" — checked against the emergency exit light |
| EFBs         | "off"                                            |
| Batteries    | "off" — checked against both batteries           |

---

## Tips & Troubleshooting

**The FO isn't hearing me**

- Check that your microphone is selected and working.
- Adjust the **Voice Sensitivity** setting.
- In Push-to-talk mode, check that a **PTT Button** is set and that the toolbar mic turns green while you hold it.

**My PTT or Mic On/Off key does nothing while MSFS has focus**

- MSFS is probably running as administrator. Run CrewMate as administrator too.

**The FO ignores everything I say before departure**

- Between T-44 and T-35 on the preflight timer the FO is outside on the walkaround and does not answer. The **FO outside** indicator is shown while this is the case. Ground engineer calls still work.

**The FO keeps repeating the challenge**

- Your response didn't match the expected phrase. Listen to the challenge and use one of the phrases listed in [Checklist Responses](#checklist-responses) (voice matching can be tuned in settings).
- If a physical switch must be set first (e.g., parking brake), set it in the cockpit before responding.

**The FO won't shut the engines down**

- The **5 minutes cool down** setting holds engine shutdown until five minutes have passed since landing, and the FO says "five minutes not passed". Wait, or switch the setting off.

**The Voice Trainer says training failed**

- "Value does not fall within the expected range" means Windows has no speech profile for your account. Run Windows Speech Recognition setup once, then start the trainer again.
- The trainer also needs the Windows Display Language set to EN‑US while it runs.

**How do I stop a checklist mid‑way?**

- Say **"Cancel checklist"**, **"Stop checklist"**, or **"Abort checklist"** at any time.

**Can I run flows and checklists manually without voice?**

- Yes. Both can be triggered from the **Flows** and **Checklist** panels in the app UI.

---
