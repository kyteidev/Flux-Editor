## Design Guide

All values preferably divisible by 4 (use tailwind spacing system)

### Colors
BG 50: lightest color. Used in hover states only
BG 100: lighter color. Used to differenciate between BG 200. Used for component "above" other components, and e.g. buttons
BG 200: base color. Used for all backgrounds
Content: used for all content color, e.g. text

### Spacing
Spacing should be a multiple of 4.
Spacing separating components in same group: 4.
Spacing separating different groups: 8

### Typography
Font size: 16px (20px in editor, 12px in places with low height, e.g. title bar and status bar)
Line height: 1.5
Font: Menlo, Monaco

### Alignment
all centered using main_align or cross_align

### Rounded Corners
Radius: 4px

### Shadows
shadow: "0 0 1 2 rgb(0, 0, 0, 50)"

### Borders
width: 2px (exception to 4pt system)
color: BG_100

### Animations
duration: 256ms
easing: ease-in-out
function: quart
