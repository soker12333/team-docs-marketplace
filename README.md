# 小O协作团队文档库插件市场

这个市场包含两个彼此独立的 Codex 插件：

- **团队文档库**：连接 COS 案件材料层，技术连接名为 `xiaooTeamDocs`。
- **知识库**：连接 Git/Obsidian 知识层，技术连接名为 `xiaooKnowledgeBase`。

仓库不包含团队资料、成员信息、密码、OAuth 凭据、服务器密钥或私有 Git 内容。

## 最简单的安装

普通成员只需要在 **Codex 桌面 App** 操作一次：

1. 打开“插件”→“添加插件市场”。
2. 来源填写 `https://github.com/soker12333/team-docs-marketplace`，Git 引用填写 `main`，稀疏路径留空。
3. 点击“添加市场”，分别安装“团队文档库”和“知识库”（需要哪个装哪个）。
4. 在插件卡片中点击连接／授权；浏览器打开后，用自己的小O协作成员身份授权，并回到 Codex。

不需要预装 MCP、Git、SSH、Node.js 或命令行工具；不要填写 Bearer Token，也不要向任何人发送密码。

### 个人 ChatGPT 账号说明

这个市场为成员个人账号提供 Codex MCP 连接，不再包含只能由创建者所在工作区加载的 ChatGPT 自定义应用 ID。个人 ChatGPT 账号无法通过安装市场自动获得一个可共享的 ChatGPT 自定义应用；若未来团队统一使用 Business、Enterprise 或 Edu 工作区，可由管理员另行发布该工作区版本。

若曾看到“无法加载连接器”或以 `asdk_app_` 开头的连接界面，请在 Codex 的“市场”中刷新／升级这两个插件后重新安装，再从插件内完成 OAuth 授权。旧的 ChatGPT 连接可忽略或删除；它不影响新的 Codex MCP 连接。

## 能力

- 搜索、列目录、读取正文、受限 PDF/图片 OCR
- 为有权访问的原文件生成 5 分钟有效下载链接
- 创建目录和 Markdown 文档
- 上传不超过 512 KiB 的文件、更新文档并保留旧版本
- 复制、移动和重命名
- 查看及恢复版本
- 移入回收站、恢复和撤销操作
- 对 Markdown 文件保留 Frontmatter、Wiki Link 和附件相对路径

永久删除、清空回收站、修改成员权限和改写 Git 历史不会开放给 Agent。
大文件上传适配尚未开放；超过 512 KiB 的文件请暂时继续使用小O协作网页的既有上传方式。

## 连接与权限

- 团队文档库 MCP：`https://cheniplaw.com.cn/kb-mcp/mcp`
- 知识库 MCP：`https://cheniplaw.com.cn/knowledge-mcp/mcp`
- Bearer Token：不使用
- 授权：成员自己的小O协作 OAuth
- 服务端继续执行稳定 `accountId`、租户、文档 ACL、版本冲突和审计检查

插件更新后如 Codex 提示重新授权，按提示用自己的账号完成 OAuth；插件入口和市场地址不变。

## 两个插件不要混用

团队文档库回答“这个案子有哪些原始材料”；知识库回答“这类问题团队已经沉淀了什么知识”。
成员可在同一个市场分别安装两个插件，各自完成一次 OAuth；两个授权和数据层彼此独立。
