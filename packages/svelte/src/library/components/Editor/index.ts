import type { Editor } from 'core/index';
import type { SvelteComponentDev } from 'svelte/internal';

export type SvelteEditor = Editor<typeof SvelteComponentDev>;
