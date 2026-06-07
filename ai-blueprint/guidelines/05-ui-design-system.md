# UI Design System

This document defines the visual language, component standards, and UX patterns the AI agent must apply consistently across the entire frontend. The result must feel "premium" — not generic, not template-like.

---

## Design Philosophy

- **Dark-first aesthetic** with a rich, editorial feel
- Generous whitespace — let content breathe
- Subtle depth: layered backgrounds, soft shadows, glass morphism accents
- Micro-interactions on every interactive element (hover states, transitions)
- Mobile-first responsive design

---

## Technology Stack

| Tool | Purpose |
|---|---|
| Tailwind CSS v3 | Utility-first styling |
| Framer Motion | Animations and transitions |
| Lucide React | Icon system |
| `clsx` + `tailwind-merge` | Conditional class composition |

---

## Color Palette

Define in `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      // Core
      background: '#0a0a0b',      // deep near-black
      surface: '#131316',         // card / panel background
      surfaceHover: '#1a1a1f',    // hover state for surfaces
      border: '#2a2a32',          // subtle dividers

      // Brand accent — electric indigo/violet
      accent: {
        DEFAULT: '#7c6cfc',       // primary CTA
        light: '#9d90fd',         // hover/lighter variant
        muted: '#3d3570',         // subtle background tint
      },

      // Text
      text: {
        primary: '#f0f0f5',       // headings
        secondary: '#8888a0',     // body / captions
        muted: '#555560',         // disabled / placeholder
      },

      // Semantic
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      display: ['Cal Sans', 'Inter', 'sans-serif'],  // headings
    },
    boxShadow: {
      'card': '0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2)',
      'card-hover': '0 4px 12px rgba(0,0,0,0.5), 0 16px 40px rgba(0,0,0,0.3)',
      'glow': '0 0 20px rgba(124, 108, 252, 0.25)',
    },
  }
}
```

---

## Typography Scale

| Role | Class |
|---|---|
| Hero headline | `text-5xl font-display font-bold text-text-primary` |
| Page heading (H1) | `text-3xl font-display font-bold text-text-primary` |
| Section heading (H2) | `text-xl font-semibold text-text-primary` |
| Card title | `text-base font-semibold text-text-primary` |
| Body text | `text-sm text-text-secondary` |
| Caption / meta | `text-xs text-text-muted` |
| Price / highlight | `text-lg font-bold text-accent` |

---

## Base Components — Implementation Specs

### Button

```tsx
// Variants: 'primary' | 'secondary' | 'ghost' | 'danger'
// Sizes: 'sm' | 'md' | 'lg'

// Primary CTA:
className="bg-accent hover:bg-accent-light text-white font-semibold
           px-5 py-2.5 rounded-xl transition-all duration-200
           shadow-glow hover:shadow-glow hover:-translate-y-0.5
           active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed"

// Secondary (outlined):
className="border border-border hover:border-accent/50 text-text-primary
           bg-transparent hover:bg-accent/5 font-medium
           px-5 py-2.5 rounded-xl transition-all duration-200"

// Ghost:
className="text-text-secondary hover:text-text-primary hover:bg-surfaceHover
           px-4 py-2 rounded-lg transition-all duration-150"
```

### Input

```tsx
className="w-full bg-surface border border-border rounded-xl
           px-4 py-3 text-text-primary text-sm
           placeholder:text-text-muted
           focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20
           transition-all duration-200"

// Error state:
className="... border-error/60 focus:border-error focus:ring-error/20"
```

### Card

```tsx
className="bg-surface border border-border rounded-2xl
           shadow-card hover:shadow-card-hover
           transition-all duration-300 hover:-translate-y-1"
```

### Product Card

Must include:
- Full-bleed image with an overlay gradient at the bottom
- Category badge (top-left)
- Wishlist icon button (top-right)
- Product name, short description
- Price (with original/sale price if discounted)
- "Add to Cart" button that slides up on card hover (Framer Motion)

```tsx
// Layout sketch:
<motion.div whileHover={{ y: -4 }} className="group relative ...">
  <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl">
    <img ... className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-surface to-transparent" />
    <Badge className="absolute top-3 left-3">{category}</Badge>
  </div>
  <div className="p-4">
    {/* name, description, price */}
  </div>
  {/* Add to Cart — slides up on hover */}
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    whileHover={{ opacity: 1, y: 0 }}
    className="absolute bottom-4 inset-x-4"
  >
    <Button variant="primary" className="w-full">Add to Cart</Button>
  </motion.div>
</motion.div>
```

---

## Page-Level Layout

### Navbar

- Fixed top, `backdrop-blur-md bg-background/80 border-b border-border`
- Logo on left, nav links center, cart icon + auth on right
- Cart icon shows item count badge
- Auth state: show "Login / Sign up" when unauthenticated, user avatar dropdown when authenticated

### Page Layout

```tsx
<div className="min-h-screen bg-background">
  <Navbar />
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    {children}
  </main>
  <Footer />
</div>
```

### Footer

- Dark, minimal
- Three columns: brand/tagline, quick links, newsletter stub

---

## Animation Guidelines (Framer Motion)

### Page Transitions

```tsx
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};
const pageTransition = { duration: 0.25, ease: 'easeOut' };

<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
  {/* page content */}
</motion.div>
```

### Staggered List Items (Product Grid)

```tsx
const containerVariants = {
  animate: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

<motion.div variants={containerVariants} initial="initial" animate="animate" className="grid ...">
  {products.map(p => (
    <motion.div key={p.id} variants={itemVariants}>
      <ProductCard product={p} />
    </motion.div>
  ))}
</motion.div>
```

### Cart Drawer

- Slides in from the right: `x: '100%'` → `x: 0`
- Backdrop fade: `opacity: 0` → `opacity: 1`
- AnimatePresence wraps it for exit animations

---

## Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| `sm` (640px) | Single column, stacked nav |
| `md` (768px) | Two-column product grid |
| `lg` (1024px) | Three-column product grid, side filters |
| `xl` (1280px) | Four-column product grid, wider max-width |

---

## Loading States

- Skeleton screens (not spinners) for product grids and lists
- Use `animate-pulse` Tailwind class on placeholder shapes that match actual content shapes
- Full-page spinner only for critical auth checks on first load

---

## Forms

- All form fields use a `FormField` wrapper: label above, input, error message below
- Error messages: `text-error text-xs mt-1`
- Labels: `text-text-secondary text-sm mb-1.5 block`
- Real-time validation feedback using React Hook Form + Zod resolver

```tsx
// Standard field pattern:
<div className="space-y-1.5">
  <label className="text-text-secondary text-sm block">{label}</label>
  <Input {...register(name)} />
  {error && <p className="text-error text-xs">{error.message}</p>}
</div>
```

---

## Icons

Use `lucide-react` exclusively. Common icons used in this project:

| UI Element | Icon |
|---|---|
| Cart | `ShoppingCart` |
| Search | `Search` |
| User/Profile | `User` |
| Close | `X` |
| Back | `ChevronLeft` |
| Chevron/Expand | `ChevronDown` |
| Filter | `SlidersHorizontal` |
| Order History | `Package` |
| Logout | `LogOut` |
| Add | `Plus` |
| Remove | `Minus` |
| Delete | `Trash2` |
| Check/Success | `CheckCircle2` |
| Warning | `AlertCircle` |
| Star/Rating | `Star` |

---

## `cn` Utility

```typescript
// src/shared/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Always use `cn()` for combining conditional Tailwind classes — never string template literals.
