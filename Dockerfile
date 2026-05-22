# 多阶段构建：Next.js 16 + TypeScript 应用
# 使用国内镜像源（DaoCloud），避免 Docker Hub 拉取超时
ARG IMAGE_REGISTRY=docker.m.daocloud.io

# 阶段1：依赖安装（包含 devDependencies，因为构建需要）
FROM ${IMAGE_REGISTRY}/library/node:22-alpine AS deps
WORKDIR /app

# 安装构建依赖（某些原生模块需要）
RUN apk add --no-cache libc6-compat

# 先复制包管理文件，利用 Docker 缓存层
# 使用国内 npm 镜像加速
COPY package.json package-lock.json* ./
RUN npm config set registry https://registry.npmmirror.com && \
    npm ci && npm cache clean --force

# 阶段2：构建
ARG IMAGE_REGISTRY=docker.m.daocloud.io
FROM ${IMAGE_REGISTRY}/library/node:22-alpine AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建生产版本
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# 阶段3：运行（只复制生产需要的文件）
ARG IMAGE_REGISTRY=docker.m.daocloud.io
FROM ${IMAGE_REGISTRY}/library/node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 创建非 root 用户运行应用
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制必要文件（public 目录可选）
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切换到非 root 用户
USER nextjs

EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "server.js"] 
