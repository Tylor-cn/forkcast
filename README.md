# Forkcast - 今天到底想吃啥？

> 基于认知心理学的智能餐饮推荐系统

## 🚀 快速开始

### 本地开发

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。

### Docker 部署

```bash
# 构建并启动
docker compose up -d

# 查看日志
docker compose logs -f

# 停止服务
docker compose down
```

### 一键发布

```bash
# 发布到 Gitee（默认标签: latest）
./deploy.sh

# 指定版本标签
./deploy.sh v1.0.0

# 指定版本和提交信息
./deploy.sh v1.0.0 "feat: 新增推荐算法"
```

## 🐳 Docker 构建

```bash
# 手动构建
./build.sh

# 构建指定版本
./build.sh v1.0.0
```

## 📦 项目结构

```
.
├── Dockerfile              # Docker 镜像定义
├── docker-compose.yml      # Docker Compose 配置
├── build.sh                # 构建脚本
├── deploy.sh               # 发布脚本
├── .dockerignore           # Docker 忽略文件
├── next.config.js          # Next.js 配置
├── package.json
├── src/
│   ├── app/               # Next.js App Router
│   ├── components/        # React 组件
│   ├── store/             # Zustand 状态管理
│   ├── types/             # TypeScript 类型
│   └── utils/             # 工具函数
└── README.md
```

## 🧠 心理学理论基础

- **Elimination by Aspects (Tversky, 1972)**: 非补偿性两阶段决策模型
- **Negativity Bias (Baumeister et al., 2001)**: 拒绝反馈权重惩罚机制
- **Information Foraging Theory (Pirolli & Card, 1999)**: 三卡斑块推荐策略
- **Affective Forecasting (Wilson & Gilbert, 2003)**: 情绪一致性食物偏好

## 📝 License

MIT
