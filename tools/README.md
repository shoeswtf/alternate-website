# tools

Helper scripts for the diagram assets on the fitting page.

## `extract_foot_svg.py`

Traces a **colour-coded bone diagram** (each bone group painted one flat
colour) into a layered SVG. This is how the top-view foot skeleton in
`../fitting.html` was produced from a reference image of the right foot:

| Colour | Bones |
|--------|-------|
| rust   | phalanges |
| yellow | metatarsals |
| cyan   | navicular, cuboid, cuneiforms (auto-classified by position) |
| green  | talus |
| purple | calcaneus |

```bash
pip install pillow numpy scikit-image
python3 tools/extract_foot_svg.py --input "foot bones.jpg" --output foot.svg
```

Tune `--tolerance` if the palette differs, `--min-area` / `--polygon-tol`
for blob cleanup and path smoothing. The output groups use
`data-bone="..."`, matching the scroll-highlight logic in
`assets/js/main.js`.

The side-view skeleton on the same page is hand-fitted: its reference
image has labelled leader lines sharing the bone palette, so automatic
segmentation is unreliable there — the outer silhouette is traced the
same way and the individual bones are drawn to match.
