# LIMS Frontend

Laptop Inventory Management System - React TypeScript UI

## Setup

```bash
npm install
```

## Environment Variables

Create `.env.local`:

```
VITE_API_BASE_URL=http://localhost:3001
```

## Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

## Deployment to Vercel

1. Push this repo to GitHub as `lims-frontend`
2. Import into Vercel
3. Set environment variable: `VITE_API_BASE_URL=https://your-ec2-instance.com`
4. Deploy!

## Tech Stack

- React 19
- TypeScript
- React Router
- TanStack Query (React Query)
- Zustand (State management)
- Vite (Build tool)
