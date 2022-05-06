declare module '*.svelte' {
  export { SvelteComponentTyped as default } from 'svelte/internal';
}

declare module '*.json' {
  const Text: Record<string, any>;
  export = Text;
}