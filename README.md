# CareerVest 3.0

A modern Next.js application with shadcn/ui components, CareerVest branding, and Microsoft authentication.

## Features

- ⚡ Next.js 14 with App Router
- 🎨 Tailwind CSS with CareerVest brand colors
- 🔧 TypeScript configuration
- 📱 Responsive design
- 🎯 Pre-configured shadcn/ui components
- 🔐 Microsoft Authentication integration
- 🎨 CareerVest brand styling (Purple #682A53, Yellow #FDC500)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Components

- **Button**: Multiple variants with CareerVest brand colors (default, secondary, outline, destructive, ghost, link) and sizes (sm, default, lg, icon)
- **Card**: Complete card component with header, content, and footer sections
- **Input**: Form input component with brand styling
- **Alert**: Alert component for notifications and errors

## Project Structure

```
ShadCN/
├── app/
│   ├── globals.css      # Global styles with shadcn/ui theme
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main demo page
├── components/
│   └── ui/              # shadcn/ui components
│       ├── button.tsx
│       └── card.tsx
├── lib/
│   └── utils.ts         # Utility functions
└── package.json         # Dependencies and scripts
```

## Adding More Components

To add more shadcn/ui components, you can use the shadcn/ui CLI or copy components from the [shadcn/ui website](https://ui.shadcn.com/).

## CareerVest Brand Colors

The project uses CareerVest's official brand colors:

- **Primary Purple**: `#682A53` - Main brand color
- **Secondary Yellow**: `#FDC500` - Accent color
- **Background**: `#F9FAFB` - Light gray background
- **Border**: `#E5E7EB` - Light gray border

## Customization

The project uses CSS variables for theming. You can customize colors, spacing, and other design tokens in `app/globals.css`.
