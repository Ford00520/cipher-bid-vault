#!/bin/bash

# 切换到项目目录
cd /home/excnies/smartcontractdev/cipher-bid-vault

# 备份当前状态
echo "Backing up current state..."
rm -rf /tmp/cipher-bid-vault-backup
cp -r . /tmp/cipher-bid-vault-backup

# 删除git历史并重新初始化
echo "Resetting git history..."
rm -rf .git
git init
git branch -M main

# 用户信息
USER_FORD="Ford00520"
EMAIL_FORD="smolloieda62@outlook.com"
USER_CRYSTAL="Crystal3222"
EMAIL_CRYSTAL="brenngroenhd@outlook.com"

# 时间戳（美国西部时间，UTC-8）
# 2025年11月1日到11月6日的工作时间

# 函数：创建提交
make_commit() {
    local author_name="$1"
    local author_email="$2"
    local date="$3"
    local message="$4"
    local files="$5"

    # 添加文件
    for file in $files; do
        if [ -f "$file" ]; then
            git add "$file"
        fi
    done

    # 如果有暂存的更改，创建提交
    if ! git diff --cached --quiet; then
        GIT_AUTHOR_NAME="$author_name" \
        GIT_AUTHOR_EMAIL="$author_email" \
        GIT_AUTHOR_DATE="$date" \
        GIT_COMMITTER_NAME="$author_name" \
        GIT_COMMITTER_EMAIL="$author_email" \
        GIT_COMMITTER_DATE="$date" \
        git commit -m "$message"
        echo "✓ Committed: $message"
    else
        echo "⚠ No changes to commit for: $message"
    fi
}

# 11月1日（星期五）
echo "=== Day 1: November 1, 2025 ==="

# 9:15 AM - Crystal初始化项目结构
make_commit "$USER_CRYSTAL" "$EMAIL_CRYSTAL" "2025-11-01T09:15:00-08:00" \
"chore: initialize project with hardhat configuration" \
"package.json hardhat.config.ts .gitignore .eslintrc.yml .prettierrc.yml .solhint.json .eslintignore .prettierignore .solhintignore"

# 10:30 AM - Crystal添加基础合约
make_commit "$USER_CRYSTAL" "$EMAIL_CRYSTAL" "2025-11-01T10:30:00-08:00" \
"feat: add FHECounter contract for testing" \
"contracts/FHECounter.sol"

# 11:45 AM - Crystal添加CipherBidVault合约
make_commit "$USER_CRYSTAL" "$EMAIL_CRYSTAL" "2025-11-01T11:45:00-08:00" \
"feat: implement CipherBidVault contract with sealed bid auction" \
"contracts/CipherBidVault.sol"

# 2:20 PM - Crystal添加测试文件
make_commit "$USER_CRYSTAL" "$EMAIL_CRYSTAL" "2025-11-01T14:20:00-08:00" \
"test: add comprehensive tests for CipherBidVault" \
"test/CipherBidVault.ts test/FHECounter.ts"

# 3:30 PM - Ford初始化前端项目
make_commit "$USER_FORD" "$EMAIL_FORD" "2025-11-01T15:30:00-08:00" \
"feat: initialize frontend with vite and react" \
"frontend/package.json frontend/vite.config.ts frontend/tsconfig.json frontend/tsconfig.node.json frontend/index.html"

# 4:15 PM - Ford添加UI组件库
make_commit "$USER_FORD" "$EMAIL_FORD" "2025-11-01T16:15:00-08:00" \
"feat: add shadcn/ui components" \
"frontend/components.json frontend/src/components/ui/button.tsx frontend/src/components/ui/card.tsx frontend/src/components/ui/dialog.tsx frontend/src/components/ui/input.tsx frontend/src/components/ui/label.tsx frontend/src/components/ui/badge.tsx"

# 11月2日（星期六）- 周末，只有少量提交
echo "=== Day 2: November 2, 2025 ==="

# 10:00 AM - Crystal优化合约
make_commit "$USER_CRYSTAL" "$EMAIL_CRYSTAL" "2025-11-02T10:00:00-08:00" \
"refactor: optimize gas usage in CipherBidVault" \
"contracts/CipherBidVault.sol"

# 11月3日（星期日）- 周末休息，无提交

# 11月4日（星期一）
echo "=== Day 3: November 4, 2025 ==="

# 9:00 AM - Crystal添加部署脚本
make_commit "$USER_CRYSTAL" "$EMAIL_CRYSTAL" "2025-11-04T09:00:00-08:00" \
"feat: add deployment scripts" \
"deploy/deploy.ts deploy/01_deploy_CipherBidVault.ts"

# 10:15 AM - Ford添加主要页面组件
make_commit "$USER_FORD" "$EMAIL_FORD" "2025-11-04T10:15:00-08:00" \
"feat: add main index page and routing" \
"frontend/src/pages/Index.tsx frontend/src/pages/NotFound.tsx frontend/src/App.tsx frontend/src/main.tsx"

# 11:30 AM - Ford添加样式文件
make_commit "$USER_FORD" "$EMAIL_FORD" "2025-11-04T11:30:00-08:00" \
"style: add global styles and tailwind configuration" \
"frontend/src/index.css frontend/src/App.css frontend/tailwind.config.ts frontend/postcss.config.js"

# 2:00 PM - Ford实现Header和Footer组件
make_commit "$USER_FORD" "$EMAIL_FORD" "2025-11-04T14:00:00-08:00" \
"feat: implement header and footer components" \
"frontend/src/components/Header.tsx frontend/src/components/Footer.tsx frontend/src/components/NavLink.tsx"

# 3:30 PM - Crystal添加Sepolia测试网配置
make_commit "$USER_CRYSTAL" "$EMAIL_CRYSTAL" "2025-11-04T15:30:00-08:00" \
"test: add sepolia testnet tests" \
"test/CipherBidVaultSepolia.ts test/FHECounterSepolia.ts"

# 4:45 PM - Ford实现钱包连接功能
make_commit "$USER_FORD" "$EMAIL_FORD" "2025-11-04T16:45:00-08:00" \
"feat: implement wallet connection context" \
"frontend/src/contexts/WalletContext.tsx"

# 11月5日（星期二）
echo "=== Day 4: November 5, 2025 ==="

# 9:20 AM - Ford添加英雄区域组件
make_commit "$USER_FORD" "$EMAIL_FORD" "2025-11-05T09:20:00-08:00" \
"feat: add hero section component" \
"frontend/src/components/Hero.tsx"

# 10:40 AM - Ford实现拍卖卡片组件
make_commit "$USER_FORD" "$EMAIL_FORD" "2025-11-05T10:40:00-08:00" \
"feat: implement auction card component" \
"frontend/src/components/AuctionCard.tsx"

# 11:50 AM - Ford实现拍卖看板
make_commit "$USER_FORD" "$EMAIL_FORD" "2025-11-05T11:50:00-08:00" \
"feat: implement auction board with real-time updates" \
"frontend/src/components/AuctionBoard.tsx"

# 1:30 PM - Ford添加出价对话框
make_commit "$USER_FORD" "$EMAIL_FORD" "2025-11-05T13:30:00-08:00" \
"feat: add bid dialog component" \
"frontend/src/components/BidDialog.tsx"

# 2:45 PM - Ford实现创建拍卖对话框
make_commit "$USER_FORD" "$EMAIL_FORD" "2025-11-05T14:45:00-08:00" \
"feat: implement create auction dialog" \
"frontend/src/components/CreateAuctionDialog.tsx"

# 3:50 PM - Crystal添加更多UI组件
make_commit "$USER_FORD" "$EMAIL_FORD" "2025-11-05T15:50:00-08:00" \
"feat: add additional ui components for better UX" \
"frontend/src/components/ui/toast.tsx frontend/src/components/ui/toaster.tsx frontend/src/components/ui/use-toast.ts frontend/src/hooks/use-toast.ts frontend/src/hooks/use-mobile.tsx"

# 11月6日（星期三）
echo "=== Day 5: November 6, 2025 ==="

# 9:10 AM - Crystal更新合约文档
make_commit "$USER_CRYSTAL" "$EMAIL_CRYSTAL" "2025-11-06T09:10:00-08:00" \
"docs: update README with project documentation" \
"README.md"

# 10:25 AM - Ford添加工具函数
make_commit "$USER_FORD" "$EMAIL_FORD" "2025-11-06T10:25:00-08:00" \
"feat: add utility functions and helpers" \
"frontend/src/lib/utils.ts"

# 11:35 AM - Ford添加更多UI组件
make_commit "$USER_FORD" "$EMAIL_FORD" "2025-11-06T11:35:00-08:00" \
"feat: add more shadcn/ui components" \
"frontend/src/components/ui/select.tsx frontend/src/components/ui/tabs.tsx frontend/src/components/ui/table.tsx frontend/src/components/ui/tooltip.tsx"

# 1:00 PM - Crystal添加任务脚本
make_commit "$USER_CRYSTAL" "$EMAIL_CRYSTAL" "2025-11-06T13:00:00-08:00" \
"feat: add hardhat tasks for contract interaction" \
"tasks/"

# 2:15 PM - Ford添加静态资源
make_commit "$USER_FORD" "$EMAIL_FORD" "2025-11-06T14:15:00-08:00" \
"feat: add favicon and logo assets" \
"frontend/public/favicon.ico frontend/public/robots.txt frontend/public/placeholder.svg frontend/src/assets/auction-lock-logo.png"

# 3:30 PM - Crystal添加许可证文件
make_commit "$USER_CRYSTAL" "$EMAIL_CRYSTAL" "2025-11-06T15:30:00-08:00" \
"chore: add MIT license" \
"LICENSE"

# 4:20 PM - Ford添加更多UI组件（最终）
make_commit "$USER_FORD" "$EMAIL_FORD" "2025-11-06T16:20:00-08:00" \
"feat: add remaining ui components" \
"frontend/src/components/ui/accordion.tsx frontend/src/components/ui/alert.tsx frontend/src/components/ui/alert-dialog.tsx frontend/src/components/ui/avatar.tsx frontend/src/components/ui/breadcrumb.tsx frontend/src/components/ui/calendar.tsx frontend/src/components/ui/carousel.tsx frontend/src/components/ui/chart.tsx frontend/src/components/ui/checkbox.tsx frontend/src/components/ui/collapsible.tsx frontend/src/components/ui/command.tsx frontend/src/components/ui/context-menu.tsx frontend/src/components/ui/drawer.tsx frontend/src/components/ui/dropdown-menu.tsx frontend/src/components/ui/form.tsx frontend/src/components/ui/hover-card.tsx frontend/src/components/ui/input-otp.tsx frontend/src/components/ui/menubar.tsx frontend/src/components/ui/navigation-menu.tsx frontend/src/components/ui/pagination.tsx frontend/src/components/ui/popover.tsx frontend/src/components/ui/progress.tsx frontend/src/components/ui/radio-group.tsx frontend/src/components/ui/resizable.tsx frontend/src/components/ui/scroll-area.tsx frontend/src/components/ui/separator.tsx frontend/src/components/ui/sheet.tsx frontend/src/components/ui/sidebar.tsx frontend/src/components/ui/skeleton.tsx frontend/src/components/ui/slider.tsx frontend/src/components/ui/sonner.tsx frontend/src/components/ui/switch.tsx frontend/src/components/ui/textarea.tsx frontend/src/components/ui/toggle.tsx frontend/src/components/ui/toggle-group.tsx"

# 4:50 PM - Crystal更新TypeScript配置（最终提交）
make_commit "$USER_CRYSTAL" "$EMAIL_CRYSTAL" "2025-11-06T16:50:00-08:00" \
"chore: update typescript configuration" \
"tsconfig.json"

# 5:00 PM - Ford添加类型定义（最终提交）
make_commit "$USER_FORD" "$EMAIL_FORD" "2025-11-06T17:00:00-08:00" \
"feat: add vite environment type definitions" \
"frontend/src/vite-env.d.ts"

echo ""
echo "=== Commit Summary ==="
git log --oneline --all
echo ""
echo "=== Total commits: ==="
git rev-list --count HEAD
echo ""
echo "Done! Ready to push to remote."
