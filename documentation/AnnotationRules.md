# PaperMd Annotation Rules
**Version 2.0 — Arrogant Pie**

## Class Schema

| ID | Class | Letters | Description |
|----|-------|---------|-------------|
| `0` | `Text` | 4 | Any plain handwritten text line |
| `1` | `Link` | 4 | Connecting arrow or line between two other annotated elements |
| `2` | `Table` | 5 | Grid of rows and columns |
| `3` | `Formula` | 7 | A standalone mathematical expression or equation |
| `4` | `Callout` | 7 | Text enclosed by a drawn shape |
| `5` | `List_Item` | 8 | A single item in a bulleted or numbered list |
| `6` | `Strikeout` | 9 | Crossed-out or explicitly cancelled content |
| `7` | `Chem_Formula` | 11 | Chemical structural formula — molecular diagrams, reaction equations |
| `8` | `Figure_Graph` | 11 | Plotted graph with axes — curves, bar charts, histograms |
| `9` | `Figure_Image` | 11 | Printed or pasted image — photograph, sticker, cut-out |
| `10` | `Figure_Sketch` | 12 | Freehand representational drawing — objects, diagrams, cross-sections |
| `11` | `Figure_Doodle` | 12 | Non-representational marks with no informational content |
| `12` | `Figure_Flowchart` | 15 | Node-and-edge diagram — flowchart, UML, mind map, concept map |
| `13` | `Figure_Electrical` | 16 | Circuit schematic using standard electrical symbols |


## On Styles: Headings, Underlines, Bold

Style attributes — underlines, bold strokes, circled words — are **not annotated as separate classes**. This is a deliberate design choice, not an omission.

YOLO detects regions. It cannot return per-token style flags, and subdividing an already small dataset into style variants would cut the effective sample count per class significantly, making the model harder to train. Styles are recovered at a later stage by post-processing the cropped line images that YOLO produces:

**Headings** are inferred from layout position: a `Text` line that sits isolated above a block of body text, or at the top of a page, is tagged as a heading by the post-processor. Size and underline are used as supporting signals. No separate annotation needed.

**Underlines** are detected by scanning the crop below the text baseline for a horizontal stroke with a consistent gap. This is a reliable image-processing heuristic that requires no training data.

**Bold / stroke weight** is detected by comparing the average stroke thickness of a line crop against the per-page median. Lines significantly heavier than the median are tagged bold.

The rule of thumb: **annotate what the content *is*, not how it *looks***. Role (list item, formula, body text) goes into the class. Appearance (underline, bold, heading level) comes out of post-processing.

## Class Rules

### Text (0)
The default class. Any written line that is not better described by another class.

- **One box per written line.** Do not group multiple lines into a paragraph box.
- A sentence containing inline math — "where *n* is the number of values" — is `Text`. Only use `Formula` when an expression stands alone on its own line or block.
- Handwritten code, pseudocode, and date headers are `Text`.
- A line with an underline, highlight, or circled words is still `Text`. Decoration does not change the class.
- Annotate with consistently loose boxes. Due to ascender/descender overlap between handwritten lines, boxes will clip adjacent ruled lines. This is acceptable; consistent loose boxes across all images are better than inconsistently tight ones.

### Link (1)
A connecting arrow or plain line drawn between two other annotated elements.

- Use only for connections between elements that are annotated separately — a line from a `Text` box to a `Figure_Sketch`, for example.
- Do not annotate arrows that are internal to a `Figure_Flowchart` or `Figure_Electrical` — those are part of the figure.
- Directionality is determined during extraction by detecting arrowheads at stroke endpoints. You do not need to record direction during annotation.
- A horizontal rule used as a section divider is not a `Link` — leave it unannotated.

### Table (2)
A grid of rows and columns — any tabular layout with visible or implied grid structure.

- One `Table` box covers the full outer boundary of the table.
- Also annotate elements inside cells using their own classes (`Text`, `Formula`, etc.). Nested annotation is intentional — the extraction stage reads cell contents directly.
- A grid drawn without text (e.g. a blank answer grid) is still `Table`.

### Formula (3)
A mathematical expression standing alone on its own line or block.

- **One bounding box covers the entire expression.** If an equation spans three lines, one box covers all three. Fragmentation into per-line boxes is the single most common annotation error and directly degrades inference quality.
- Inline math within a sentence — annotate the whole sentence as `Text`.

### Callout (4)
Text that the writer has enclosed with a drawn shape — circle, rectangle, cloud, bubble, underline-and-box.

- The enclosed content is text, not a drawing. That distinction separates `Callout` from a `Figure`.
- One box covers the drawn shape and its enclosed text together.
- Marginal notes written freely without an enclosing shape are `Text`, not `Callout`.

### List_Item (5)
A single entry in a bulleted or numbered list.

- One box per item. Do not group the whole list under one box.
- Include the bullet marker, dash, or number inside the bounding box.
- If a list item wraps to a second written line, extend the box to cover both lines. This is the only case where a single `List_Item` box spans more than one written line.

### Strikeout (6)
Content the writer has explicitly cancelled.

- A clear strike-through or deliberate scribble-out qualifies.
- A single horizontal stroke through a word or line is `Strikeout`. A stroke underneath text (underline) is not.
- When the underlying content is still readable, annotate the readable class first and additionally annotate a `Strikeout` box over it. When the content is fully obscured, annotate only `Strikeout`.
- When in doubt, use the underlying content class. `Strikeout` is for content the writer clearly intended to cancel.

### Chem_Formula (7)
A chemical structural formula or reaction equation.

Includes: molecular structure diagrams (benzene rings, skeletal formulae), reaction equations with reagents and arrows, Lewis structures, orbital diagrams.

Does not include: mathematical equations (`Formula`) or labelled graphs (`Figure_Graph`). The distinguishing feature is chemical notation — element symbols, bond lines, reaction arrows (→, ⇌).

- **One bounding box covers the entire structure.** A multi-step reaction drawn across several lines gets one box, not one per step. Same fragmentation rule as `Formula`.
- A written reaction equation that is purely symbolic (e.g. "2H₂ + O₂ → 2H₂O") with no structural diagram is still `Chem_Formula`, not `Formula`.

### Figure_Graph (8)
A plotted graph — quantitative data visualised with axes.

Includes: x-y scatter plots, velocity-time curves, bar charts, histograms, Bode plots, free body diagrams with labelled axes.

- Include the axes and tick labels inside the bbox.
- Distinguish from `Table`: a graph has continuous axes or plotted curves; a table has a grid of discrete cells.
- Distinguish from `Figure_Sketch`: a graph must have explicit axes with scale.

### Figure_Image (9)
A printed or pasted image physically present on the page.

Includes: photographs, printed diagrams cut and stuck in, stickers, photocopied inserts.

Does not include: anything the writer drew by hand — use the appropriate `Figure_*` class for that.

- Bbox the image boundary tightly.
- If the image has a handwritten caption, annotate it separately as `Text`.

### Figure_Sketch (10)
A freehand representational or technical drawing.

Includes: engineering part drawings, mechanical cross-sections, physics diagrams, biological sketches, architectural plans, perspective drawings, maps.

Does not include: circuit schematics (`Figure_Electrical`), plotted graphs (`Figure_Graph`), node-and-edge diagrams (`Figure_Flowchart`), or non-representational marks (`Figure_Doodle`).

- Tight bbox around the drawn figure including any embedded axis lines or construction lines.
- Caption text adjacent to the figure is annotated separately as `Text`, not included in this box.

### Figure_Doodle (11)
Non-representational marks with no informational content.

- Use sparingly. Only annotate when the doodle is large enough to confuse the model — typically above 40×40 px. Small margin scribbles below 20×20 px should be left unannotated.
- When in doubt, skip it. A false negative on a doodle is less damaging than a false positive misclassifying real content.

### Figure_Flowchart (12)
A node-and-edge diagram.

Includes: flowcharts, UML diagrams, state machines, decision trees, mind maps, concept maps.

The defining feature is **nodes (shapes) connected by arrows**. If it has boxes connected by lines, it is a flowchart regardless of subject matter.

- Bbox the entire structure including all nodes and connecting arrows.
- Do not annotate the internal arrows separately as `Link` — they are part of the figure.

### Figure_Electrical (13)
An electrical or electronic circuit schematic.

Includes: any drawing using standard circuit symbols — resistors, capacitors, inductors, op-amps, logic gates, transistors, voltage sources — connected by rectilinear wires.

- Bbox the entire circuit including all component symbols, connecting wires, and node labels.
- The distinguishing feature is the standardised symbol vocabulary and rectilinear wiring topology, not just the subject matter. A freehand sketch of a PCB is `Figure_Sketch`; a schematic with proper symbols is `Figure_Electrical`.


## General Rules

**One line per box for text.** `Text` and `List_Item` boxes each cover one written line. The only exceptions are wrapping `List_Item` entries and multi-line `Formula` blocks — both documented above.

**Consistent loose boxes.** Do not try to hug every ascender precisely. Uniform loose boxes across all images are better than inconsistently tight ones.

**Minimum annotation size: 20×20 px.** Stray marks, ink blobs, and small marginalia below this threshold are left unannotated.

**No overlap between sibling boxes.** Two `Text` boxes should not overlap each other. A `Text` box may overlap a `Table` box it is nested inside — that is intentional nested annotation.

**Style decoration does not change the class.** Underlined text, highlighted text, and circled words remain their base class. Style is recovered by post-processing.
