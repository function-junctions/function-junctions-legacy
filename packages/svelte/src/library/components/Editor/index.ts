import { InternalEditor, type InternalEditorOptions } from 'core/index';
import type { SvelteComponentDev } from 'svelte/internal';

export class Editor extends InternalEditor<typeof SvelteComponentDev, string> {
  constructor(options: InternalEditorOptions<typeof SvelteComponentDev, string>) {
    super(options);
  }
}
