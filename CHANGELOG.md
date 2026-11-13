# Changelog

## [0.9.1] - 2026-11-13

- Engine cool down was 5 minutes; it is now 3 minutes - @marxio09dio
- Cool down call played after the engines were already shut down; the timer now stops silently once both engines are off - @marxio09dio
- "Not passed" warning could play twice after landing; it now plays once per landing - @marxio09dio
- FO rushed on right after switching on external power; the FO now waits 5 seconds - @marxio09dio
- FO always started the APU in the preliminary cockpit preparation; with external power on, the APU is now left to the PF - @marxio09dio
- APU fire test ended before the bell rang; the button is now held longer and the FO calls it as the test starts - @marxio09dio
- Flight controls check could miss an input made while the FO was talking, so it had to be repeated; those inputs now count - @marxio09dio
- Yellow electric pump was not switched correctly and failed the parking checklist; the FO now presses the button, and the flow and checklist read its light - @marxio09dio
- "Start the APU" only pressed the start button correctly the first time; it now works every time - @marxio09dio

## [0.9.0]

- First public release - @marxio09dio
