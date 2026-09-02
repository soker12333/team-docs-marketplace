# 小O协作团队文档库插件市场

这是“团队文档库”的公开安装外壳，连接 COS 案件材料层。它不是 Git/Obsidian“知识库”插件。仓库不包含团队资料、成员信息、密码、OAuth 凭据、服务器密钥或私有 Git 内容。

## 最简单的安装

普通成员只需要在 Codex/ChatGPT 桌面 App 操作一次：

1. 打开“插件”→“添加插件市场”。
2. 来源填写 `https://github.com/soker12333/team-docs-marketplace`，Git 引用填写 `main`，稀疏路径留空。
3. 点击“添加市场”，安装“团队文档库”。
4. 浏览器打开后，用自己的小O协作成员身份授权。

不需要预装 MCP、Git、SSH、Node.js 或命令行工具；不要填写 Bearer Token，也不要向任何人发送密码。

## 能力

- 搜索、列目录、读取正文和受限 PDF OCR
- 创建目录和 Markdown 文档
- 上传不超过 512 KiB 的文件、更新文档并保留旧版本
- 复制、移动和重命名
- 查看及恢复版本
- 移入回收站、恢复和撤销操作
- 对 Markdown 文件保留 Frontmatter、Wiki Link 和附件相对路径

永久删除、清空回收站、修改成员权限和改写 Git 历史不会开放给 Agent。
大文件上传适配尚未开放；超过 512 KiB 的文件请暂时继续使用小O协作网页的既有上传方式。

## 连接与权限

- MCP：`https://cheniplaw.com.cn/kb-mcp/mcp`
- Bearer Token：不使用
- 授权：成员自己的小O协作 OAuth
- 服务端继续执行稳定 `accountId`、租户、文档 ACL、版本冲突和审计检查

升级完整读写版后，已有只读授权需要重新完成一次 OAuth；插件入口和市场地址不变。
