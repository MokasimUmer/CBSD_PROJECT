# 🎨 Modular Creator Platform

A **component-based** creator platform built as a monorepo, where creators publish exclusive content, fans subscribe to tiers, and payments/notifications flow automatically.

## 🏗️ Architecture

```
apps/
  ├── web        → React + Vite frontend
  └── api        → Express API Gateway

packages/
  ├── db             → Database models & repositories
  ├── auth           → Authentication & authorization
  ├── content        → Post/content management
  ├── subscriptions  → Subscription handling
  ├── payments       → Payment processing
  ├── notifications  → Notification system
  ├── feed           → Feed aggregation
  ├── analytics      → Engagement tracking
  ├── ui             → Reusable UI components
  └── utils          → Shared helpers
```

## 🧠 Design Principles

- **Separation of Concerns** — each package has one responsibility
- **Loose Coupling** — components interact via exported APIs
- **High Cohesion** — related logic grouped within packages
- **Reusability** — shared packages across the system
- **Scalability** — new features = new packages

## 🎯 Design Patterns

| Pattern | Usage |
|---------|-------|
| Repository | Database access abstraction |
| Middleware | Auth & access control |
| Observer | Event-driven notifications |
| Factory | Payment processor creation |

## 🚀 Getting Started

```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Run API server
npm run dev --workspace=apps/api

# Run frontend
npm run dev --workspace=apps/web
```

## 📦 Tech Stack

- **Monorepo**: npm workspaces
- **Language**: TypeScript (strict)
- **Frontend**: React 18 + Vite
- **API**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcrypt
