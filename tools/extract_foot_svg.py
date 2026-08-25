#!/usr/bin/env python3
"""Trace color-coded bone diagrams into layered SVG paths.

Built for "foot bones.jpg", a top-view diagram of the right foot where each
bone group is painted a flat, distinct colour:

    rust   -> phalanges        green  -> talus
    yellow -> metatarsals      purple -> calcaneus
    cyan   -> navicular + cuboid + cuneiforms

Pipeline per colour:
    1. mask pixels within --tolerance RGB distance of the palette colour
    2. drop specks (remove_small_objects), open with a small disk,
       fill pinholes (remove_small_holes)
    3. per connected component: crop, pad (so contours close at crop
       edges), gaussian-smooth, find_contours at 0.5, simplify with
       approximate_polygon

The cyan components are auto-classified by position into navicular
(highest, most medial), cuboid (most lateral) and cuneiforms (the rest).
Output is a standalone SVG whose groups carry data-bone="..." attributes
matching the scroll-highlight script on the fitting page.

Usage:
    python3 extract_foot_svg.py --input "foot bones.jpg" --output foot.svg

Requires: pillow, numpy, scikit-image   (pip install pillow numpy scikit-image)
"""

import argparse
import numpy as np
from PIL import Image
from skimage import measure, morphology, filters

PALETTE = {
    "phalanges":    (194, 89, 58),   # rust
    "metatarsals":  (244, 217, 68),  # yellow
    "midfoot-cyan": (4, 163, 215),   # navicular/cuboid/cuneiforms
    "talus":        (157, 190, 93),  # green
    "calcaneus":    (100, 72, 125),  # purple
}

SMALL_AREA = {"phalanges": 150}  # toe tips are tiny; keep them


def base_mask(img, rgb, tolerance):
    d = np.sqrt(((img - np.array(rgb)) ** 2).sum(axis=-1))
    return d < tolerance


def trace(mask, min_area, sigma, poly_tol, pad):
    mask = morphology.remove_small_objects(mask, min_area)
    mask = morphology.opening(mask, morphology.disk(2))
    mask = morphology.remove_small_holes(mask, 800)
    lab = measure.label(mask)
    paths = []
    for p in measure.regionprops(lab):
        if p.area < min_area:
            continue
        y0, x0, y1, x1 = p.bbox
        sub = (lab[y0:y1, x0:x1] == p.label).astype(float)
        sub = np.pad(sub, pad)
        if sigma:
            sub = filters.gaussian(sub, sigma=sigma)
        cs = measure.find_contours(sub, 0.5)
        c = max(cs, key=len)
        c = measure.approximate_polygon(c, tolerance=poly_tol)
        paths.append([(x + x0 - pad, y + y0 - pad) for y, x in c])
    return paths


def centroid(pts):
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return sum(xs) / len(xs), sum(ys) / len(ys)


def classify_cyan(comps):
    """comps: list of (idx, cx, cy). Returns (nav_i, cub_i, [cun...])."""
    nav = max(comps, key=lambda t: t[2] - 0.5 * t[1])[0]
    cub = max(comps, key=lambda t: t[1])[0]
    cun = sorted([t for t in comps if t[0] not in (nav, cub)], key=lambda t: t[1])
    return nav, cub, [t[0] for t in cun]


def main():
    ap = argparse.ArgumentParser(description="Trace a colour-coded bone diagram to SVG.")
    ap.add_argument("--input", required=True, help="source image (JPG/PNG)")
    ap.add_argument("--output", default="foot_paths.svg", help="destination SVG")
    ap.add_argument("--tolerance", type=float, default=60.0,
                    help="RGB distance threshold for palette matching")
    ap.add_argument("--min-area", type=int, default=400,
                    help="smallest blob kept (px); toe tips use half this")
    ap.add_argument("--smooth", type=float, default=3.0, help="gaussian sigma")
    ap.add_argument("--polygon-tol", type=float, default=3.0,
                    help="polygon simplification tolerance (px)")
    ap.add_argument("--pad", type=int, default=16,
                    help="crop padding that keeps edge contours closed")
    ap.add_argument("--viewbox-pad", type=int, default=18,
                    help="margin added around the viewBox")
    args = ap.parse_args()

    img = np.asarray(Image.open(args.input).convert("RGB"), dtype=np.int16)

    groups = {}
    for name, rgb in PALETTE.items():
        groups[name] = trace(base_mask(img, rgb, args.tolerance),
                             SMALL_AREA.get(name, args.min_area),
                             args.smooth, args.polygon_tol, args.pad)
        print(f"{name}: {len(groups[name])} paths")

    cyan = groups.pop("midfoot-cyan")
    cents = [(i, *centroid(pts)) for i, pts in enumerate(cyan)]
    nav_i, cub_i, cun_is = classify_cyan(cents)
    print(f"cyan -> navicular=#{nav_i} cuboid=#{cub_i} cuneiforms={cun_is}")

    order = [
        ("calcaneus",   groups["calcaneus"]),
        ("talus",       groups["talus"]),
        ("navicular",   [cyan[nav_i]]),
        ("cuboid",      [cyan[cub_i]]),
        ("cuneiforms",  [cyan[i] for i in cun_is]),
        ("metatarsals", groups["metatarsals"]),
        ("phalanges",   groups["phalanges"]),
    ]

    all_pts = [p for _, pts_list in order for pts in pts_list for p in pts]
    ox = min(p[0] for p in all_pts)
    oy = min(p[1] for p in all_pts)
    w = max(p[0] for p in all_pts) - ox + 2 * args.viewbox_pad
    h = max(p[1] for p in all_pts) - oy + 2 * args.viewbox_pad
    print(f"viewBox: 0 0 {w:.0f} {h:.0f}  (aspect {w / h:.3f})")

    out = [f'<svg class="foot-svg" viewBox="0 0 {w:.0f} {h:.0f}" role="img"\n',
           '     aria-label="Diagram of the bones of the right foot, seen from above">\n']
    for gid, pts_list in order:
        out.append(f'  <g class="bone" data-bone="{gid}">\n')
        for pts in pts_list:
            d = "M" + " L".join(
                f"{x - ox + args.viewbox_pad:.0f},{y - oy + args.viewbox_pad:.0f}"
                for x, y in pts) + "Z"
            out.append(f'    <path d="{d}"/>\n')
        out.append('  </g>\n')
    out.append('</svg>\n')

    with open(args.output, "w") as f:
        f.writelines(out)
    n = sum(len(pts_list) for _, pts_list in order)
    print(f"wrote {args.output}: {n} paths")


if __name__ == "__main__":
    main()
