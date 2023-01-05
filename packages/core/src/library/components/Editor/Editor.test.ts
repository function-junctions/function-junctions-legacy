import { tick } from 'svelte';
import { get, writable } from 'svelte/store';
import { InternalEditor } from '.';

describe('Core: Tests for the "Editor" component', () => {
  it('should see if editor properly initializes', async () => {
    const editor = new InternalEditor({
      blueprint: writable({}),
    });

    await tick();

    expect(get(editor.state.restored)).toBe(true);
  });

  it('should see if editor properly sets to readonly', async () => {
    const editor = new InternalEditor({
      blueprint: writable({}),
      readonly: true,
    });

    await tick();

    expect(get(editor.readonly)).toBe(true);
  });
});
