# Quail - Coding Guidelines

## Overview

Quail is a Next.js app with AI-assisted SQL tools and data visualization.

## Core Principles

- Write clean, simple, readable code
- Use TypeScript for all new code
- Keep components small and focused
- Use descriptive names for everything
- Optimize only when necessary

## Technical Stack

- Next.js with App Router
- TypeScript
- React functional components
- shadcn UI components (from `/components/ui/`)
- Tailwind CSS for styling

## Component Guidelines

- Function components with props interface at top
- Local state when possible, Zustand only when needed
- Keep files organized by feature
- Use composition over inheritance

## Architecture

- Place API routes in `/app/api/`
- Follow Next.js conventions for routing
- Minimize dependencies

## Performance

- Write clean code first, then optimize if needed
- Use appropriate data fetching (SSR, ISR, client-side)
