import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { buildMcpConfig, createLibraryPlugin, libraries } from '../adapters/deepseek-harness/library.mjs';

const runtime = process.env.XIAOO_TEST_DSH_NODE_MODULES;
const native = async (name) => import(pathToFileURL(join(runtime, '@deepseek-ai', name, 'lib/index.js')));

test('Harness native bundle reader accepts both rows, localized names, icons and version peers', {
  skip: runtime ? false : 'set XIAOO_TEST_DSH_NODE_MODULES for native bundle validation',
}, async () => {
  const boot = await native('dsh-app-boot');
  const path = fileURLToPath(new URL('../package.json', import.meta.url));
  const pkg = JSON.parse(await readFile(path, 'utf8'));
  const patchPath = fileURLToPath(new URL('../cordis.patch.yml', import.meta.url));
  const patches = boot.loadOverlayPatches('xiaoo-test', patchPath);
  const entries = boot.composeEntries(patches);
  assert.deepEqual(entries.map(entry => entry.id), ['xiaoo-team-docs', 'xiaoo-knowledge-base']);
  assert.ok(entries.every(entry => entry.disabled === true));
  assert.equal(boot.evaluatePluginCompatibility(pkg, {}, '0.2.1-alpha.1'), undefined);
  assert.equal(boot.evaluatePluginCompatibility(pkg, {}, '0.2.1-alpha.2'), undefined);
  assert.ok(boot.evaluatePluginCompatibility(pkg, {}, '0.2.0'));
  for (const [key, library] of Object.entries(libraries)) {
    const meta = boot.readPluginMeta(`@xiaoo/team-libraries/${key}`, pathToFileURL(path).href);
    assert.equal(meta.error, undefined);
    assert.equal(meta.title['zh-cn'], library.displayName);
    assert.ok(meta.icon);
  }
});

test('adapter registers original skills and native MCP child with scoped disposal', async (t) => {
  const profileDir = await mkdtemp(join(tmpdir(), 'xiaoo-adapter-profile-'));
  for (const key of Object.keys(libraries)) {
    const registered = new Map();
    const effects = [];
    const children = [];
    const logs = [];
    const child = { name: 'test-mcp-client' };
    const ctx = {
      get: (name) => name === 'profileContext' ? { dir: profileDir } : undefined,
      skills: { register(skill) { registered.set(skill.name, skill); return () => registered.delete(skill.name); } },
      effect(setup) { effects.push(setup()); },
      plugin(plugin, config) { children.push({ plugin, config }); },
      logger: { info: (message) => logs.push(message) },
    };
    const plugin = createLibraryPlugin(key, child);
    await plugin.apply(ctx);
    assert.deepEqual(plugin.inject, ['skills', 'tools', 'profileContext']);
    assert.equal(registered.size, 1);
    assert.equal(children.length, 1);
    assert.equal(children[0].plugin, child);
    assert.equal(children[0].config.serverName, libraries[key].serverName);
    assert.ok(logs[0].includes(libraries[key].displayName));
    if (process.platform !== 'win32') {
      assert.equal((await stat(children[0].config.env.MCP_REMOTE_CONFIG_DIR)).mode & 0o777, 0o700);
    }
    for (const dispose of effects.reverse()) dispose();
    assert.equal(registered.size, 0);
  }
});

test('adapter mounts both skills into the real Harness skill registry and unloads them', {
  skip: runtime ? false : 'set XIAOO_TEST_DSH_NODE_MODULES for native skill validation',
}, async (t) => {
  const { Context } = await native('cordis');
  const { SkillRegistry } = await native('dsh-skill');
  const ctx = new Context();
  t.after(() => ctx.fiber.dispose());
  ctx.provide('tools', {});
  ctx.provide('profileContext', { dir: await mkdtemp(join(tmpdir(), 'xiaoo-native-skills-')) });
  await ctx.plugin(SkillRegistry).await();
  const calls = [];
  const fixtureClient = { name: 'fixture-client', async apply(_ctx, config) { calls.push(config.serverName); } };
  const fibers = [];
  for (const key of Object.keys(libraries)) {
    const fiber = ctx.plugin(createLibraryPlugin(key, fixtureClient));
    await fiber.await();
    fibers.push(fiber);
  }
  assert.deepEqual((await ctx.skills.list()).map(skill => skill.name).sort(), ['knowledge-base', 'team-knowledge-base']);
  for (const fiber of fibers) await fiber.dispose();
  assert.deepEqual(await ctx.skills.list(), []);
});

test('real Harness MCP client discovers, invokes and unloads tools through the pinned OAuth bridge', {
  skip: runtime ? false : 'set XIAOO_TEST_DSH_NODE_MODULES to an installed Harness 0.2.1-alpha.1 node_modules',
  timeout: 45000,
}, async (t) => {
  const { Context } = await native('cordis');
  const mcp = await native('dsh-mcp-client');
  const observed = [];
  const server = createServer(async (request, response) => {
    if (request.url !== '/mcp') { response.writeHead(404).end(); return; }
    if (request.method !== 'POST') { response.writeHead(405).end(); return; }
    let body = '';
    for await (const part of request) body += part;
    const message = JSON.parse(body);
    observed.push(message.method);
    if (!Object.hasOwn(message, 'id')) { response.writeHead(202).end(); return; }
    let result;
    switch (message.method) {
      case 'initialize':
        result = { protocolVersion: '2025-11-25', serverInfo: { name: 'xiaoo-local-fixture', version: '1.0.0' }, capabilities: { tools: {} } };
        break;
      case 'ping': result = {}; break;
      case 'tools/list':
        result = { tools: [{ name: 'kb_list_directory', description: 'Fixture only', inputSchema: { type: 'object', properties: {}, additionalProperties: false } }] };
        break;
      case 'tools/call':
        assert.equal(message.params.name, 'kb_list_directory');
        result = { content: [{ type: 'text', text: 'fixture-directory' }] };
        break;
    }
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify(result === undefined
      ? { jsonrpc: '2.0', id: message.id, error: { code: -32601, message: 'Method not found' } }
      : { jsonrpc: '2.0', id: message.id, result }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
  const ctx = new Context();
  t.after(() => ctx.fiber.dispose());
  const tools = new Map();
  ctx.provide('tools', {
    register(definition) {
      tools.set(definition.name, definition);
      return () => tools.delete(definition.name);
    },
  });
  const profileDir = await mkdtemp(join(tmpdir(), 'xiaoo-mcp-fixture-'));
  const config = buildMcpConfig('team-docs', profileDir);
  // Fixture-only override: no production endpoint, member identity or credential is used.
  config.args[1] = `http://127.0.0.1:${server.address().port}/mcp`;
  config.args.push('--allow-http');
  config.failOnStartupError = true;
  config.reconnect = { enabled: false };
  const parsed = mcp.Config(config);
  assert.equal(parsed.serverName, 'xiaooTeamDocs');
  const fiber = ctx.plugin(mcp, config);
  await fiber.await();
  const name = 'mcp__xiaooTeamDocs__kb_list_directory';
  assert.ok(tools.has(name), 'successful installation must register the directory tool');
  const result = await tools.get(name).execute({}, { signal: new AbortController().signal });
  assert.equal(result.content[0].text, 'fixture-directory');
  assert.ok(observed.includes('tools/list'));
  assert.ok(observed.includes('tools/call'));
  await fiber.dispose();
  assert.equal(tools.size, 0);
});
