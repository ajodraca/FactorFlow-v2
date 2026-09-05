#!/usr/bin/env python3
"""Validate the FactorFlow theme palette, per STD-UI-10.

Three checks the rule names:
  1. adjacent-pair separation under colour-vision deficiency
  2. adjacent-pair separation under normal vision
  3. contrast against the surface the colour is used on

Colour science, all standard and implemented here so the record is reproducible
without a dependency:
  * sRGB -> linear -> CIEXYZ (D65) -> CIELAB
  * CIEDE2000 colour difference (CIE 142-2001)
  * WCAG 2.1 relative luminance and contrast ratio
  * Vienot, Brettel & Mollon (1999) dichromat simulation, applied to linear RGB

Usage: python3 validate-theme.py [path-to-theme.css]
"""
import math
import re
import sys

# ── CSS parsing ──────────────────────────────────────────────────────────

TOKEN = re.compile(r"^\s*(--[a-z0-9-]+)\s*:\s*([0-9.]+)\s+([0-9.]+)%\s+([0-9.]+)%\s*;", re.M)


def parse_blocks(css):
    """Return {block_name: {token: (h, s, l)}} for :root and .dark."""
    blocks = {}
    for name, start in (("light", ":root {"), ("dark", ".dark {")):
        i = css.find(start)
        if i < 0:
            continue
        body = css[i + len(start):]
        body = body[:body.find("\n}")]
        blocks[name] = {m.group(1): (float(m.group(2)), float(m.group(3)), float(m.group(4)))
                        for m in TOKEN.finditer(body)}
    return blocks


# ── colour conversions ───────────────────────────────────────────────────

def hsl_to_srgb(h, s, l):
    h, s, l = h / 360.0, s / 100.0, l / 100.0
    if s == 0:
        return (l, l, l)
    q = l * (1 + s) if l < 0.5 else l + s - l * s
    p = 2 * l - q

    def hue(t):
        t = t % 1.0
        if t < 1 / 6:
            return p + (q - p) * 6 * t
        if t < 1 / 2:
            return q
        if t < 2 / 3:
            return p + (q - p) * (2 / 3 - t) * 6
        return p
    return (hue(h + 1 / 3), hue(h), hue(h - 1 / 3))


def to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def to_srgb(c):
    c = max(0.0, min(1.0, c))
    return 12.92 * c if c <= 0.0031308 else 1.055 * (c ** (1 / 2.4)) - 0.055


def linear_to_xyz(r, g, b):
    return (0.4124564 * r + 0.3575761 * g + 0.1804375 * b,
            0.2126729 * r + 0.7151522 * g + 0.0721750 * b,
            0.0193339 * r + 0.1191920 * g + 0.9503041 * b)


D65 = (0.95047, 1.00000, 1.08883)


def xyz_to_lab(x, y, z):
    def f(t):
        return t ** (1 / 3) if t > 216 / 24389 else (841 / 108) * t + 4 / 29
    fx, fy, fz = f(x / D65[0]), f(y / D65[1]), f(z / D65[2])
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))


def hsl_to_lab(hsl):
    lin = [to_linear(c) for c in hsl_to_srgb(*hsl)]
    return xyz_to_lab(*linear_to_xyz(*lin))


def relative_luminance(hsl):
    r, g, b = (to_linear(c) for c in hsl_to_srgb(*hsl))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_ratio(a, b):
    la, lb = relative_luminance(a), relative_luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


# ── CIEDE2000 (CIE 142-2001) ─────────────────────────────────────────────

def ciede2000(lab1, lab2):
    l1, a1, b1 = lab1
    l2, a2, b2 = lab2
    kl = kc = kh = 1.0
    c1 = math.hypot(a1, b1)
    c2 = math.hypot(a2, b2)
    cbar = (c1 + c2) / 2
    g = 0.5 * (1 - math.sqrt(cbar ** 7 / (cbar ** 7 + 25.0 ** 7))) if cbar > 0 else 0.0
    a1p, a2p = (1 + g) * a1, (1 + g) * a2
    c1p, c2p = math.hypot(a1p, b1), math.hypot(a2p, b2)
    h1p = math.degrees(math.atan2(b1, a1p)) % 360 if (a1p or b1) else 0.0
    h2p = math.degrees(math.atan2(b2, a2p)) % 360 if (a2p or b2) else 0.0

    dlp = l2 - l1
    dcp = c2p - c1p
    if c1p * c2p == 0:
        dhp = 0.0
    else:
        diff = h2p - h1p
        if diff > 180:
            diff -= 360
        elif diff < -180:
            diff += 360
        dhp = diff
    dHp = 2 * math.sqrt(c1p * c2p) * math.sin(math.radians(dhp) / 2)

    lbar = (l1 + l2) / 2
    cbarp = (c1p + c2p) / 2
    if c1p * c2p == 0:
        hbarp = h1p + h2p
    else:
        d = abs(h1p - h2p)
        s = h1p + h2p
        if d <= 180:
            hbarp = s / 2
        elif s < 360:
            hbarp = (s + 360) / 2
        else:
            hbarp = (s - 360) / 2

    t = (1
         - 0.17 * math.cos(math.radians(hbarp - 30))
         + 0.24 * math.cos(math.radians(2 * hbarp))
         + 0.32 * math.cos(math.radians(3 * hbarp + 6))
         - 0.20 * math.cos(math.radians(4 * hbarp - 63)))
    dtheta = 30 * math.exp(-(((hbarp - 275) / 25) ** 2))
    rc = 2 * math.sqrt(cbarp ** 7 / (cbarp ** 7 + 25.0 ** 7)) if cbarp > 0 else 0.0
    sl = 1 + (0.015 * (lbar - 50) ** 2) / math.sqrt(20 + (lbar - 50) ** 2)
    sc = 1 + 0.045 * cbarp
    sh = 1 + 0.015 * cbarp * t
    rt = -math.sin(math.radians(2 * dtheta)) * rc

    return math.sqrt((dlp / (kl * sl)) ** 2
                     + (dcp / (kc * sc)) ** 2
                     + (dHp / (kh * sh)) ** 2
                     + rt * (dcp / (kc * sc)) * (dHp / (kh * sh)))


# ── dichromat simulation, Vienot/Brettel/Mollon 1999 ─────────────────────

RGB_TO_LMS = ((17.8824, 43.5161, 4.11935),
              (3.45565, 27.1554, 3.86714),
              (0.0299566, 0.184309, 1.46709))
LMS_TO_RGB = ((0.0809444479, -0.130504409, 0.116721066),
              (-0.0102485286, 0.0540193266, -0.113614708),
              (-0.000365296938, -0.00412161469, 0.693511405))
DICHROMAT = {
    "protanopia":   ((0.0, 2.02344, -2.52581), (0.0, 1.0, 0.0), (0.0, 0.0, 1.0)),
    "deuteranopia": ((1.0, 0.0, 0.0), (0.494207, 0.0, 1.24827), (0.0, 0.0, 1.0)),
    "tritanopia":   ((1.0, 0.0, 0.0), (0.0, 1.0, 0.0), (-0.395913, 0.801109, 0.0)),
}


def mul(m, v):
    return tuple(sum(m[i][j] * v[j] for j in range(3)) for i in range(3))


def simulate(hsl, kind):
    lin = tuple(to_linear(c) for c in hsl_to_srgb(*hsl))
    lms = mul(RGB_TO_LMS, lin)
    lms = mul(DICHROMAT[kind], lms)
    lin2 = mul(LMS_TO_RGB, lms)
    srgb = tuple(to_srgb(c) for c in lin2)
    return xyz_to_lab(*linear_to_xyz(*(to_linear(c) for c in srgb)))


VISIONS = ("normal", "protanopia", "deuteranopia", "tritanopia")


def lab_under(hsl, vision):
    return hsl_to_lab(hsl) if vision == "normal" else simulate(hsl, vision)


# ── what to check ────────────────────────────────────────────────────────

# Groups whose members appear alongside one another and must stay separable.
GROUPS = [
    ("Status severity tiers (STD-UI-12)", "all-pairs", [
        "--status-neutral", "--status-active", "--status-good",
        "--status-warning", "--status-serious", "--status-critical"]),
    ("Coverage presence states (STD-UI-14)", "all-pairs", [
        "--status-good", "--value-missing", "--value-indeterminate"]),
    ("Direction and measured zero (STD-UI-7)", "all-pairs", [
        "--gain", "--loss", "--neutral-value"]),
    ("Factor classification", "all-pairs", [
        "--factor-momentum", "--factor-value", "--factor-growth"]),
    ("Risk channel vs destructive (STD-UI-11)", "all-pairs", [
        "--risk-paper", "--risk-real-money", "--destructive"]),
    ("Categorical chart ramp (STD-UI-27)", "all-pairs", [
        "--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5", "--chart-6"]),
    ("Sequential ramp, consecutive steps (STD-UI-7)", "consecutive", [
        "--seq-1", "--seq-2", "--seq-3", "--seq-4", "--seq-5"]),
    ("Status vs direction, the adjacency theme.css records", "all-pairs", [
        "--status-serious", "--loss"]),
]

# (foreground, background, minimum, why) — minimums from WCAG 2.1 AA via STD-UI-24.
def contrast_pairs():
    pairs = [
        ("--foreground", "--background", 4.5, "body text"),
        ("--muted-foreground", "--background", 4.5, "table header text"),
        ("--card-foreground", "--card", 4.5, "card body text"),
        ("--primary-foreground", "--primary", 4.5, "primary button label"),
        ("--secondary-foreground", "--secondary", 4.5, "secondary button label"),
        ("--destructive-foreground", "--destructive", 4.5, "destructive button label"),
        ("--factor-foreground", "--factor-momentum", 4.5, "factor badge label"),
        ("--factor-foreground", "--factor-value", 4.5, "factor badge label"),
        ("--factor-foreground", "--factor-growth", 4.5, "factor badge label"),
        ("--risk-foreground", "--risk-paper", 4.5, "paper badge label"),
        ("--risk-foreground", "--risk-real-money", 4.5, "real-money badge label"),
        ("--gain", "--gain-muted", 4.5, "gain badge label"),
        ("--loss", "--loss-muted", 4.5, "loss badge label"),
        ("--neutral-value", "--background", 4.5, "measured zero in a cell"),
        ("--value-missing", "--background", 4.5, "missing marker in a cell"),
        ("--value-indeterminate", "--background", 4.5, "indeterminate marker in a cell"),
        ("--border", "--background", 3.0, "table rule and input boundary"),
        ("--ring", "--background", 3.0, "focus ring"),
        ("--chart-axis", "--background", 3.0, "chart axis"),
        ("--chart-grid", "--background", 3.0, "chart gridline"),
    ]
    for tier in ("neutral", "active", "good", "warning", "serious", "critical"):
        pairs.append((f"--status-{tier}", f"--status-{tier}-muted", 4.5,
                      f"{tier} status badge label"))
        pairs.append((f"--status-foreground", f"--status-{tier}", 4.5,
                      f"{tier} status on a solid ground"))
    return pairs


JND = 1.0  # CIEDE2000 just-noticeable difference, CIE 142-2001.


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    path = args[0] if args else "theme.css"
    css = open(path, encoding="utf-8").read()
    blocks = parse_blocks(css)
    out = []
    w = out.append

    w("<!-- GENERATED by validate-theme.py. Do not edit above the Interpretation")
    w("     section; regenerate with:  python3 validate-theme.py theme.css -->")
    w("")
    w("# Theme palette validation")
    w("")
    w("The record STD-UI-10 requires: adjacent-pair separation under colour-vision")
    w("deficiency, separation under normal vision, and contrast against the surface.")
    w("")
    w("Method, all standard and implemented in `validate-theme.py` without a")
    w("dependency so the record is reproducible: sRGB to linear to CIEXYZ (D65) to")
    w("CIELAB; CIEDE2000 colour difference (CIE 142-2001); WCAG 2.1 relative")
    w("luminance and contrast ratio; and dichromat simulation after Vienot, Brettel")
    w("and Mollon (1999) applied to linear RGB.")
    w("")
    w("Contrast minima are WCAG 2.1 AA, adopted as the project target by STD-UI-24:")
    w("4.5:1 for text, 3:1 for large text and interactive boundaries.")
    w("")
    w("**No pass threshold is applied to separation.** STD-UI-10 requires validation")
    w("and a record; it sets no numeric floor, and none is invented here. A CIEDE2000")
    w("difference of 1.0 is the just-noticeable difference, so a pair below it is")
    w("indistinguishable to the eye and a pair a few units above it is nearly so. The")
    w("figures are reported and the threshold is left to the owner.")
    w("")

    failures = []
    worst = {}

    for block, tokens in blocks.items():
        w(f"## {block.title()} theme")
        w("")
        w("### Contrast against surface")
        w("")
        w("| Foreground | Background | Ratio | Minimum | Verdict |")
        w("|---|---|---|---|---|")
        for fg, bg, minimum, why in contrast_pairs():
            if fg not in tokens or bg not in tokens:
                continue
            r = contrast_ratio(tokens[fg], tokens[bg])
            ok = r >= minimum
            if not ok:
                failures.append((block, fg, bg, r, minimum, why))
            w(f"| `{fg}` | `{bg}` | {r:.2f}:1 | {minimum}:1 | {'pass' if ok else '**FAIL**'} |")
        w("")
        w("### Pair separation, CIEDE2000")
        w("")
        for title, mode, members in GROUPS:
            members = [m for m in members if m in tokens]
            if len(members) < 2:
                continue
            w(f"**{title}**")
            w("")
            w("| Pair | Normal | Protanopia | Deuteranopia | Tritanopia |")
            w("|---|---|---|---|---|")
            pairs = ([(members[i], members[i + 1]) for i in range(len(members) - 1)]
                     if mode == "consecutive"
                     else [(members[i], members[j])
                           for i in range(len(members)) for j in range(i + 1, len(members))])
            for a, b in pairs:
                row = []
                for vision in VISIONS:
                    d = ciede2000(lab_under(tokens[a], vision), lab_under(tokens[b], vision))
                    row.append(d)
                    key = (block, title)
                    if key not in worst or d < worst[key][0]:
                        worst[key] = (d, a, b, vision)
                cells = " | ".join(f"{d:.1f}" if d >= JND else f"**{d:.1f}**" for d in row)
                w(f"| `{a}` / `{b}` | {cells} |")
            w("")

    w("## Summary")
    w("")
    w(f"**Contrast: {len(failures)} pair(s) below the WCAG 2.1 AA minimum.**")
    w("")
    if failures:
        w("| Theme | Pair | Used for | Ratio | Minimum |")
        w("|---|---|---|---|---|")
        for block, fg, bg, r, minimum, why in failures:
            w(f"| {block} | `{fg}` on `{bg}` | {why} | {r:.2f}:1 | {minimum}:1 |")
        w("")
    w("**Separation: weakest pair per group, ordered worst first.**")
    w("")
    w("| Difference | Theme | Group | Pair | Vision |")
    w("|---|---|---|---|---|")
    for (block, title), (d, a, b, vision) in sorted(worst.items(), key=lambda kv: kv[1][0]):
        mark = f"**{d:.1f}**" if d < JND else f"{d:.1f}"
        w(f"| {mark} | {block} | {title} | `{a}` / `{b}` | {vision} |")
    w("")
    print("\n".join(out))
    return 0


if __name__ == "__main__":
    sys.exit(main())
