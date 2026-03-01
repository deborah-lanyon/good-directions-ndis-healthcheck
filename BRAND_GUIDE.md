# Good Directions NDIS Healthcheck - Brand Guide Reference

## Logo

**Logo Variations:**
- White logo on purple background (primary)
- Purple logo on light backgrounds

**Logo Files:**
- `inertia/app/images/logo-white.png` - White version for dark backgrounds
- `inertia/app/images/logo-purple.png` - Purple version for light backgrounds

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
| Purple | `#6d3b90` | `--color-primary` | Primary brand color, backgrounds, CTAs |
| Accent Yellow | `#FDAF18` | `--color-tertiary` | Accent color, highlights, active states |
| Accent Blue | `#072d5b` | `--color-accent-blue` | Dark navy accent |
| Cream | `#f1ede0` | `--color-secondary` | Page backgrounds, light surfaces |
| Black | `#000000` | - | Text, icons |

### Secondary Colors

| Name | Hex | Usage |
|------|-----|-------|
| Orange | `#f57c00` | Alerts, notifications |
| Green | `#006d5b` | Success states |
| Yellow | `#f5b800` | Highlights, badges |

---

## Tone of Voice

### Key Attributes
- **Supportive** - Helpful and professional
- **Warm** - Inviting but not coercive
- **Clear** - Direct and proactive

---

## UI Components Reference

### Buttons
- Primary: Purple (`#6d3b90`) background, white text
- Secondary/Accent: Yellow (`#FDAF18`) background, dark text
- Outline: White/transparent background with colored border

### Status Badges
- Active/Success: Green (`#006d5b`)
- Warning: Orange (`#f57c00`)
- Info: Purple (`#6d3b90`)
- Inactive: Gray

### Form Inputs
- Border: Light gray
- Focus: Purple border/ring
- Error: Red border

---

## CSS Variables (app.css)

```css
@theme {
  --color-primary: #6d3b90;      /* Purple */
  --color-secondary: #f1ede0;    /* Cream */
  --color-tertiary: #FDAF18;     /* Accent Yellow */
  --color-accent-blue: #072d5b;  /* Accent Blue */
}
```

---

## Tailwind Theme Configuration

The following custom classes are available:

```
font-caprasimo  - Primary display font
font-karla      - Secondary body font
text-primary    - Purple color
text-secondary  - White color
text-tertiary   - Accent Yellow color
bg-primary      - Purple background
bg-secondary    - White background
bg-tertiary     - Accent Yellow background
```

---

## Terminology

| Domain Term | Label |
|-------------|-------|
| Organisation unit | Operations Manager / Organisation |
| User role (admin) | Operations Manager |
| Field worker | Delivery |
| Deliverable | Welcome Pack |
| Addresses | Properties |
| Area grouping | Territory / Street Group |
