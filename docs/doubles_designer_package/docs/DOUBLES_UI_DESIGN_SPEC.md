
# Teams/Pair (Phase #8) — UI/UX Design Specification

**Module:** Admin & User UI — Teams/Doubles  
**Goal:** Ensure top‑notch usability and visual clarity for *teams (2 players)* across Create Team, Registrations, Bracket, and Schedule.  
**Scope:** Visual spec + tokens + behavior. This package includes inline SVG mockups for quick reference (light & dark variants where helpful).

---

## 1) Shared Rules & Tokens

### 1.1 Team Label Rules
- **Admin:** If `teamName` present → `TeamName (Surname1/Surname2)`; else `Surname1/Surname2`.
- **User:** If `teamName` present → `TeamName`; else `Surname1/Surname2`.
- **Truncation:** One-line, ellipsis. Prefer truncating `teamName` first; tooltip shows full label.
- **Badges:** MD / WD / XD (tiny pill, 18px height). Singles/Doubles chip: S (info), D (success).

### 1.2 Design Tokens
- **Spacing:** 4, 8, 12, 16, 24, 32
- **Radii:** 6 (inputs), 10 (cards), 16 (dialogs)
- **Shadows:** xs `0 1px 2px rgba(0,0,0,.08)`, sm `0 2px 6px rgba(0,0,0,.12)`, md `0 6px 16px rgba(0,0,0,.16)`
- **Typography:** Inter, "Helvetica Neue", Arial, sans-serif
  - H6: 20/28, 600
  - Body: 14/20, 400
  - Label: 12/16, 500
- **Colors (Light):**
  - Primary `#1976D2` (hover `#1565C0`), Success `#2E7D32`, Info `#0288D1`,
  - Error `#D32F2F`, Warning `#F57C00`,
  - Text primary `#111827`, secondary `#4B5563`,
  - Border `#E5E7EB`, Muted bg `#F9FAFB`, Card `#FFFFFF`
- **Colors (Dark):**
  - Surface `#1E1E1E`, Text `#EAEAEA`, Border `#2A2A2A`, Primary `#64B5F6`, Card `#232323`

### 1.3 Accessibility
- Focus ring: 2px `#1976D2`. Tooltip delay 300ms; keyboard accessible.
- Minimum contrast ratio 4.5:1 for text.
- `aria-label` for chips includes full team label.

---

## 2) Create Team Dialog (Admin)

**Dialog:** width 560px, padding 24px, gap 16px; radius 16; shadow md  
**Inputs:** MUI Autocomplete, height 56px, radius 6px, input padding 12px  
**Buttons:** primary height 40px; secondary text button

**States to implement:** empty, typing (menu open), selected (chips), error (duplicate players), disabled

**Validation messages:**
- Duplicate partner: “Both partners must be different.”
- Already in category: “{Player} is already registered in this category.”

See `assets/create_team_dialog_light.svg` and `assets/create_team_dialog_dark.svg`

---

## 3) Registrations Grid (Admin)

**Columns:** Team/Singles (flex 2), Category Chip (80px), Actions (min 120px)  
**Toggle:** “Singles / Teams” segmented control, height 36px, radius 18px  
**Chips:** S (info #0288D1), D (success #2E7D32), MD/WD/XD pill at row end  
**Truncation:** team label cell max width 320px; tooltip full label

See `assets/registrations_grid_light.svg`

---

## 4) Bracket Node (Admin & User)

**Node:** width 220px, min height 52px, radius 10px, padding 8px  
**Content:** seed (12/16 muted) + team label (14/20).  
**States:** default, hover (2px outline #1976D2), selected (shadow sm)

Tooltips should reveal the full label when truncated.

See `assets/bracket_node_light.svg`

---

## 5) Schedule Timeline Item (Admin)

**Tile:** height 40px, radius 8px, padding X 8–12px  
**Primary:** team label (14/20)  
**Secondary:** court (12/16, muted)  
**Conflict badge:** small dot + tooltip “Overlaps for Partner: {name}” — color `#F57C00`

See `assets/schedule_tile_light.svg`

---

## 6) Copy (tooltips / errors)

- Duplicate player: “Both partners must be different.”  
- Already registered: “{Player} is already registered in this category.”  
- Timeline conflict: “Cannot schedule — conflicts with {Player} from this team.”

---

## 7) Handoff Notes

- Shared label util (one source of truth) for Admin/User/Mobile.  
- Data-test ids (examples):  
  - `data-testid="team-dialog"`  
  - `data-testid="partner1"` / `data-testid="partner2"`  
  - `data-testid="format-chip"` / `data-testid="sd-toggle"`  
  - `data-testid="bracket-node"` / `data-testid="timeline-item"`
- Provide Storybook stories for all component states (optional).

---

## 8) Acceptance

- Developers can implement with **no ambiguity**; screens match tokens/specs; labels & truncation rules consistent; a11y verified.

**Definition of Done (per item)**  
- Code + tests + migrations merged  
- Admin/User/Mobile UX flows validated  
- Swagger updated; Postman tests pass  
- Seed data updated; demo tournament runnable end-to-end
