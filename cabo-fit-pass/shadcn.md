# shadcn/ui Implementation Rules

This file contains the rules and best practices for implementing UI components using shadcn/ui in this project.

## Core Principles

### 1. Component Philosophy
- **Composition over Configuration**: Build complex UIs by composing smaller, reusable components
- **Copy-Paste Architecture**: Components are owned by your codebase, not imported from a package
- **Accessibility First**: All components must be keyboard navigable and screen reader friendly
- **Tailwind-Based Styling**: Use utility classes for styling, avoid inline styles

## Implementation Rules

### Rule 1: Component Structure
```tsx
// ✅ GOOD: Clean component with proper TypeScript
import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// ❌ BAD: No TypeScript, no forwardRef, inline styles
const Button = (props) => {
  return <button style={{padding: '10px'}} {...props} />
}
```

### Rule 2: Use cn() Utility for Class Names
```tsx
// ✅ GOOD: Use cn() to merge classes
import { cn } from "@/lib/utils"

<div className={cn(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  className
)} />

// ❌ BAD: String concatenation or template literals
<div className={`rounded-lg border ${className}`} />
```

### Rule 3: Variant System with cva
```tsx
// ✅ GOOD: Use cva for variants
import { cva } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### Rule 4: Consistent File Organization
```
components/
├── ui/                    # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── input.tsx
├── layout/               # Layout components
│   ├── header.tsx
│   └── sidebar.tsx
└── features/             # Feature-specific components
    ├── user-profile.tsx
    └── dashboard.tsx
```

### Rule 5: Always Use Design Tokens
```tsx
// ✅ GOOD: Use CSS variables/design tokens
<div className="bg-background text-foreground" />
<div className="bg-primary text-primary-foreground" />
<div className="border-border" />

// ❌ BAD: Hard-coded colors
<div className="bg-white text-black" />
<div className="bg-blue-500 text-white" />
<div className="border-gray-200" />
```

### Rule 6: Form Components with React Hook Form
```tsx
// ✅ GOOD: Integrate with react-hook-form
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export function ProfileForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
```

### Rule 7: Accessibility Requirements
```tsx
// ✅ GOOD: Proper ARIA attributes and keyboard handling
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        This is an accessible dialog with proper ARIA labels
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>

// ❌ BAD: Missing accessibility features
<div onClick={openModal}>Open</div>
<div className="modal">Content</div>
```

### Rule 8: Responsive Design
```tsx
// ✅ GOOD: Mobile-first responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card className="p-4 md:p-6 lg:p-8" />
</div>

// ❌ BAD: Desktop-only design
<div className="grid grid-cols-3 gap-4">
  <Card className="p-8" />
</div>
```

### Rule 9: Data Tables
```tsx
// ✅ GOOD: Use @tanstack/react-table with shadcn/ui
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"

<DataTable 
  columns={columns} 
  data={data}
  pagination
  sorting
  filtering
/>
```

### Rule 10: Theme Support
```tsx
// ✅ GOOD: Support light/dark themes
<html className={theme}>
  <body className="min-h-screen bg-background font-sans antialiased">
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>
  </body>
</html>
```

## Component Patterns

### Card Pattern
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Dialog Pattern
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button onClick={() => setOpen(false)}>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Form Pattern
```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" {...field} />
          </FormControl>
          <FormDescription>Your email address</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

## Installation Commands

### Add New Components
```bash
# Using the shadcn CLI (if configured)
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog

# Or manually copy from shadcn/ui website
```

### Required Dependencies
```json
{
  "dependencies": {
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

## Tailwind Configuration

### Required Tailwind Config
```js
// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

## CSS Variables (globals.css)
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark theme variables */
  }
}
```

## Utils File (lib/utils.ts)
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Testing Guidelines

### Component Testing
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('should render with correct variant', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button', { name: /delete/i })
    expect(button).toHaveClass('bg-destructive')
  })

  it('should handle click events', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## Performance Optimization

### 1. Lazy Load Heavy Components
```tsx
const Dialog = lazy(() => import('@/components/ui/dialog'))
```

### 2. Memoize Expensive Components
```tsx
const ExpensiveComponent = memo(({ data }) => {
  // Component logic
})
```

### 3. Use Virtualization for Long Lists
```tsx
import { VirtualList } from '@tanstack/react-virtual'
```

## Common Pitfalls to Avoid

1. **Don't override design tokens with hard-coded values**
2. **Don't forget forwardRef for interactive components**
3. **Don't skip accessibility attributes**
4. **Don't use inline styles instead of Tailwind classes**
5. **Don't import from node_modules/@shadcn - copy components**
6. **Don't forget to test on mobile devices**
7. **Don't ignore TypeScript errors in components**
8. **Don't create components without proper prop validation**

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Schema Validation](https://zod.dev)