# Inspection Notes

The model was iterated with fixed camera renders:

- `front`: nose/cockpit shape and four-engine symmetry
- `side`: 747 upper-deck hump, fuselage length, landing gear stance
- `top`: swept wings, tailplane and winglet proportions
- `rear`: vertical stabilizer, horizontal stabilizer and nacelle alignment
- `quarter`: overall silhouette and material readability

Final visible criteria:

- Distinct 747 hump and short upper deck taper.
- Long wide-body fuselage with tapered nose and tail cone.
- Four under-wing high-bypass turbofans with pylons, intakes, spinners and fan blades.
- Swept main wings with upturned winglets.
- Tall swept vertical stabilizer and swept horizontal stabilizers.
- Passenger windows, upper-deck windows, cockpit windscreens, doors, cheatlines, panel rings and landing gear.
- Repeatable screenshot system for every required inspection angle.

## Iteration Log

1. Built the first procedural model with a fuselage, 747 hump, swept wings, four engines, tail, gear, windows and inspection cameras.
2. Rendered fixed views and found the least realistic problems: cone-like nose/tail caps and a livery stripe that wrapped as a vertical band.
3. Replaced the fuselage with a smooth lathed wide-body shell and converted markings into side cheatlines.
4. Rendered again and found protruding window geometry; converted windows and doors to flush planes.
5. Rendered again and found front/rear inspection labels were reversed by the presentation rotation; corrected the camera system.
6. Added visible tail livery, wing panel lines, navigation lights and engine exhausts, then preserved the final render set.
