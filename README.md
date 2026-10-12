# 小O协作团队文档库插件市场

这个仓库提供 Codex、Claude 和 DeepSeek Harness 的适配入口，包含两个彼此独立的插件：

- **团队文档库**：连接 COS 案件材料层，技术连接名为 `xiaooTeamDocs`。
- **知识库**：连接 Git/Obsidian 知识层，技术连接名为 `xiaooKnowledgeBase`。

仓库不包含团队资料、成员信息、密码、OAuth 凭据、服务器密钥或私有 Git 内容。

## Codex：添加市场

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

## Claude：同一个市场地址

在支持插件市场的 Claude 客户端中：

1. 打开“自定义 / Customize”→“插件 / Plugins”→“添加 / Add”→“添加市场 / Add marketplace”。
2. 粘贴 `https://github.com/soker12333/team-docs-marketplace`，点击“同步 / Sync”。
3. 分别安装“团队文档库”和“知识库”，需要哪个装哪个。
4. 在连接设置中完成各自的 OAuth，使用成员本人的小O协作身份。Claude Code 可在 `/mcp` 中完成授权。
5. 新建对话，测试“列出团队文档库顶层目录”和“列出知识库顶层目录”。以实际返回目录为成功标准。

不要把 `/kb-mcp/approve` 当作安装地址，也不要复用别人或其他客户端的授权回调链接。
如果客户端只有“连接器 / Connectors”，没有插件市场入口，分别添加以下远程 MCP 地址并授权即可；这种方式连接相同服务，但不会自动安装本仓库的技能说明：

- 团队文档库：`https://cheniplaw.com.cn/kb-mcp/mcp`
- 知识库：`https://cheniplaw.com.cn/knowledge-mcp/mcp`

管理员使用 Claude Code 2.1.296 的严格校验验证市场和两个插件。
新旧 Claude 版本的菜单可能不同；不需要另装一个 MCP 服务端，服务端已在线。

## DeepSeek Harness：安装一个适配包，分别启用两个库

**此适配包用于成员个人电脑运行、个人独立 profile 的 Harness。不能直接在团队共用的云端 profile 中启用；共用 profile 会共用授权身份。**

1. 打开 Harness 的“插件 / Plugins”管理页，不是设置中的只读插件列表。
2. 在安装包 / bundle 的入口粘贴 `https://github.com/soker12333/team-docs-marketplace`，安装并加入当前个人 profile。
3. 安装后会出现“团队文档库”和“知识库”两项，带各自图标。其技术编号为 `xiaoo-team-docs` 和 `xiaoo-knowledge-base`。默认关闭，分别开启需要使用的项。
4. 本机浏览器打开后，用成员本人的小O协作身份授权。两个库分别授权；不用复制令牌，不用服务器终端输入密码。
5. 回到 Harness，等待工具加载。新建对话测试两个顶层目录；能返回真实目录才算完成。

当前适配目标是 **DeepSeek Harness 0.2.1-alpha.1 / 0.2.1-alpha.2，Node.js 22 或更高版本**。其他版本需重新验证，不要跳过客户端给出的版本兼容性警告。

Harness 当前原生 HTTP MCP 客户端不自动处理本服务的 OAuth。本包自动安装固定版本的 `mcp-remote` 浏览器授权桥接，并交由 Harness 原生 MCP 客户端加载工具，不要求成员额外安装 MCP 或手动配置 Bearer Token。授权缓存由桥接组件管理，按个人 profile 和两个库分开；请保护个人 profile，不要复制给其他成员或提交到 Git。

首次授权请及时完成；如果等待过久而显示工具未加载，完成授权后在插件页关闭再开启对应项，重新检查工具列表。没有目录工具时不能改用本地文件或 Git 绕过授权。

没有上述安装界面的旧版本，请管理员升级 Harness 后协助安装。本仓库不改动现有云端 Harness，也不提供已完成多人身份隔离的云端安装方案。

### 管理员验收

- 安装、授权成功和工具可用是三件不同的事。授权后必须确认目录工具已加载，并实际读取目录。
- 三种客户端分别持有自己的授权；一个客户端连接成功，不代表其他客户端自动获得授权。
- 现有 Codex 配置保持不变。Claude 用 `.claude-plugin/marketplace.json`；Harness 用根 `package.json` 的 `dsh.bundle`，不能把 Codex 市场清单当作 Harness 原生清单。
- 在仓库中运行 `npm test` 检查适配配置；运行 `claude plugin validate . --strict` 及两个插件目录的严格校验。
- 本地配置和模拟服务测试不等于成员浏览器 OAuth 验收；发布后还需各客户端实际完成授权和目录读取。
- Harness 0.2.1-alpha.1 的上游 MCP SDK 会被依赖审计报出 OAuth 安全公告 [GHSA-6qxp-vccf-f47h](https://github.com/advisories/GHSA-6qxp-vccf-f47h)。本适配只使用该原生客户端的 **stdio** 路径（公告明确排除此路径），不让它保存或处理 OAuth 凭据；HTTP OAuth 由固定的 `mcp-remote@0.14.3` 负责。本仓库不会自动升级整个 Harness，亦不能据此声称 Host 的其他 HTTP/OAuth 插件安全；管理员应独立安排 Host 升级并复验适配。

## 两个插件不要混用

团队文档库回答“这个案子有哪些原始材料”；知识库回答“这类问题团队已经沉淀了什么知识”。
成员可在同一个市场分别安装两个插件，各自完成一次 OAuth；两个授权和数据层彼此独立。
