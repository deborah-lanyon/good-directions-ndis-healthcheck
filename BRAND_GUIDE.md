# Community Welcome - Brand Guide Reference

## Logo

The logo features "Community Welcome" text with a waving hand icon replacing the "o" in Welcome.

**Logo Variations:**
- White logo on blue background (primary)
- Blue hand with black text on light backgrounds
- Coral/peach hand with black text on light backgrounds

**Logo Files:**
- `inertia/app/images/logo-white.png` - White version for dark backgrounds
- `inertia/app/images/logo-blue.png` - Blue version for light backgrounds

---

## Typography

### Primary Font: Caprasimo
- Used for: Headlines, titles, brand statements
- Style: Bold, friendly serif with curved letterforms
- CSS: `font-family: 'Caprasimo', cursive;`
- Tailwind: `font-caprasimo`

### Secondary Font: Karla
- Used for: Body text, navigation, UI elements
- Weights available: Extra-light, Light, Regular, Medium, Semi-bold, Bold, Extra-bold
- CSS: `font-family: 'Karla', sans-serif;`
- Tailwind: `font-karla`

---

## Color Palette

### Primary Colors

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Blue Skies | `#0056c9` | `--color-primary` | Primary brand color, backgrounds, CTAs |
| Just Peachy | `#ff7262` | `--color-tertiary` | Accent color, highlights, active states |
| Moving Box Beige | `#f1ede0` | `--color-secondary` | Light backgrounds, cards |
| Black Out Blinds | `#000000` | - | Text, icons |

### Secondary Colors (with tints)

| Name | Main | Tint | Usage |
|------|------|------|-------|
| Blue Skies | `#0056c9` | `#a8c5e8` | Info states, links |
| Just Peachy | `#ff7262` | `#ffb5ad` | Warnings, highlights |
| Orange Juice | `#f57c00` | `#ffd4a8` | Alerts, notifications |
| Green Grass | `#006d5b` | `#b8d4cc` | Success states |
| Sun Yellow | `#f5b800` | `#fde8a8` | Highlights, badges |

---

## Tone of Voice

### Key Attributes
- **Friendly** - Kind and welcoming but not childish
- **Warm** - Inviting but not coercive
- **Inviting** - Clear and proactive, not vague

### Example Phrases
- "You're so welcome here"
- "Meet your new neighbours"
- "Ready to welcome your community?"
- "In a world full of strangers, we're your neighbours"

---

## Graphic Elements

### Curved Shapes
A slight curve is used to mirror the radius in the hand logo and create a flowing, friendly feel. Use curved/wave edges on section dividers.

### Iconography Style
- Hand-drawn/sketchy style icons
- Rounded, friendly appearance
- Can be solid or outline

### House Shapes
Pentagon/house shapes used as graphic elements, filled with brand colors.

---

## Illustrations

### Huumans Style
- Modern, diverse illustrated people
- Colors align with brand palette (blue, coral, green, yellow, orange)
- **Rule: People must appear in groups or pairs, never alone**

### Application
- Combine illustrations with curved landscape elements
- Use house shapes as background elements
- Create neighbourhood scenes

---

## UI Components Reference

### Buttons
- Primary: Blue Skies (`#0056c9`) background, white text
- Secondary/Accent: Just Peachy (`#ff7262`) background, white text
- Outline: White/transparent background with colored border

### Status Badges
- Active/Success: Green Grass (`#006d5b`)
- Warning: Orange Juice (`#f57c00`)
- Info: Blue Skies (`#0056c9`)
- Inactive: Gray

### Form Inputs
- Border: Light gray
- Focus: Blue Skies border/ring
- Error: Coral/red border

---

## CSS Variables (app.css)

```css
:root {
  /* Brand Colors */
  --color-primary: #0056c9;      /* Blue Skies */
  --color-secondary: #f1ede0;    /* Moving Box Beige */
  --color-tertiary: #ff7262;     /* Just Peachy */

  /* Extended Palette */
  --color-orange: #f57c00;       /* Orange Juice */
  --color-green: #006d5b;        /* Green Grass */
  --color-yellow: #f5b800;       /* Sun Yellow */

  /* Tints */
  --color-blue-tint: #a8c5e8;
  --color-peach-tint: #ffb5ad;
  --color-orange-tint: #ffd4a8;
  --color-green-tint: #b8d4cc;
  --color-yellow-tint: #fde8a8;
}
```

---

## Tailwind Theme Configuration

The following custom classes are available:

```
font-caprasimo  - Primary display font
font-karla      - Secondary body font
text-primary    - Blue Skies color
text-secondary  - Moving Box Beige color
text-tertiary   - Just Peachy color
bg-primary      - Blue Skies background
bg-secondary    - Moving Box Beige background
bg-tertiary     - Just Peachy background
```
