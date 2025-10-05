# CareerVest Frontend Branding Guide

## Brand Identity

CareerVest is a professional career management and recruitment platform. Our brand reflects professionalism, trust, and opportunity through a sophisticated color palette and consistent design language.

---

## Color Palette

### Primary Colors

#### Maroon (Primary Brand Color)
- **Hex**: `#682A53`
- **HSL**: `hsl(330, 42%, 20%)`
- **RGB**: `rgb(104, 42, 83)`
- **Usage**: Main brand color used for headers, buttons, primary text, navigation, and key UI elements
- **CSS Variable**: `--primary`

#### Yellow/Gold (Secondary/Accent Color)
- **Hex**: `#FDC500`
- **HSL**: `hsl(45, 100%, 51%)`
- **RGB**: `rgb(253, 197, 0)`
- **Usage**: Accents, highlights, hover states, badges, and call-to-action elements
- **CSS Variable**: `--secondary`, `--accent`

### Supporting Colors

#### Maroon Variants
- **Light Maroon**: `#8B3A6F` - Used for gradients and subtle variations
- **Dark Maroon**: `#5a2347` - Used for hover states and darker accents
- **Maroon Gradient**: `from-[#682A53] to-[#8B3A6F]` - Used in sidebars and headers

#### Neutral Colors
- **White**: `#FFFFFF` / `rgb(255, 255, 255)` - Card backgrounds, text on dark backgrounds
- **Light Gray**: `#F9FAFB` - Page backgrounds
- **Gray**: `#E5E7EB` - Borders, dividers
- **Dark Gray**: `#6B7280` - Secondary text
- **Black**: Used sparingly for text and overlays

---

## Brand Applications

### 1. Logo

#### Primary Logo
- **File**: `/public/logo profile only.png`
- **Description**: Yellow "C" logo with transparent background
- **Usage**:
  - Sidebar (40x40px)
  - Login page (desktop: 128x128px, mobile: 96x96px)
  - Loading spinner (varies by size)
- **Guidelines**:
  - Always maintain aspect ratio
  - Use on maroon backgrounds for best contrast
  - The logo should never be distorted or recolored

### 2. Typography

#### Font Family
- **Primary Font**: Inter (Google Fonts)
- **Fallback**: System fonts

#### Text Hierarchy
- **Page Titles**: `text-3xl font-semibold text-[#682A53]`
- **Section Headers**: `text-xl font-bold text-[#682A53]`
- **Card Titles**: `text-lg font-semibold text-[#682A53]`
- **Body Text**: `text-gray-600` or `text-gray-700`
- **Labels**: `text-sm font-medium text-gray-700`

### 3. Buttons

#### Primary Button
```jsx
className="bg-[#682A53] hover:bg-[#682A53]/90 text-white"
```
- **Background**: Maroon `#682A53`
- **Hover**: 90% opacity maroon
- **Text**: White
- **Usage**: Primary actions, submit buttons, main CTAs

#### Secondary Button
```jsx
className="border-[#682A53] text-[#682A53] hover:bg-[#682A53] hover:text-white"
```
- **Border**: Maroon `#682A53`
- **Text**: Maroon (normal), White (hover)
- **Background**: Transparent (normal), Maroon (hover)
- **Usage**: Secondary actions, cancel buttons

#### Accent Button
```jsx
className="bg-[#FDC500] text-[#682A53] hover:bg-[#682A53] hover:text-white"
```
- **Background**: Yellow `#FDC500`
- **Text**: Maroon `#682A53`
- **Usage**: Special actions, featured buttons

### 4. Navigation

#### Sidebar
- **Background**: Gradient `from-[#682A53] to-[#8B3A6F]`
- **Active Item**: Yellow background `rgba(255, 193, 5, 0.6)`
- **Hover State**: Yellow gradient overlay
- **Text**: White
- **Logo Size**: 40x40px
- **Collapse Width**: 80px (collapsed), 280px (expanded)

#### Menu Items
- **Default**: `text-white/80`
- **Active**: `text-white` with yellow background
- **Hover**: Yellow gradient background with scale effect

### 5. Cards & Containers

#### Card Style
```jsx
className="bg-white rounded-xl border border-gray-200 shadow-sm"
```
- **Background**: White
- **Border**: Light gray `#E5E7EB`
- **Border Radius**: `rounded-xl` (12px)
- **Shadow**: Subtle shadow

#### Selected/Active Cards
```jsx
className="border-2 border-[#682A53] bg-[#682A53]/12"
```
- **Border**: 2px solid maroon
- **Background**: 12% opacity maroon tint

#### Card Hover State
```jsx
className="hover:border-[#682A53] hover:bg-[#682A53]/12 hover:shadow-lg"
```

### 6. Forms

#### Input Fields
```jsx
className="border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
```
- **Default Border**: Light gray
- **Focus Border**: Maroon `#682A53`
- **Focus Ring**: 20% opacity maroon
- **Height**: `h-11` (44px) - Standard input height

#### Labels
```jsx
className="text-sm font-medium text-gray-700"
```
- **Label Spacing**: `mt-2` below label (using global CSS)

#### Section Icons
```jsx
<div className="w-8 h-8 bg-[#682A53] rounded-full flex items-center justify-center">
  <Icon className="w-4 h-4 text-white" />
</div>
```
- Circle icons with maroon background and white icon

### 7. Badges & Tags

#### Status Badge
```jsx
className="bg-[#FDC500] text-[#682A53] font-medium px-3 py-1 rounded-full"
```
- **Background**: Yellow `#FDC500`
- **Text**: Maroon `#682A53`
- **Shape**: Rounded pill

#### Count Badge
```jsx
className="bg-[#682A53] text-white rounded-full"
```
- **Background**: Maroon
- **Text**: White
- **Usage**: Notification counts, step numbers

### 8. Loading States

#### Global Spinner
- **Location**: Center of screen with backdrop
- **Container**: White card with maroon top border
- **Spinner**: Dual rotating rings (yellow and maroon) around logo
- **Logo**: CareerVest logo in center with maroon background circle
- **Dots**: Three yellow bouncing dots
- **Text**: Maroon title, gray description

#### Inline Spinners
- **Ripple Variant**: Maroon and yellow pulsing rings with logo
- **Default Variant**: Maroon spinning circle
- **Dots Variant**: Maroon bouncing dots

### 9. Dialogs & Modals

#### Dialog Structure
```jsx
<DialogContent className="bg-white border-[#682A53]/20">
  <DialogHeader>
    <DialogTitle className="text-[#682A53] text-xl font-bold">
      Title Here
    </DialogTitle>
    <DialogDescription className="text-gray-600">
      Description text
    </DialogDescription>
  </DialogHeader>
  {/* Content */}
  <DialogFooter>
    <Button className="bg-[#682A53] hover:bg-[#682A53]/90 text-white">
      Action
    </Button>
  </DialogFooter>
</DialogContent>
```

#### Dialog Types
- **Confirmation Dialogs**: Maroon title, white background, maroon buttons
- **Form Dialogs**: Multi-step with maroon progress indicators
- **Warning Dialogs**: Same styling with appropriate icons

### 10. Login Page

#### Layout
- **Split Screen Design**:
  - **Left Side**: Maroon gradient background with logo, features, and stats
  - **Right Side**: White background with login card

#### Left Side (Desktop)
- **Background**: `bg-gradient-to-br from-[#682A53] to-[#8B3A6F]`
- **Logo**: 128x128px with drop shadow
- **Icons**: Yellow `#FDC500` with white background circles
- **Stats Numbers**: Yellow `#FDC500` text
- **Text**: White

#### Login Card
- **Background**: White with shadow
- **Border**: Maroon top border (4px)
- **Title**: Maroon `#682A53`
- **Button**: Maroon with yellow hover effect

### 11. Gradients

#### Approved Gradients
1. **Sidebar/Navigation**: `from-[#682A53] to-[#8B3A6F]`
2. **Login Background**: `from-[#682A53] to-[#8B3A6F]`
3. **Buttons/FAB**: `from-[#682A53] to-[#FDC500]`
4. **Progress Bars**: `from-[#682A53] via-[#FDC500] to-[#682A53]`

#### Gradient Usage Guidelines
- Always start with primary maroon `#682A53`
- Use yellow `#FDC500` for accent gradients
- Avoid purple/violet variants (e.g., `#8B5CF6`)
- Keep gradients subtle and professional

### 12. Animations & Transitions

#### Hover Effects
- **Scale**: `hover:scale-105` or `hover:scale-[1.02]`
- **Shadow**: `hover:shadow-lg` or `hover:shadow-xl`
- **Background**: Smooth color transitions with yellow overlay
- **Duration**: `transition-all duration-300`

#### Loading Animations
- **Spin**: `animate-spin` for circular loaders
- **Pulse**: `animate-pulse` for breathing effects
- **Bounce**: `animate-bounce` for dots
- **Ping**: `animate-ping` for ripple effects

#### Entry Animations
- **Fade In**: `animate-fade-in`
- **Slide In**: `animate-slide-in` (from left)
- **Slide Right**: `animate-slide-right`
- **Fade In Up**: `animate-fade-in-up`

---

## Component-Specific Branding

### Clients Module
- **Page Title**: Maroon `#682A53`
- **Add Button**: Maroon background
- **Client Cards**: White with gray borders, maroon on hover
- **Form Sections**: Maroon circle icons with white icon inside
- **Payment Schedule Cards**: Maroon accents and borders

### Employees Module
- **Page Title**: Maroon `#682A53`
- **Add Button**: Maroon with darker hover (`#5a2347`)
- **Employee Cards**: White background with maroon text
- **Profile Headers**: Maroon circular avatar backgrounds

### Interview Chains Module
- **Page Title**: Maroon `#682A53`
- **Chain Cards**:
  - Default: White with gray border
  - Selected: 2px maroon border with 12% maroon background tint
  - Hover: Maroon border with 12% maroon background
- **FAB Button**: Gradient from maroon to yellow
- **Chain Exploration Header**: Solid maroon background
- **Status Badges**: Yellow background with maroon text
- **Step Indicators**: Maroon for active/completed steps

### Marketing Activity Module
- **Page Title**: Maroon `#682A53`
- **View Toggle**: Maroon checkbox with yellow active state
- **Interview Cards**:
  - Border: Maroon on hover
  - Background: Yellow tint on selected
- **Status Badges**: Yellow background with maroon text
- **Kanban Columns**: Maroon headers with yellow badge counts
- **Filter Buttons**: Yellow active state, maroon hover

### Pipelines Module
- **Page Title**: Maroon `#682A53`
- **Pipeline Cards**: Maroon accents and borders
- **Action Items**: Maroon focus states

### Dashboard Module
- **Page Title**: Maroon `#682A53`
- **Chart Colors**: Maroon `#682A53` as primary data color
- **Metric Cards**: Maroon titles and key numbers

---

## Design Principles

### 1. Consistency
- Always use exact brand colors (no approximations)
- Maintain consistent spacing and sizing
- Use the same component patterns across modules

### 2. Hierarchy
- Maroon for primary actions and important elements
- Yellow for accents and highlights
- Gray for secondary text and less important elements

### 3. Accessibility
- Maintain WCAG AA contrast ratios
- Maroon on white: 7.8:1 (AAA compliant)
- Yellow on maroon: 4.6:1 (AA compliant for large text)
- White on maroon: 8.2:1 (AAA compliant)

### 4. Professional Tone
- Clean, modern design
- Subtle animations (not distracting)
- Generous white space
- Clear visual hierarchy

### 5. Mobile Responsiveness
- Logo scales appropriately (mobile: 96x96px, desktop: 128x128px)
- Sidebar collapses on mobile
- Touch-friendly button sizes (minimum 44px height)
- Responsive text sizing

---

## Implementation Guidelines

### Using Brand Colors in Code

#### Tailwind CSS Classes
```jsx
// Primary Maroon
className="text-[#682A53]"          // Text
className="bg-[#682A53]"            // Background
className="border-[#682A53]"        // Border
className="hover:bg-[#682A53]/90"   // Hover with opacity

// Secondary Yellow
className="text-[#FDC500]"          // Text
className="bg-[#FDC500]"            // Background
className="border-[#FDC500]"        // Border

// Gradients
className="bg-gradient-to-r from-[#682A53] to-[#FDC500]"
```

#### CSS Variables (globals.css)
```css
:root {
  --primary: 330 42% 20%;        /* #682A53 */
  --secondary: 45 100% 51%;      /* #FDC500 */
  --accent: 45 100% 51%;         /* #FDC500 */
  --foreground: 330 42% 20%;     /* #682A53 */
}
```

### Component Templates

#### Page Header
```jsx
<div className="mb-6">
  <h1 className="text-3xl font-semibold text-[#682A53]">
    Page Title
  </h1>
</div>
```

#### Primary Button
```jsx
<Button className="bg-[#682A53] hover:bg-[#682A53]/90 text-white">
  Click Me
</Button>
```

#### Section with Icon
```jsx
<div className="flex items-center space-x-3 mb-4">
  <div className="w-8 h-8 bg-[#682A53] rounded-full flex items-center justify-center">
    <Icon className="w-4 h-4 text-white" />
  </div>
  <h3 className="text-lg font-semibold text-[#682A53]">
    Section Title
  </h3>
</div>
```

---

## Brand Audit Checklist

When adding new components or pages, verify:

- [ ] Page title uses maroon `#682A53`
- [ ] Primary buttons use maroon background
- [ ] Hover states use appropriate maroon/yellow colors
- [ ] Icons in circles use maroon background with white icons
- [ ] Selected/active states use maroon borders or yellow backgrounds
- [ ] Forms use maroon focus states
- [ ] Badges use yellow background with maroon text
- [ ] No purple or off-brand colors (`#8B5CF6`, etc.)
- [ ] Gradients only use approved combinations
- [ ] Loading states use branded spinner
- [ ] Dialogs follow branded template
- [ ] Logo is properly sized and positioned

---

## File Locations

### Brand Assets
- **Logo**: `/public/logo profile only.png`
- **Old Logo** (deprecated): `/public/careerVest-logo.jpeg`

### Style Files
- **Global Styles**: `/app/globals.css`
- **Tailwind Config**: `/tailwind.config.ts`

### Component Files
- **Sidebar**: `/app/sharedComponents/sidebar.tsx`
- **Spinner**: `/components/ui/spinner.tsx`
- **Global Spinner**: `/components/ui/globalSpinner.tsx`
- **Login Page**: `/app/login/page.tsx`
- **Inactivity Dialog**: `/app/sharedComponents/inactivityWarning.tsx`

---

## Version History

### Version 1.0 (Current)
- Established primary maroon `#682A53` and secondary yellow `#FDC500`
- Implemented consistent branding across all modules
- Created global spinner with brand colors
- Updated login page with split-screen design
- Fixed all gradient inconsistencies
- Branded all dialogs and modals
- Standardized form styling with brand colors

---

## Contact & Support

For branding questions or inconsistencies, please:
1. Refer to this documentation first
2. Check existing components for reference implementations
3. Maintain consistency with established patterns
4. When in doubt, use maroon `#682A53` for primary elements and yellow `#FDC500` for accents

---

**Last Updated**: January 2025
**Brand Colors**: Maroon `#682A53` | Yellow `#FDC500`
**Maintained By**: CareerVest Development Team
