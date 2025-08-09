# Cabo Fit Pass - Shadcn UI Implementation Plan

## App Structure Overview

### 1. Authentication Pages
**Components to Use:**
- `login-01` or `login-02` **blocks** (complete login/signup forms)
- `card`, `cardHeader`, `cardContent`, `cardFooter`
- `button`, `input`, `label`, `form`
- `alert` (for error messages)
- `separator` (social login dividers)

**Pages:**
- Login page
- Sign-up page
- Password reset page
- Email verification page

---

### 2. User App (Main Consumer Interface)

#### 2.1 Main Layout
**Components to Use:**
- `sidebar-01` to `sidebar-03` **blocks** (mobile navigation)
- `navigation-menu` (top navigation)
- `sheet` (mobile menu drawer)
- `avatar`, `dropdown-menu` (user profile menu)
- `badge` (credit count indicator)

#### 2.2 Home/Dashboard Page
**Components to Use:**
- `card` (featured classes, stats, quick actions)
- `carousel` (featured studio carousel)
- `progress` (monthly credit usage)
- `button` (quick booking actions)
- `tabs` (different view modes)

#### 2.3 Class Discovery & Booking
**Components to Use:**
- `calendar-12` or `calendar-20` **blocks** (class scheduling)
- `card` (class listings)
- `badge` (class type, difficulty, credits needed)
- `input`, `select` (search and filters)
- `dialog` (class details modal)
- `checkbox`, `radio-group` (filter options)
- `scroll-area` (long class lists)
- `skeleton` (loading states)

#### 2.4 Studio Map View
**Components to Use:**
- `card` (studio info cards)
- `popover` (map pin details)
- `button` (directions, favorite)
- `badge` (distance, rating)
- `sheet` (studio details drawer)

#### 2.5 User Profile
**Components to Use:**
- `tabs` (profile sections: info, booking history, settings)
- `card` (profile info, subscription status)
- `table` (booking history)
- `form`, `input`, `label` (profile editing)
- `switch` (notification preferences)
- `progress` (membership benefits)

#### 2.6 Booking Flow
**Components to Use:**
- `dialog` (booking confirmation)
- `alert` (booking status, warnings)
- `button` (confirm, cancel)
- `card` (booking summary)
- `separator` (visual breaks)

---

### 3. Studio/Partner Dashboard

#### 3.1 Studio Layout
**Components to Use:**
- `dashboard-01` **block** (complete dashboard layout)
- `sidebar-04` to `sidebar-08` **blocks** (studio navigation)
- `breadcrumb` (navigation path)

#### 3.2 Class Management
**Components to Use:**
- `table` (class listings with actions)
- `calendar-26` or `calendar-27` **blocks** (class scheduling)
- `form`, `input`, `textarea` (class creation/editing)
- `select` (class type, instructor, difficulty)
- `switch` (class availability toggle)
- `badge` (class status)
- `dialog` (add/edit class modal)

#### 3.3 Studio Analytics
**Components to Use:**
- `chart` (booking trends, revenue)
- `card` (key metrics: bookings, revenue, ratings)
- `progress` (capacity utilization)
- `tabs` (different analytics views)
- `select` (date range picker)

#### 3.4 Booking Management
**Components to Use:**
- `table` (upcoming bookings)
- `badge` (booking status)
- `button` (check-in actions)
- `alert` (important notifications)
- `popover` (user details)

---

### 4. Admin Dashboard

#### 4.1 Admin Layout
**Components to Use:**
- `dashboard-01` **block** (comprehensive admin dashboard)
- `sidebar-10` to `sidebar-16` **blocks** (advanced navigation)
- `command` (global search)

#### 4.2 User Management
**Components to Use:**
- `table` (user listings with pagination)
- `input` (search users)
- `select` (user filters)
- `dropdown-menu` (user actions)
- `dialog` (user details/edit)
- `badge` (user status, subscription type)

#### 4.3 Studio Onboarding
**Components to Use:**
- `form` (multi-step studio registration)
- `card` (onboarding steps)
- `progress` (completion indicator)
- `checkbox` (feature selection)
- `textarea` (studio description)
- `input` (contact details, addresses)

#### 4.4 Financial Management
**Components to Use:**
- `chart` (revenue analytics)
- `table` (transaction history)
- `card` (financial summaries)
- `tabs` (different financial views)
- `badge` (payment status)

#### 4.5 System Settings
**Components to Use:**
- `tabs` (settings categories)
- `form`, `input`, `switch` (configuration options)
- `card` (settings groups)
- `alert` (important notices)
- `button` (save/reset actions)

---

### 5. Shared Components Across App

#### 5.1 Common UI Elements
**Components to Use:**
- `toast`/`sonner` (notifications)
- `loading` (skeleton states)
- `alert` (error/success messages)
- `tooltip` (helpful hints)
- `popover` (contextual information)

#### 5.2 Data Display
**Components to Use:**
- `table` (data listings)
- `pagination` (large datasets)
- `card` (content containers)
- `tabs` (content organization)
- `accordion` (collapsible sections)

#### 5.3 Forms & Inputs
**Components to Use:**
- `form`, `input`, `label` (all forms)
- `select`, `radio-group`, `checkbox` (selections)
- `textarea` (long text input)
- `button` (actions)
- `calendar` (date picking)

---

## Mobile-First Responsive Strategy

### Mobile Components
- `sheet` (mobile navigation)
- `drawer` (bottom sheets)
- `collapsible` (mobile-friendly menus)
- `scroll-area` (mobile content areas)

### Tablet/Desktop Enhancements
- `sidebar` blocks (persistent navigation)
- `popover` (desktop hover states)
- `hover-card` (rich previews)
- `command` (keyboard shortcuts)

---

## Key Shadcn Blocks to Implement

1. **`login-01`** - Complete authentication flow
2. **`dashboard-01`** - Studio/admin dashboard base
3. **`calendar-20` or `calendar-26`** - Class scheduling
4. **`sidebar-05`** - User app navigation
5. **`sidebar-12`** - Studio dashboard navigation

---

## Implementation Priority

### Phase 1 (MVP)
- Authentication (`login-01` block)
- User dashboard layout (`sidebar` + `card` components)
- Class booking (`calendar` + `card` + `dialog`)
- Basic studio dashboard (`dashboard-01` block)

### Phase 2 (Beta)
- Advanced calendar views (`calendar-26` block)
- Analytics charts (`chart` components)
- Enhanced tables (`table` with sorting/filtering)
- Mobile optimizations (`sheet`, `drawer`)

### Phase 3 (Production)
- Advanced data tables with drag-drop
- Rich notifications (`sonner`)
- Command palette (`command`)
- Advanced form handling (`form` with validation)

This structure provides a complete, modern, and responsive UI foundation using Shadcn's best-in-class components and blocks.