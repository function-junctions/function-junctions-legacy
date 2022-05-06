declare module '*.svelte' {
  export { SvelteComponentDev as default } from 'svelte/internal';
}

declare module '*.json' {
  const Text: Record<string, any>;
  export = Text;
}