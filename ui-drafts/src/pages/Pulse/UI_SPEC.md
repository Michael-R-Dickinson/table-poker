# Pulse - UI Specification

## Visual Style

### Typography
- **Primary Font**: Inter (system-ui fallback)
- **Type Scale**:
  - Headings: 32px (xl), 24px (lg), 20px (md), 16px (sm)
  - Body: 15px base, 14px secondary, 13px captions
  - Font weights: 600 (semibold) for headings, 500 (medium) for labels, 400 (regular) for body
- **Line Heights**: 1.5 for body, 1.2 for headings

### Spacing Scale
- Base unit: 4px
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80px
- Component padding: 16-24px
- Section gaps: 24-32px
- Page margins: 32px desktop, 16px mobile

### Color System
- **Surfaces**:
  - Background (light): white
  - Background (dark): #0A0A0A
  - Card (light): white with subtle shadow
  - Card (dark): #1A1A1A
  - Elevated surfaces use soft shadows instead of heavy borders
- **Contrast**:
  - Primary action: High contrast accent color (blue/purple)
  - Secondary: Muted gray tones
  - Destructive: Red for warnings/deletions
  - Success: Green for positive states
  - Warning: Amber for at-risk items
- **Borders**: Minimal use, prefer soft dividers with border-border/10 opacity

### Visual Treatment
- **Shadows**: Layered approach
  - sm: subtle elevation for cards
  - md: modals and popovers
  - lg: drawers
- **Borders**: 1px, subtle, semi-transparent (border-border/10 to border-border/20)
- **Border Radius**: 12px for cards, 8px for inputs, 6px for buttons
- **Focus Rings**: 2px ring with ring-offset for accessibility

## Layout Structure

### Desktop (1024px+)
- **12-column grid** with 24px gutters
- **Left Sidebar**:
  - Fixed width: 240px
  - Logo + navigation links
  - User profile at bottom
  - Collapsible state (64px icon-only)
- **Main Content Area**:
  - Max width: 1400px (centered)
  - Padding: 32px
  - Header with page title + actions
  - Content region with appropriate grid/flex layouts
- **Topbar**:
  - Search, notifications, dark mode toggle, user menu
  - Height: 64px
  - Sticky on scroll

### Mobile (<768px)
- **Bottom Navigation**:
  - Fixed at bottom
  - 4 primary navigation items
  - Active state clearly indicated
- **Topbar**:
  - Logo left, hamburger menu right
  - Search slides down when activated
- **Content**:
  - Full-width cards with 16px margin
  - Stacked layout, single column

### Tablet (768px-1023px)
- Hamburger menu triggers slide-out sidebar
- 2-column grid where appropriate
- Topbar similar to desktop

## Key User Flows

### 1. View Dashboard
**Goal**: Quickly assess financial health and upcoming obligations

**Layout**:
- Top row: 3-4 stat cards (total monthly spend, active subscriptions, upcoming bills, savings rate)
- Middle section: Cashflow chart (income vs expenses over time, 6-month view)
- Lower left: Upcoming bills list (next 7 days, sorted by date)
- Lower right: At-risk category card (categories approaching/exceeding budget)

**Interactions**:
- Stat cards: Click to filter relevant data
- Chart: Hover for tooltips, click data points to drill into transactions
- Bills list: Click to mark as paid or view details
- At-risk card: Click category to see breakdown

**States**:
- Loading: Skeleton loaders for each section
- Empty: "No upcoming bills" or "All categories on track" messages with illustrations

### 2. Add/Edit Subscription
**Goal**: Quickly capture or update subscription details

**Trigger**:
- "Add Subscription" button (primary, top-right of subscriptions page)
- Click subscription card to edit

**Modal Content**:
- Fields: Name, Amount, Billing cycle (dropdown: monthly/yearly/custom), Category, Next billing date, Notes
- Optional: Upload logo/icon, set reminder preferences
- Actions: Save (primary), Cancel (secondary)

**Validation**:
- Required fields: Name, Amount, Billing cycle
- Real-time validation with inline errors
- Success toast on save

### 3. View Spending Breakdown
**Goal**: Understand where money is going by category and time

**Layout** (Transactions page):
- **FilterBar** (top):
  - Date range picker (presets: This month, Last month, Last 3 months, Custom)
  - Category multi-select
  - Search by description
  - Amount range slider
- **DataTable**:
  - Columns: Date, Description, Category (chip), Amount, Actions
  - Sortable by all columns
  - Infinite scroll/pagination
  - Row click opens detail drawer
- **Detail Drawer**:
  - Full transaction details
  - Edit capability
  - Related subscriptions (if applicable)
  - Tags and notes

**States**:
- Loading: Table skeleton
- Empty: "No transactions found" with clear filters button
- Error: Inline error message with retry

### 4. Manage Settings
**Goal**: Configure profile and notification preferences

**Layout**:
- Left nav (desktop) or tabs (mobile): Profile, Notifications, Preferences
- **Profile Section**:
  - Avatar upload
  - Name, Email (editable)
  - Password change link
- **Notifications**:
  - Toggle groups: Bills (7 days before, 1 day before), Budgets (approaching limit, exceeded), Subscriptions (renewal reminders)
  - Email vs push preferences
- **Preferences**:
  - Currency selection
  - Default view (dashboard page)
  - Theme toggle (light/dark/system)

**Interactions**:
- Auto-save on toggle changes
- Save button for text fields
- Success feedback for updates

## Component Specifications

### StatCard
- Card surface with padding (20px)
- Label (muted text, 13px)
- Value (large, 32px, semibold)
- Change indicator (±percentage, colored)
- Optional icon (top-right, muted)
- Hover: slight elevation increase
- Click: navigate to filtered view

### DataTable
- Striped rows (subtle)
- Sticky header
- Row hover: background change
- Sort indicators in headers
- Pagination controls at bottom
- Responsive: horizontal scroll on mobile

### FilterBar
- Horizontal layout (flex wrap on mobile)
- Each filter: label + control (dropdown/input/datepicker)
- "Clear filters" button (secondary, right-aligned)
- Active filter count badge

### Modal
- Centered overlay
- Max width: 600px
- Backdrop blur
- Slide-in animation from bottom (mobile) or fade-in (desktop)
- Close on backdrop click or ESC key
- Header: Title + close button
- Footer: Actions aligned right

### Drawer
- Slide from right (desktop) or bottom (mobile)
- Width: 480px (desktop)
- Full-height with scroll
- Backdrop overlay
- Header: Title + close
- Content area with padding
- Optional footer for actions

### EmptyState
- Centered vertically
- Icon (muted, 48px)
- Heading (16px, semibold)
- Description (14px, muted)
- Optional CTA button (primary)

## Dark Mode Implementation
- Class-based toggle (.dark on root element)
- All colors use CSS variables defined in index.css
- Seamless transition (200ms ease)
- Persist preference in localStorage
- System preference detection on first load

## Micro-interactions
- Button hover: slight scale (1.02), brightness change
- Card hover: elevation increase (shadow transition 200ms)
- Active states: scale down (0.98)
- Focus rings: 2px ring with offset
- Loading states: skeleton pulse animation
- Page transitions: subtle fade (150ms)
- Success actions: brief green checkmark animation
- Form validation: shake on error

## Accessibility
- Semantic HTML throughout
- ARIA labels for icon buttons
- Keyboard navigation support
- Focus management in modals/drawers
- Sufficient color contrast (WCAG AA)
- Screen reader announcements for dynamic content
