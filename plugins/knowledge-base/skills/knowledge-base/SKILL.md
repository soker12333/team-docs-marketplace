---
name: knowledge-base
description: 使用团队 Git/Obsidian 知识库搜索、阅读、创建知识页、追加建议、编辑、整理、版本恢复和回收站。用户明确提到“知识库”“Obsidian 知识页”“Git 知识库”“沉淀知识”或要求使用 xiaooKnowledgeBase 时使用；提到“团队文档库”、案件原件、证据或 COS 文件时不使用。
---

# 知识库

## 连接边界

- 只连接 `https://cheniplaw.com.cn/knowledge-mcp/mcp`，连接名为 `xiaooKnowledgeBase`，不配置 Bearer Token。
- 登录只通过小O协作 OAuth 页面完成；不得读取、记录、复述或输出密码、授权码或令牌。
- 本插件操作 Git/Obsidian 知识层。案件原件、证据、合同和其他 COS 材料应使用独立的“团队文档库”插件，不得把两者混用。
- 连接不可用时请用户重新连接，不得自动改用服务器文件系统、Git 凭据或本地 Obsidian 目录绕过权限。

## 读取与写入

读取工具：

- `knowledge_list_directory`
- `knowledge_search`
- `knowledge_read`
- `knowledge_list_trash`
- `knowledge_list_versions`

写入工具：

- `knowledge_create_directory`
- `knowledge_create_page`
- `knowledge_upload_attachment`
- `knowledge_update_page`
- `knowledge_append_suggestion`
- `knowledge_move`
- `knowledge_copy`
- `knowledge_move_to_trash`
- `knowledge_restore_trash`
- `knowledge_restore_version`
- `knowledge_undo_operation`

不存在永久删除、清空回收站、权限修改、强制覆盖或 Git 历史改写工具。

## 知识治理

1. 写入前先读取 `AGENTS.md`、根 `index.md`、目标目录入口和目标页面；涉及案件类型时还要读取案件类型清单。
2. 原始材料、保密证据、身份证号、银行账号和访问凭据不得进入知识库；原件留在团队文档库，只在知识页保留可回源路径。
3. 法律命题、案号、数字和逐字引文必须有明确出处；不能回源时标记 `⚠️待核实`。
4. 人写页面不能整页覆盖；使用 `knowledge_append_suggestion` 追加到 `## 小O建议`。
5. 写入使用读取结果返回的 `version` 和 `repoVersion`。发生内容或仓库冲突时停止、重新读取并展示差异，不强制覆盖。
6. 每次变更会自动追加 `log.md` 并形成 Git commit；回答中报告操作编号、提交和变更路径。

## 变更确认

- 用户明确指定的单个创建、更新或追加建议可以直接执行。
- 批量移动、批量重命名、移入回收站、恢复历史版本或影响范围不明确时，先列出预览并取得确认。
- 删除只使用回收站工具；恢复和撤销也创建新提交，不抹除中间历史。
- 附件必须由用户实际提供，当前上限 2 MiB；不能仅凭成员电脑的本地路径声称已经上传。

## Obsidian 兼容

- 保留 Markdown Frontmatter、`[[Wiki Link]]`、Canvas 和附件相对路径。
- 未经明确要求不得批量改写 Frontmatter、链接或附件目录。
- `.obsidian/`、`.git/`、隐藏目录、符号链接和同步状态不可访问或写入。
