import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { test } from 'node:test';
import { buildMcpConfig, libraries, loadSkill } from '../adapters/deepseek-harness/library.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const json = async (path) => JSON.parse(await readFile(join(root, path), 'utf8'));

test('Claude and Codex expose the same two independent plugin directories', async () => {
  const claude = await json('.claude-plugin/marketplace.json');
  const codex = await json('.agents/plugins/marketplace.json');
  assert.deepEqual(claude.plugins.map(p => p.name), codex.plugins.map(p => p.name));
  for (const library of Object.values(libraries)) {
    const directory = `plugins/${library.plugin}`;
    const manifest = await json(`${directory}/.claude-plugin/plugin.json`);
    const original = await json(`${directory}/.mcp.json`);
    assert.equal(manifest.name, library.plugin);
    assert.equal(manifest.displayName, library.displayName);
    assert.deepEqual(manifest.mcpServers, {
      [library.serverName]: { type: 'http', url: library.url },
    });
    assert.equal(original.mcpServers[library.serverName].url, library.url);
    assert.equal(claude.plugins.find(p => p.name === library.plugin).source, `./${directory}`);
    await access(join(root, directory, manifest.icon));
    await access(join(root, directory, manifest.skills));
  }
});

test('Harness reuses exact skills and keeps the document/knowledge routing boundary', async () => {
  for (const [key, library] of Object.entries(libraries)) {
    const skill = await loadSkill(key);
    assert.equal(skill.name, library.plugin);
    assert.ok(`${skill.description}\n${skill.content}`.includes(library.serverName));
    assert.ok(skill.content.includes(library.url));
    assert.equal(skill.source, 'bundled');
    assert.equal(skill.resourceBase.path, dirname(skill.path));
    const source = await readFile(skill.path, 'utf8');
    assert.ok(source.endsWith(skill.content));
  }
  await assert.rejects(loadSkill('__proto__'), /未知/);
});

test('Harness uses pinned local OAuth bridge, fixed endpoints and no static credentials', () => {
  for (const [key, library] of Object.entries(libraries)) {
    const config = buildMcpConfig(key, root, join(root, 'node_modules/mcp-remote/dist/proxy.js'));
    assert.equal(config.transport, 'stdio');
    assert.equal(config.command, process.execPath);
    assert.equal(config.serverName, library.serverName);
    assert.equal(config.args[1], library.url);
    assert.equal(config.args[config.args.indexOf('--resource') + 1], library.url);
    assert.equal(config.args[config.args.indexOf('--host') + 1], '127.0.0.1');
    const metadata = JSON.parse(config.args[config.args.indexOf('--static-oauth-client-metadata') + 1]);
    assert.equal(metadata.scope, library.scope);
    assert.equal(metadata.token_endpoint_auth_method, 'none');
    assert.equal(config.args.includes('--debug'), false);
    assert.equal(config.args.includes('--silent'), true);
    assert.deepEqual(Object.keys(config.env), ['MCP_REMOTE_CONFIG_DIR']);
    assert.doesNotMatch(JSON.stringify(config), /Bearer |client_secret|--header|--static-oauth-client-info/);
  }
});

test('Harness isolates credentials between libraries and profiles and refuses missing profile', () => {
  const proxy = join(root, 'test-proxy.js');
  const a = buildMcpConfig('team-docs', join(root, 'member-a'), proxy);
  const b = buildMcpConfig('knowledge-base', join(root, 'member-a'), proxy);
  const c = buildMcpConfig('team-docs', join(root, 'member-b'), proxy);
  assert.notEqual(a.env.MCP_REMOTE_CONFIG_DIR, b.env.MCP_REMOTE_CONFIG_DIR);
  assert.notEqual(a.env.MCP_REMOTE_CONFIG_DIR, c.env.MCP_REMOTE_CONFIG_DIR);
  for (const invalid of [undefined, '', '.', '../profile']) {
    assert.throws(() => buildMcpConfig('team-docs', invalid, proxy), /个人本地/);
  }
  assert.throws(() => buildMcpConfig('unknown', root, proxy), /未知/);
  assert.throws(() => buildMcpConfig('team-docs', root, './proxy.js'), /绝对路径/);
});

test('Harness bundle is opt-in and ships native entry points and fixed bridge version', async () => {
  const pkg = await json('package.json');
  assert.equal(pkg.dependencies['mcp-remote'], '0.14.3');
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml');
  const patch = await readFile(join(root, 'cordis.patch.yml'), 'utf8');
  assert.equal((patch.match(/disabled: true/g) || []).length, 2);
  for (const key of ['team-docs', 'knowledge-base']) {
    await access(join(root, pkg.exports[`./${key}`]));
    assert.ok(patch.includes(`@xiaoo/team-libraries/${key}`));
  }
});
