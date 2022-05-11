import { writable } from 'svelte/store';

export const getAppearance = (appearance: 'light' | 'dark' | 'auto') => {
  const className = writable<'light' | 'dark'>(appearance !== 'auto' ? appearance : 'light');

  if (appearance !== 'auto') return className;

  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', ({ matches }) => className.set(matches ? 'dark' : 'light'));

  className.set(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  return className;
};