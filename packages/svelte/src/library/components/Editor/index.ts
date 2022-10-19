import type { Editor } from '@function-junctions/core';
import type { SvelteComponentDev } from 'svelte/internal';

export type SvelteEditor = Editor<typeof SvelteComponentDev>;
