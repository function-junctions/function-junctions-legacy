import { useEffect, useState } from 'react';
import { get, Readable, Writable } from 'svelte/store';

export const useReadable = <T = unknown>(store: Readable<T>) => {
  const [value, set] = useState<T>();

  useEffect(() => store.subscribe(set), [store]);

  return value == undefined ? get(store) : value;
};

export function useWritable<T = unknown>(store: Writable<T>) {
  const [value, set] = useState<T>();

  useEffect(() => store.subscribe(set), [store]);

  return [value == undefined ? get(store) : value, store.set, store.update];
}
