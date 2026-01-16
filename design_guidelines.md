# Dekalb County Sanitation - Mobile App Design Guidelines

## Brand Identity

**Purpose**: Municipal utility app helping Dekalb County residents manage waste collection services—view pickup schedules, receive notifications, report issues, and access service information.

**Aesthetic Direction**: **Civic & Trustworthy** - Clean, accessible, utilitarian design that feels official and reliable. Uses county civic colors (green for sanitation/environment) with high-contrast, easy-to-read interfaces suitable for all ages and abilities.

**Memorable Element**: Persistent "Next Pickup" widget on home screen showing countdown to next collection with clear visual indicator of trash type (trash/recycling/yard waste).

## Navigation Architecture

**Root Navigation**: Tab Navigation (3 tabs)
- **Home** (calendar icon)
- **Services** (list icon)  
- **Profile** (user icon)

**No Authentication Required** - Local utility app with personalized settings stored locally.

## Screen-by-Screen Specifications

### Home Screen
**Purpose**: Quick view of upcoming pickup schedule and notifications.

**Layout**:
- Header: Transparent, title "Sanitation Services", no buttons
- Top inset: `headerHeight + Spacing.xl`
- Bottom inset: `tabBarHeight + Spacing.xl`
- Main content: Scrollable

**Components**:
- Address card (editable, shows current service address)
- Next Pickup widget (large card showing countdown, date, collection type with color-coded icon)
- Upcoming schedule (list of next 4 pickups)
- Quick action: "Report Issue" button

### Services Screen
**Purpose**: Browse service information, schedules, and guidelines.

**Layout**:
- Header: Transparent, title "Services", search icon (right)
- Scrollable list of cards
- Top inset: `headerHeight + Spacing.xl`
- Bottom inset: `tabBarHeight + Spacing.xl`

**Components**:
- Service cards: Collection Schedule, What Goes Where, Bulk Item Pickup, Holiday Schedule, Special Services
- Each card has icon, title, chevron

### Profile Screen
**Purpose**: Manage address, notification preferences, app settings.

**Layout**:
- Header: Default, title "Profile"
- Scrollable form
- Top inset: `Spacing.xl`
- Bottom inset: `tabBarHeight + Spacing.xl`

**Components**:
- Avatar (county seal or user-selected icon)
- Service address input
- Notification toggles (pickup reminders, service alerts)
- Theme selector (light/dark)
- About/Help sections

### Report Issue Screen (Modal)
**Purpose**: Submit service issue reports.

**Layout**:
- Header: Default, "Cancel" (left), "Submit" (right)
- Scrollable form
- Top inset: `Spacing.xl`
- Bottom inset: `insets.bottom + Spacing.xl`

**Components**:
- Issue type picker (Missed Pickup, Damaged Container, Other)
- Date picker
- Description text area
- Photo upload option
- Submit button (disabled until required fields filled)

## Color Palette

**Primary**: `#2D7A3E` (Forest Green - represents environment/sanitation)
**Primary Dark**: `#1F5A2C`
**Background**: `#FFFFFF` (Light), `#121212` (Dark)
**Surface**: `#F5F5F5` (Light), `#1E1E1E` (Dark)
**Text Primary**: `#212121` (Light), `#FFFFFF` (Dark)
**Text Secondary**: `#757575` (Light), `#B3B3B3` (Dark)
**Divider**: `#E0E0E0` (Light), `#2C2C2C` (Dark)

**Semantic Colors**:
- Trash (general): `#424242` (Gray)
- Recycling: `#1976D2` (Blue)
- Yard Waste: `#689F38` (Light Green)
- Alert: `#D32F2F` (Red)
- Warning: `#F57C00` (Orange)

## Typography

**Font**: System font (SF Pro on iOS, Roboto on Android)

**Type Scale**:
- **Heading 1**: 28px, Bold
- **Heading 2**: 22px, SemiBold
- **Heading 3**: 18px, SemiBold
- **Body**: 16px, Regular
- **Caption**: 14px, Regular
- **Small**: 12px, Regular

## Visual Design

- Icons: Use Feather icons from @expo/vector-icons for consistency
- Cards: 12px border radius, subtle elevation (1-2dp)
- Buttons: 8px border radius, solid fills for primary actions
- Floating action button for "Report Issue": Green primary color with subtle shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2)
- High contrast throughout for accessibility
- All touchable elements have 0.7 opacity on press

## Assets to Generate

1. **icon.png** - App icon featuring county seal or stylized trash bin icon in green
   - WHERE USED: Device home screen

2. **splash-icon.png** - County seal or app logo mark
   - WHERE USED: App launch screen

3. **empty-schedule.png** - Simple illustration of empty calendar with checkmark
   - WHERE USED: Services screen when no upcoming pickups

4. **trash-icon.png** - Simple gray trash bin icon
   - WHERE USED: Pickup type indicator

5. **recycling-icon.png** - Blue recycling symbol
   - WHERE USED: Pickup type indicator

6. **yard-waste-icon.png** - Light green leaf/yard bag icon
   - WHERE USED: Pickup type indicator

7. **avatar-seal.png** - Dekalb County official seal
   - WHERE USED: Default profile avatar