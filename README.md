# bigrich88888.xin

个人主页网站代码仓库 - 支持多工具协同开发

## 📁 仓库结构

```
bigrich/
├── www/                    # 静态文件 (Nginx 托管)
│   ├── index.html          # 首页
│   ├── css/                # 样式文件
│   ├── js/                 # JavaScript
│   ├── images/             # 图片资源
│   └── ...
├── astro-site/             # Astro 源码 (Slash 内容站)
│   ├── src/
│   │   ├── content/slash/  # Markdown 内容
│   │   └── pages/
│   ├── package.json
│   └── astro.config.mjs
├── .github/
│   └── workflows/
│       └── deploy.yml      # 自动部署工作流
├── .gitignore
└── README.md
```

## 🚀 协同开发工作流

### 分支策略

| 分支 | 用途 | 部署 |
|------|------|------|
| `main` | 生产环境代码 | 自动部署到服务器 |
| `develop` | 开发集成分支 | 不自动部署 |
| `feature/*` | 功能开发分支 | - |

### 标准开发流程

1. **克隆仓库**
   ```bash
   git clone https://github.com/racheleleanorzhang-Q/bigrich.git
   cd bigrich
   ```

2. **创建功能分支**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/your-feature-name
   ```

3. **开发并提交**
   - 使用任何 coding 工具进行修改
   - 提交代码：
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   git push -u origin HEAD
   ```

4. **创建 Pull Request**
   - 在 GitHub 上创建 PR
   - 等待 CI 检查和代码审查
   - 合并到 `develop` 分支

5. **发布到生产**
   - 从 `develop` 创建 PR 到 `main`
   - 合并后自动触发部署

## 🤖 支持的 Coding 工具

任何支持 GitHub 集成的工具都可以协同工作：

- **Claude Code** - `claude` 命令
- **OpenAI Codex** - CLI agent
- **OpenCode** - 功能开发 agent
- **Hermes Agent** - 完整工作流支持
- **手动编辑** - 直接提交 PR

## 🔐 部署配置

GitHub Actions 自动部署需要以下 Secrets：

| Secret | 说明 |
|--------|------|
| `SERVER_SSH_KEY` | SSH 私钥 (用于连接服务器) |
| `SERVER_HOST` | 服务器 IP 或域名 |
| `SERVER_USER` | SSH 用户名 |
| `SERVER_PORT` | SSH 端口 (默认 22) |

### 配置步骤

1. 生成 SSH 密钥对 (如果还没有):
   ```bash
   ssh-keygen -t ed25519 -C "github-actions"
   ```

2. 将公钥添加到服务器 `~/.ssh/authorized_keys`

3. 将私钥添加到 GitHub Secrets:
   - 进入仓库 Settings → Secrets and variables → Actions
   - 点击 New repository secret
   - 添加 `SERVER_SSH_KEY` (私钥内容)

## 📝 提交规范

使用 Conventional Commits:

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

示例:
```
feat: add new project showcase section

- Add project grid layout
- Add filter by category
- Add project detail modal
```

## 🌐 网站结构

- **首页**: `https://bigrich88888.xin/`
- **Slash 内容站**: `https://bigrich88888.xin/slash`
- **Admin 编辑器**: `https://bigrich88888.xin/admin/`

---

**License**: MIT  
**Author**: Rachel Xia
