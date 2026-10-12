import { readFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../../', import.meta.url));

// Endpoint and scope are intentionally not user-configurable. No credential input.
export const libraries = Object.freeze({
  'team-docs': Object.freeze({
    displayName: '团队文档库',
    plugin: 'team-knowledge-base',
    serverName: 'xiaooTeamDocs',
    url: 'https://cheniplaw.com.cn/kb-mcp/mcp',
    scope: 'kb.read kb.create kb.upload kb.edit kb.organize kb.trash kb.restore',
  }),
  'knowledge-base': Object.freeze({
    displayName: '知识库',
    plugin: 'knowledge-base',
    serverName: 'xiaooKnowledgeBase',
    url: 'https://cheniplaw.com.cn/knowledge-mcp/mcp',
    scope: 'knowledge.read knowledge.create knowledge.edit knowledge.organize knowledge.trash knowledge.restore',
  }),
});

function libraryFor(key) {
  if (!Object.hasOwn(libraries, key)) throw new Error('未知的小O协作插件');
  return libraries[key];
}

export async function loadSkill(key) {
  const library = libraryFor(key);
  const path = join(root, 'plugins', library.plugin, 'skills', library.plugin, 'SKILL.md');
  const markdown = await readFile(path, 'utf8');
  // Only our checked-in, single-line name/description metadata is supported here.
  // Fail closed on future format changes; do not silently register a wrong skill.
  const match = /^---\r?\nname: ([a-z0-9-]+)\r?\ndescription: ([^\r\n]+)\r?\n---\r?\n([\s\S]+)$/.exec(markdown);
  if (!match || match[1] !== library.plugin) throw new Error('插件技能元数据格式错误');
  return {
    name: match[1], description: match[2], content: match[3], path,
    source: 'bundled', resourceBase: { kind: 'directory', path: dirname(path) },
  };
}

export function buildMcpConfig(key, profileDir, proxyPath = undefined) {
  const library = libraryFor(key);
  if (typeof profileDir !== 'string' || !isAbsolute(profileDir)) {
    throw new Error('需要独立的个人本地 Harness profile；不能使用共享云端成员身份');
  }
  const proxy = proxyPath ?? join(dirname(require.resolve('mcp-remote/package.json')), 'dist/proxy.js');
  if (!isAbsolute(proxy)) throw new Error('OAuth 桥接程序必须使用绝对路径');
  return {
    transport: 'stdio',
    serverName: library.serverName,
    command: process.execPath,
    args: [
      proxy, library.url,
      '--transport', 'http-only',
      '--host', '127.0.0.1',
      '--resource', library.url,
      '--auth-timeout', '300',
      '--static-oauth-client-metadata', JSON.stringify({
        client_name: `小O协作 ${library.displayName} · DeepSeek Harness`,
        scope: library.scope,
        token_endpoint_auth_method: 'none',
      }),
      '--silent',
    ],
    // mcp-remote owns OAuth persistence; this adapter never reads or logs tokens.
    // Separate both profile and library, including on the same operating-system user.
    env: { MCP_REMOTE_CONFIG_DIR: join(profileDir, '.xiaoo-oauth', key) },
    toolCallTimeoutMs: 120000,
    failOnStartupError: false,
  };
}

export function createLibraryPlugin(key, mcpClient) {
  const library = libraryFor(key);
  return {
    name: `xiaoo-${key}`,
    inject: ['skills', 'tools', 'profileContext'],
    async apply(ctx) {
      const profile = ctx.get('profileContext');
      const config = buildMcpConfig(key, profile?.dir);
      await mkdir(config.env.MCP_REMOTE_CONFIG_DIR, { recursive: true, mode: 0o700 });
      const skill = await loadSkill(key);
      ctx.effect(() => ctx.skills.register(skill));
      // Native client owns tool discovery, calls, reconnection and scoped cleanup.
      ctx.plugin(mcpClient, config);
      ctx.logger.info(`${library.displayName}：请在本机浏览器完成本人授权；工具列表加载成功后才能使用。`);
    },
  };
}
