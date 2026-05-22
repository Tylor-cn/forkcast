<div align="center">

# 🍽️ Forkcast

### What Should I Eat Today?

**A psychology-powered food decision engine for indecisive lunch orderers.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

[中文](./README.md) · [Quick Start](#-quick-start) · [Features](#-features) · [Psychology](#-psychological-foundations)

</div>

---

## 📖 Introduction

> Every lunch break, you open the delivery app, scroll for 20 minutes, and still can't decide. You're not lacking appetite — you just don't know your own taste.

**Forkcast** isn't another food recommendation app. It uses cognitive psychology to help you *eliminate* rather than *choose* — through every rejection, hesitation, and spark of interest, it quickly narrows down to what you actually crave.

A chance for every overworked office warrior to finally understand their own stomach. 🐂🐴

### Core Philosophy

- 🧠 **Doesn't ask what you want — helps you discover it** — elimination beats selection
- 🎯 **More rejections = more precision** — every "no" narrows the field; 3-5 rounds to target
- 📊 **Learns your taste over time** — remembers preference patterns, gets smarter with use

---

## ✨ Features

| Feature | Description |
|:---|:---|
| 🃏 Three-Card Patch | Shows 3 dishes at a time — optimal foraging strategy |
| 👎 Elimination-Based | Swipe away what you don't want; system adapts |
| 📋 Backup List | Save "maybes" and revisit later |
| 🏷️ 8-Dimension Tags | Cuisine, flavor, price, time, season & more |
| 🌡️ Context-Aware | Adapts recommendations by time-of-day & season |
| 📈 Dual Learning | Session-based + historical preference learning |
| 📱 Mobile-First | Designed for ordering on your phone |
| 🗂️ Dish Management | Manual add or bulk CSV import |
| 🍜 530 Pre-loaded Dishes | Covers 17 cuisines, ready out-of-the-box |

---

## 🧠 Psychological Foundations

The recommendation engine is grounded in peer-reviewed cognitive psychology:

| Theory | Application |
|:---|:---|
| **Elimination by Aspects** (Tversky, 1972) | Non-compensatory two-stage model: eliminate then refine |
| **Negativity Bias** (Baumeister et al., 2001) | Rejections carry heavier penalty for faster convergence |
| **Information Foraging** (Pirolli & Card, 1999) | Three-card patch maximizes information scent |
| **Affective Forecasting** (Wilson & Gilbert, 2003) | Mood, time & seasonal consistency in preference |

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- npm or yarn

### Local Development

```bash
# Clone the repo
git clone https://github.com/your-username/forkcast.git
cd forkcast

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using.

### 🐳 Docker Deployment

```bash
# One-click start
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

---

## 🏗️ Tech Stack

```
┌─────────────────────────────────────────────┐
│                  Frontend                     │
├─────────────────────────────────────────────┤
│  Next.js 16 (App Router)                     │
│  React 19 + TypeScript                       │
│  Tailwind CSS 4 + Framer Motion              │
│  Zustand (State + LocalStorage Persist)      │
├─────────────────────────────────────────────┤
│            Recommendation Engine             │
├─────────────────────────────────────────────┤
│  Tag Weight Scoring + Diversity Algorithm    │
│  Time Decay + Context Bonuses                │
│  Asymmetric Feedback (Reject >> Pick)        │
│  Three-Slot Strategy (Safe/Familiar/Novel)   │
├─────────────────────────────────────────────┤
│              Deployment                       │
├─────────────────────────────────────────────┤
│  Docker Multi-stage Build (Alpine)           │
│  Docker Compose                              │
└─────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
forkcast/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   │   ├── RecommendPage    # 🃏 Core recommendation view
│   │   ├── MenuPage         # 🗂️ Dish management
│   │   ├── CollectionPage   # ⭐ Collection/favorites
│   │   └── SettingsPage     # ⚙️ Settings
│   ├── store/               # Zustand state (modular slices)
│   │   ├── slices/          # 5 state slices
│   │   │   ├── dishSlice        # Dish CRUD
│   │   │   ├── feedbackSlice    # Feedback weight adjustment
│   │   │   ├── recommendSlice   # Core recommendation algorithm
│   │   │   ├── sessionSlice     # Session & preference modes
│   │   │   └── backupSlice      # Backup list management
│   │   ├── constants.ts     # Algorithm tuning parameters
│   │   └── utils.ts         # Weight utility functions
│   ├── types/               # TypeScript types + predefined tag data
│   └── utils/
│       ├── demoData.ts      # Data aggregation entry
│       └── dishes/          # 530 dishes (17 cuisine files)
│           ├── sichuan.ts       # Sichuan (50)
│           ├── cantonese.ts     # Cantonese (45)
│           ├── chinese.ts       # Home-style (50)
│           ├── japanese.ts      # Japanese (35)
│           ├── korean.ts        # Korean (30)
│           ├── western.ts       # Western (35)
│           ├── regional.ts      # Regional (68)
│           ├── hunan.ts         # Hunan (25)
│           ├── fastfood.ts      # Fast food (40)
│           ├── hotpot.ts        # Hot pot (20)
│           ├── bbq.ts           # BBQ (25)
│           ├── southeast.ts     # Southeast Asian (25)
│           ├── indian.ts        # Indian (10)
│           ├── northeast.ts     # Northeast (15)
│           ├── northwest.ts     # Northwest (15)
│           ├── yunnan.ts        # Yunnan-Guizhou (12)
│           └── other.ts         # Other (30)
├── Dockerfile               # Multi-stage build
├── docker-compose.yml       # Container orchestration
└── package.json
```

---

## 🤝 Contributing

Contributions welcome! Whether it's new dish data, algorithm improvements, or UI enhancements.

```bash
# Fork & Clone
git clone https://github.com/your-username/forkcast.git

# Create feature branch
git checkout -b feature/amazing-feature

# Commit changes
git commit -m "feat: add amazing feature"

# Push & create PR
git push origin feature/amazing-feature
```

---

## 📄 License

[Apache License 2.0](LICENSE) © Forkcast

---

<div align="center">

**If this saved you even 1 minute of lunch indecision, please give it a ⭐**

Made with ❤️ for every indecisive office worker

</div>
