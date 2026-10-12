import * as mcpClient from '@deepseek-ai/dsh-mcp-client';
import { createLibraryPlugin } from './library.mjs';

const plugin = createLibraryPlugin('knowledge-base', mcpClient);
export const { name, inject, apply } = plugin;
