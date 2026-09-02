# 小O协作团队文档库插件市场

这是“团队文档库”的公开安装外壳。仓库不包含团队文档、成员资料、密码、OAuth 凭据、
服务器配置或私有 Git 信息。

## 安装

在 ChatGPT/Codex 桌面 App 的“添加插件市场”中填写：

| 字段 | 内容 |
|---|---|
| 来源 | `https://github.com/soker12333/team-docs-marketplace` |
| Git 引用 | `main` |
| 稀疏路径 | 留空 |

点击“添加市场”，然后安装“团队文档库”。首次使用时，通过小O协作 OAuth 页面使用自己的
成员身份授权。不要填写 Bearer Token，也不要向任何人发送密码。

## 安全边界

- MCP：`https://cheniplaw.com.cn/kb-mcp/mcp`
- OAuth scope：`kb.read`
- 工具：列目录、搜索、读取
- 不支持上传、覆盖、删除、移动或权限修改

公开本安装外壳不会公开知识库内容。实际访问始终由服务器端成员身份、租户隔离和文档 ACL 控制。
