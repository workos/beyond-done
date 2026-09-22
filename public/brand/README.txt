TYPED VOID — LOGOMARK
=====================

:0  A type annotation whose type is the void.

A colon, then a heavy zero cut through by the void. The slash of the slashed
zero is never drawn; it is the gap. The counter stays empty and the two
crescents never touch. The mark is one colour.

FILES
-----
mark.svg        Adapts to light/dark (CSS media query inside the file)
mark-ink.svg    Ink, for light backgrounds
mark-paper.svg  Paper, for dark backgrounds

The site renders the same geometry inline from src/components/BrandMark.astro,
where it follows currentColor.

COLOUR
------
The mark is always one colour: Ink #221c33 on light, Paper #f1eef8 on dark.
Brand purple #724bb7 (oklch 0.52 0.18 294) belongs to the interface, not the
mark. Teal #17b897 is secondary and never touches the mark.

CONSTRUCTION (100-unit square)
------------------------------
Colon    two dots, radius 7, at (13, 38) and (13, 62)
Ring     ellipse 26 x 34 at (62, 50), stroke 18 (outer 35 x 43, inner 17 x 25)
Cut      through (62, 50) along direction (48, -76), 9 units wide
Corners  the four cut corners are rounded to radius 5

The ring is drawn as two crescent paths, not a masked ellipse. Each path is
the crescent eroded by 5 units; it is filled and stroked 10 units wide with
round joins, which dilates it back and rounds the corners. The second crescent
is the first rotated 180 degrees about (62, 50). Scale the file; never redraw
the crescents by eye.

Crescent path:
  M 86.77 28.57 A 30 38 0 0 1 50.93 85.32 L 55.21 78.54 A 22 30 0 0 0 81.69 36.62 Z

Minimum 16px on screen. Clear space: 25% of the mark height on all sides.

WORDMARK
--------
"typed void", lowercase, Bricolage Grotesque 800, letter-spacing -0.03em,
set at 85% of the mark height with a gap of 35% of that height. In code-
adjacent contexts, JetBrains Mono 700.

NEVER
-----
Rotate it. Stretch it. Close the cut. Draw a slash into the counter. Drop the
colon. Recolour parts of it. Flip the diagonal (it runs bottom-left to
top-right like a slashed zero, never like a prohibition sign).
