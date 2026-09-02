---
name: team-knowledge-base
description: 使用小O协作团队知识库搜索、阅读、创建、上传、编辑、整理、版本恢复和回收站。用户提到“团队文档库”“团队知识库”“查团队资料”“整理团队资料”“上传到团队库”或明确要求使用 xiaooTeamDocs 时使用。
---

# 团队知识库

## 连接

- 只连接 `https://cheniplaw.com.cn/kb-mcp/mcp`，不配置 Bearer Token。
- 登录只通过小O协作 OAuth 页面完成；不得读取、记录、复述或输出密码、授权码或令牌。
- 所有访问继续受成员身份、租户和文档 ACL 限制。
- 连接不可用时明确请用户重新连接，不得自动改用 Git、本地文件系统或同名数据源绕过权限。

## 能力

读取：

- `kb_list_directory`
- `kb_search_files`
- `kb_read_document`
- `kb_list_versions`
- `kb_list_trash`

写入和整理：

- `kb_create_directory`
- `kb_create_document`
- `kb_update_document`
- `kb_upload_file`：受限小文件，必须校验字节数和 SHA-256
- `kb_prepare_upload`、`kb_complete_upload`：大文件受控上传会话
- `kb_rename_item`
- `kb_move_item`
- `kb_copy_item`
- `kb_move_to_trash`
- `kb_restore_item`
- `kb_restore_version`
- `kb_undo_operation`

不存在永久删除、清空回收站、权限修改或 Git 历史改写工具，不得声称或尝试这些能力。

## 操作规则

1. 写入前先读取目标及其当前版本，向修改工具传 `expected_version`，冲突时停止并展示差异，不强制覆盖。
2. 每次写入使用新的幂等键；网络重试复用同一幂等键，避免重复创建或重复移动。
3. 用户已经明确指定的单个创建或更新可以直接执行；批量移动、批量重命名、版本恢复、移入回收站或影响范围不清楚时，先列出变更预览并取得确认。
4. 修改产生新版本；恢复旧版本也产生新的恢复版本，不抹除中间历史。
5. 删除只使用 `kb_move_to_trash`，返回操作编号和恢复方式。
6. 回答中报告成功、跳过、冲突和失败项，并保留服务返回的操作编号。

## Obsidian 兼容

- 保留 Markdown、Frontmatter、`[[Wiki Link]]` 和附件相对路径。
- 未经明确要求不得重排 Frontmatter、批量改写链接或改变附件目录结构。
- `.obsidian/`、隐藏同步状态、Git 内部目录和系统临时文件默认不可写。
- MCP 不能直接读取成员电脑上的 `local_path`。上传必须使用用户实际提供的内容或服务返回的受控上传会话；不得声称仅凭本地路径已经上传。
