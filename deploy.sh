#!/bin/bash
set -euo pipefail

# Forkcast 发布脚本 - 构建并推送到 Gitee
# 用法: ./deploy.sh [tag] [message]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="forkcast"
DEFAULT_TAG="latest"
TAG="${1:-$DEFAULT_TAG}"
COMMIT_MSG="${2:-"release: ${TAG} $(date '+%Y-%m-%d %H:%M')"}"
GITEE_REPO="git@gitee.com:tylor-yang/forkcast.git"

echo "🚀 Forkcast 发布流程启动"
echo "   版本: ${TAG}"
echo "   提交信息: ${COMMIT_MSG}"
echo ""

cd "${SCRIPT_DIR}"

# 1. 运行测试构建
echo "📦 步骤 1/5: 本地构建测试..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 本地构建失败，中止发布"
    exit 1
fi
echo "✅ 本地构建通过"
echo ""

# 2. Docker 构建
echo "🐳 步骤 2/5: Docker 镜像构建..."
./build.sh "${TAG}"
if [ $? -ne 0 ]; then
    echo "❌ Docker 构建失败，中止发布"
    exit 1
fi
echo "✅ Docker 镜像构建完成"
echo ""

# 3. Git 提交
echo "📤 步骤 3/5: Git 提交..."

# 检查是否有变更
if [ -z "$(git status --porcelain)" ]; then
    echo "⚠️  没有检测到文件变更"
else
    git add -A
    git commit -m "${COMMIT_MSG}"
    echo "✅ Git 提交完成"
fi
echo ""

# 4. 推送到 Gitee
echo "☁️  步骤 4/5: 推送到 Gitee..."

# 检查远程仓库
if ! git remote | grep -q "gitee"; then
    echo "🔗 添加 Gitee 远程仓库..."
    git remote add gitee "${GITEE_REPO}"
fi

# 确保使用 main 分支
git branch -M main 2>/dev/null || true

git push gitee main --tags
echo "✅ 推送完成"
echo ""

# 5. 验证
echo "🔍 步骤 5/5: 验证发布..."
echo "   仓库地址: https://gitee.com/tylor-yang/forkcast"
echo "   最新提交:"
git log gitee/main --oneline -1 2>/dev/null || git log origin/main --oneline -1
echo ""

echo "🎉 发布完成！"
echo ""
echo "后续操作:"
echo "  本地运行: docker compose up -d"
echo "  查看日志: docker compose logs -f"
echo "  停止服务: docker compose down"
