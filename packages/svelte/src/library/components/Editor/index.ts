import type { Editor } from 'core/types';
import type { SvelteComponentDev } from 'svelte/internal';

export type SvelteEditor = Editor<typeof SvelteComponentDev>;
