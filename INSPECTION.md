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
- Cambered swept main wings with dihedral, underwing fairings and upturned winglets.
- Tall swept vertical stabilizer and swept horizontal stabilizers.
- Passenger windows, upper-deck windows, cockpit windscreens, doors, cheatlines, panel rings and landing gear.
- Repeatable screenshot system for every required inspection angle.
- Preserved final inspection renders in `inspection-renders/`.

Strategy switched after loop 21 from small polish tweaks to structural procedural
geometry. The current version is still hand-built in Three.js, but it now uses a
custom wing mesh, unified cockpit window geometry and modeled engine pylons.

## Iteration Log

1. Built the first procedural model with a fuselage, 747 hump, swept wings, four engines, tail, gear, windows and inspection cameras.
2. Rendered fixed views and found the least realistic problems: cone-like nose/tail caps and a livery stripe that wrapped as a vertical band.
3. Replaced the fuselage with a smooth lathed wide-body shell and converted markings into side cheatlines.
4. Rendered again and found protruding window geometry; converted windows and doors to flush planes.
5. Rendered again and found front/rear inspection labels were reversed by the presentation rotation; corrected the camera system.
6. Added visible tail livery, wing panel lines, navigation lights and engine exhausts, then preserved the render set.
7. Added cockpit windscreen panes, radome seam and pitot probes; render review found a floating-looking nose detail.
8. Moved the windscreen and radome details tighter onto the nose surface.
9. Reduced landing gear scale and added hubs/bogie beams so the gear looked less oversized.
10. Rebuilt the engine nacelles as tapered lathed turbofans with intake lips and exhaust rings.
11. Added dorsal tail-root fairing and tail-end details; review found tail-end artifacts.
12. Removed the detached-looking APU dot.
13. Removed the tail skid artifact that read as floating geometry.
14. Added `747-400` and `N747CL` markings using canvas text planes.
15. Replaced filled passenger doors with subtle outline doors.
16. Made glass double-sided so cockpit and window panes render from both sides.
17. Replaced the square tail logo with a slanted livery panel.
18. Added a concrete airport apron, expansion grid and taxiway line for grounding/context.
19. Moved the taxiway line off the aircraft so the top-view inspection was unobstructed.
20. Added visible turbofan faces and brighter fan blades to improve the front engine view.
21. Replaced blocky rectangular winglets with swept, slightly thickened winglet geometry.
22. Replaced the flat extruded wing slab with a custom cambered airfoil mesh.
23. Reduced and lowered the airfoil so it fit under the fuselage and restored fuselage readability.
24. Removed overlapping cockpit decals and rebuilt the cockpit with framed forward/side panes.
25. Replaced boxy engine pylons with swept plate-style pylon fairings.
26. Added underwing flap-track canoe fairings to make the wing underside less bare.
