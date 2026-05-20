# 今天中午吃什么？

一个基于排除法偏好学习的动态推荐系统，帮助用户快速决策午餐选择。

## 功能特性

### 🍽️ 核心功能

- **智能推荐**：基于用户反馈动态调整推荐权重
- **卡片滑动交互**：左滑跳过，右滑选择，移动端友好
- **偏好学习**：记录负反馈（不想吃）和正反馈（备选、Pick）
- **多模式推荐**：短期偏好、长期偏好、混合模式

### 📋 菜单管理

- 手动添加菜品，支持自定义标签
- CSV文件批量导入
- 图片OCR识别（需接入OCR服务）

### ⭐ 收藏功能

- 备选列表：暂存感兴趣的菜品
- Pick历史：查看过往选择记录
- 偏好统计：分析口味偏好趋势

### ⚙️ 偏好设置

- 推荐模式切换
- 混合比例调整
- 偏好数据重置

## 技术栈

- **框架**：Next.js 14 (App Router)
- **语言**：TypeScript
- **状态管理**：Zustand (持久化存储)
- **动画**：Framer Motion
- **样式**：Tailwind CSS
- **图标**：Lucide React

## 推荐算法

### 权重计算

```
推荐分数 = Σ(Tag权重) × 菜系权重 × 随机因子 × 展示惩罚
```

### 反馈机制

- **负反馈（❌）**：Tag权重 × 0.7，菜系权重 × 0.8
- **备选（⭐）**：Tag权重 × 1.1
- **Pick（❤️）**：Tag权重 × 1.5，菜系权重 × 1.3

### Multi-Armed Bandit

- 10%概率探索低权重菜品
- 探索概率随Session进行逐渐降低

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

## CSV 导入格式

```csv
菜品名称,菜系,口味,类型
宫保鸡丁,川菜,辣,热菜
糖醋里脊,中餐,甜,热菜
清蒸鲈鱼,粤菜,清淡,热菜
```

## 项目结构

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx       # 根布局
│   ├── page.tsx         # 主页面
│   └── globals.css      # 全局样式
├── components/          # React 组件
│   ├── BottomNav.tsx    # 底部导航
│   ├── DishCard.tsx     # 菜品卡片
│   ├── RecommendPage.tsx # 推荐页
│   ├── MenuPage.tsx     # 菜单管理页
│   ├── CollectionPage.tsx # 收藏页
│   └── SettingsPage.tsx # 设置页
├── store/               # 状态管理
│   └── useAppStore.ts   # Zustand store
├── types/               # TypeScript 类型
│   └── index.ts         # 类型定义
└── utils/               # 工具函数
```

## 待实现功能

- [ ] 图片OCR识别（接入腾讯云OCR）
- [ ] 菜品图片上传
- [ ] PWA支持
- [ ] 深色模式

## License

MIT
