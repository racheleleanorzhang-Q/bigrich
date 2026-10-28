# 协同开发快速入门

## 🎯 使用场景

本仓库设计用于支持多个 AI coding 工具协同开发个人主页 bigrich88888.xin

## 📥 快速开始

### 1. 克隆仓库
```bash
git clone https://github.com/racheleleanorzhang-Q/bigrich.git
cd bigrich
```

### 2. 安装依赖 (仅 Astro 开发需要)
```bash
cd astro-site
npm install
```

### 3. 本地开发
```bash
# 启动 Astro 开发服务器
cd astro-site
npm run dev

# 或直接修改 www/ 下的静态文件
```

## 🌿 分支工作流

### 开发新功能
```bash
# 从 develop 分支创建功能分支
git checkout develop
git pull origin develop
git checkout -b feat/add-new-feature

# 开发完成后提交
git add .
git commit -m "feat: add new feature description"
git push -u origin HEAD

# 然后去 GitHub 创建 Pull Request
```

### 修复 Bug
```bash
git checkout develop
git pull origin develop
git checkout -b fix/login-bug

# 修复后提交
git add .
git commit -m "fix: resolve login redirect issue"
git push -u origin HEAD
```

## 🤖 AI 工具协同

### Claude Code
```bash
claude "feat: add contact form to index.html"
# Claude 会自动创建分支、修改代码、提交 PR
```

### OpenAI Codex
```bash
codex "fix: update CSS for mobile responsive"
```

### Hermes Agent
```bash
# 可以直接委托任务给 subagent
delegate_task "refactor: improve page load performance"
```

## 📋 Pull Request 流程

1. **创建 PR**: 在 GitHub 上点击 "Compare & pull request"
2. **填写描述**: 说明改动内容和测试方法
3. **等待审查**: 至少需要 1 人批准
4. **合并**: 使用 Squash merge 保持历史清晰

### PR 模板
```markdown
## 改动内容
- 修改了...
- 新增了...

## 测试方法
- [ ] 本地测试通过
- [ ] 无控制台错误

## 相关 Issue
Closes #XX
```

## 🚀 部署

### 自动部署
- 推送到 `main` 分支 → 自动触发 GitHub Actions 部署
- 部署到服务器：`/usr/share/nginx/html/`

### 手动部署 (本地)
```bash
cd ~/bigrich
./scripts/deploy.sh
```

## 🔐 需要的 Secrets

GitHub Actions 部署需要配置以下 Secrets：

1. 进入仓库 Settings → Secrets and variables → Actions
2. 添加以下 secrets:

| Secret | 值 |
|--------|-----|
| `SERVER_SSH_KEY` | SSH 私钥内容 |
| `SERVER_HOST` | bigrich88888.xin |
| `SERVER_USER` | admin |
| `SERVER_PORT` | 22 |

## 📁 文件组织

```
bigrich/
├── www/              # 静态文件 → 直接部署到 Nginx
│   ├── index.html
│   ├── css/
│   └── js/
├── astro-site/       # Astro 源码 → 需要 build
│   ├── src/
│   └── dist/         # build 输出
└── scripts/          # 工具脚本
```

## ⚠️ 注意事项

1. **不要提交 node_modules** - 已在 .gitignore 中排除
2. **不要直接推送到 main** - 必须通过 PR
3. **保持 develop 更新** - 定期从 main 同步
4. **PR 描述清晰** - 方便审查和追溯

## 🔗 相关链接

- 仓库：https://github.com/racheleleanorzhang-Q/bigrich
- 网站：https://bigrich88888.xin
- Issues: https://github.com/racheleleanorzhang-Q/bigrich/issues
