#!/bin/bash
set -euo pipefail

# Forkcast Docker 构建脚本
# 用法: ./build.sh [tag]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="forkcast"
DEFAULT_TAG="latest"
TAG="${1:-$DEFAULT_TAG}"

echo "🚀 开始构建 ${PROJECT_NAME}:${TAG}..."
cd "${SCRIPT_DIR}"

# 清理旧构建
echo "🧹 清理旧构建..."
docker compose down --remove-orphans 2>/dev/null || true

# 构建镜像
echo "🔨 构建 Docker 镜像..."
docker compose build --no-cache

# 标记镜像
echo "🏷️  标记镜像..."
docker tag "${PROJECT_NAME}:latest" "${PROJECT_NAME}:${TAG}"

echo "✅ 构建完成！"
echo ""
echo "镜像信息:"
docker images "${PROJECT_NAME}" --format "  {{.Repository}}:{{.Tag}} | {{.Size}} | {{.CreatedAt}}"
echo ""
echo "启动命令:"
echo "  docker compose up -d"
