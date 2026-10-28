# 🔐 GitHub Actions 部署配置指南

## 已生成的 SSH 密钥

**密钥位置:**
- 私钥：`~/.ssh/bigrich_deploy`
- 公钥：`~/.ssh/bigrich_deploy.pub`

---

## 步骤 1: 将公钥添加到服务器

在终端执行以下命令，将公钥添加到服务器的 `~/.ssh/authorized_keys`:

```bash
# 查看公钥内容
cat ~/.ssh/bigrich_deploy.pub

# 复制输出内容，然后通过 SSH 添加到服务器
ssh admin@bigrich88888.xin "mkdir -p ~/.ssh && chmod 700 ~/.ssh"
cat ~/.ssh/bigrich_deploy.pub | ssh admin@bigrich88888.xin "cat >> ~/.ssh/authorized_keys"
chmod 600 ~/.ssh/authorized_keys
```

**或者手动方式:**
1. 运行 `cat ~/.ssh/bigrich_deploy.pub` 复制公钥内容
2. SSH 登录服务器：`ssh admin@bigrich88888.xin`
3. 编辑 `~/.ssh/authorized_keys` 文件，粘贴公钥

---

## 步骤 2: 在 GitHub 配置 Secrets

1. 打开仓库：https://github.com/racheleleanorzhang-Q/bigrich/settings/secrets/actions

2. 点击 **New repository secret**，添加以下 4 个 secrets:

| Secret 名称 | 值 |
|------------|-----|
| `SERVER_SSH_KEY` | 运行 `cat ~/.ssh/bigrich_deploy` 的内容（整个私钥） |
| `SERVER_HOST` | `bigrich88888.xin` |
| `SERVER_USER` | `admin` |
| `SERVER_PORT` | `22` |

### 获取私钥内容

```bash
cat ~/.ssh/bigrich_deploy
```

复制**全部**输出内容（包括 `-----BEGIN OPENSSH PRIVATE KEY-----` 和 `-----END OPENSSH PRIVATE KEY-----`），粘贴到 GitHub Secrets 的 Value 字段。

---

## 步骤 3: 测试部署

配置完成后，触发一次手动部署测试：

1. 进入 https://github.com/racheleleanorzhang-Q/bigrich/actions
2. 点击左侧 **Deploy to Production**
3. 点击 **Run workflow** → **Run workflow** 按钮

观察部署是否成功。

---

## ✅ 验证清单

- [ ] 公钥已添加到服务器 `~/.ssh/authorized_keys`
- [ ] GitHub Secrets 已配置 4 个值
- [ ] 手动触发部署测试成功
- [ ] 网站 https://bigrich88888.xin 可正常访问

---

## 🔧 故障排查

### 部署失败：Permission denied (publickey)
- 检查公钥是否正确添加到服务器
- 检查 `~/.ssh/authorized_keys` 权限是否为 600
- 检查 `~/.ssh` 目录权限是否为 700

### 部署失败：Connection refused
- 检查服务器 IP/域名是否正确
- 检查 SSH 端口是否为 22
- 检查服务器防火墙设置

### 部署失败：sudo 权限问题
- 确保 `admin` 用户有 sudo 权限
- 或修改 deploy.yml 使用 root 用户

---

**创建时间:** 2026-10-28  
**密钥类型:** ED25519
