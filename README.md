<div align="center">

# 🍽️ Forkcast

### 今天到底想吃啥？

**基于认知心理学的智能餐饮决策算法，拯救每一个中午点外卖的选择困难症患者。**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

[English](./README_EN.md) · [快速开始](#-快速开始) · [功能特性](#-功能特性) · [心理学基础](#-心理学基础) · [算法设计](./ALGORITHM.md)

</div>

---

## 📖 项目简介

> 你是否在每天早上、中午、晚上，打开外卖 App 又关上，翻了 20 分钟菜单还是不知道吃什么——你不是不饿，你只是不知道自己想吃什么（废话！）。
>
> 当然，如果你没有，那你就不是我的精准需求用户。😏

**Forkcast** 不是又一个美食推荐 App。它用认知心理学帮你「排除」而非「挑选」，通过你的每一次拒绝、犹豫和心动，快速锁定你真正想吃的那一份。

给每天中午的打工🐂🐴们，一个从新认识自己的机会。

### 核心理念

- 🧠 **不问你想吃什么，而是帮你发现你想吃什么** — 用排除法比选择法更快触达答案
- 🎯 **越拒绝越精准** — 每次说「不」都在缩小范围，3-5 轮即可锁定目标
- 📊 **长期学习你的口味** — 记住你的偏好模式，越用越懂你

---

## ✨ 功能特性

| 功能 | 描述 |
|:---|:---|
| 🃏 三卡推荐 | 每次展示 3 道菜，科学的信息觅食策略 |
| 👎 排除式决策 | 不喜欢就划掉，系统自动调整权重 |
| 📋 备选清单 | 「有点想吃」的先存着，最后再选 |
| 🏷️ 8 维标签系统 | 菜系/口味/价格/时段等全方位标注 |
| 🌡️ 上下文感知 | 根据时段和季节自动调整推荐 |
| 📈 双模式学习 | 短期会话偏好 + 长期历史趋势 |
| 📱 移动优先 | 专为手机点外卖场景设计 |
| 🗂️ 菜品管理 | 支持手动添加、CSV 批量导入 |
| 🍜 530 道预置菜品 | 覆盖 17 大菜系，开箱即用（随机生成的~诶嘿~） |

---

## 🧠 心理学基础

本项目的推荐算法基于以下经过同行评审的认知心理学理论：

| 理论 | 应用 |
|:---|:---|
| **Elimination by Aspects** (Tversky, 1972) | 非补偿性两阶段决策模型——先排除再精选 |
| **Negativity Bias** (Baumeister et al., 2001) | 拒绝反馈权重加倍惩罚，快速收敛 |
| **Information Foraging** (Pirolli & Card, 1999) | 三卡斑块策略最大化信息密度 |
| **Affective Forecasting** (Wilson & Gilbert, 2003) | 情绪/时间/季节的一致性偏好建模 |

> 对算法有兴趣的同学可以参阅这里： **[ALGORITHM.md](./ALGORITHM.md)**。

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm or yarn

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/Tylor-cn/forkcast.git
cd forkcast

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 开始使用。

### 🐳 Docker 部署

```bash
# 一键启动
docker compose up -d

# 查看日志
docker compose logs -f

# 停止服务
docker compose down
```

---

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────┐
│                  Frontend                   │
├─────────────────────────────────────────────┤
│  Next.js 16 (App Router)                    │
│  React 19 + TypeScript                      │
│  Tailwind CSS 4 + Framer Motion             │
│  Zustand (State + LocalStorage Persist)     │
├─────────────────────────────────────────────┤
│              推荐引擎 Engine                 │
├─────────────────────────────────────────────┤
│  标签权重评分 + 多样性算法                      │
│  时间衰减 + 上下文加成                         │
│  非对称反馈 (拒绝惩罚 >> 选择奖励)              │
│  三槽策略 (安全/熟悉/新奇)                     │
├─────────────────────────────────────────────┤
│              Deployment                     │
├─────────────────────────────────────────────┤
│  Docker Multi-stage Build (Alpine)          │
│  Docker Compose                             │
└─────────────────────────────────────────────┘
```

---

## 📁 项目结构

```
forkcast/
├── src/
│   ├── app/                 # Next.js App Router 页面
│   ├── components/          # React 组件
│   │   ├── RecommendPage    # 🃏 核心推荐页
│   │   ├── MenuPage         # 🗂️ 菜品管理
│   │   ├── CollectionPage   # ⭐ 收藏页
│   │   └── SettingsPage     # ⚙️ 设置页
│   ├── store/               # Zustand 状态管理 (模块化)
│   │   ├── slices/          # 5 个状态切片
│   │   │   ├── dishSlice        # 菜品 CRUD
│   │   │   ├── feedbackSlice    # 反馈权重调整
│   │   │   ├── recommendSlice   # 推荐算法核心
│   │   │   ├── sessionSlice     # 会话与偏好模式
│   │   │   └── backupSlice      # 备选清单管理
│   │   ├── constants.ts     # 算法调参常量
│   │   └── utils.ts         # 权重计算工具
│   ├── types/               # TypeScript 类型定义 + 预设标签数据
│   └── utils/
│       ├── demoData.ts      # 数据聚合入口
│       └── dishes/          # 530 道菜品 (按 17 个菜系分文件)
│           ├── sichuan.ts       # 川菜 (50)
│           ├── cantonese.ts     # 粤菜 (45)
│           ├── chinese.ts       # 家常菜 (50)
│           ├── japanese.ts      # 日料 (35)
│           ├── korean.ts        # 韩料 (30)
│           ├── western.ts       # 西餐 (35)
│           ├── regional.ts      # 地方菜 (68)
│           ├── hunan.ts         # 湘菜 (25)
│           ├── fastfood.ts      # 快餐 (40)
│           ├── hotpot.ts        # 火锅 (20)
│           ├── bbq.ts           # 烧烤 (25)
│           ├── southeast.ts     # 东南亚 (25)
│           ├── indian.ts        # 印度菜 (10)
│           ├── northeast.ts     # 东北菜 (15)
│           ├── northwest.ts     # 西北菜 (15)
│           ├── yunnan.ts        # 云贵菜 (12)
│           └── other.ts         # 其他 (30)
├── ALGORITHM.md             # 算法设计文档
├── Dockerfile               # 多阶段构建
├── docker-compose.yml       # 容器编排
└── package.json
```

---

## 🤝 贡献

欢迎贡献！无论是新菜品数据、算法优化还是 UI 改进。

```bash
# Fork & Clone
git clone https://github.com/Tylor-cn/forkcast.git

# 创建特性分支
git checkout -b feature/amazing-feature

# 提交更改
git commit -m "feat: add amazing feature"

# 推送并创建 PR
git push origin feature/amazing-feature
```

---

## 📄 License

[Apache License 2.0](LICENSE) © Forkcast

---

<div align="center">

**如果这个项目帮你节省了哪怕 1 分钟的纠结时间，请给个 ⭐**

Made with ❤️ for every indecisive office worker

</div>
