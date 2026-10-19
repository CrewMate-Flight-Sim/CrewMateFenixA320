# TODO

Ideas and half-finished work, roughly in order of payoff.

## Explicitly not doing

- **FO seat movement** — MSFS does not move the copilot model with the seat, so
  only the chair slides and it looks wrong (found on the A350).
- **Fuel readback in tonnes** — the PF reads the fuel, not the FO.
  `point.ogg` and `tons.ogg` stay unused.
- **ECAM / abnormal procedures** — out of scope for the FO.
- **Approach briefing readback** — the briefing is the user's job.
- **GSX pushback direction and good engine start** — GSX only takes these
  through its menu, which changes with GSX updates. No variable answers the
  good engine start question (`L:FSDT_GSX_SET_GOOD_ENGINE_START` only turns it
  on or off). Revisit only if GSX exposes one.
