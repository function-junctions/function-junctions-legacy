import React from 'react';
import { get, Readable, Writable } from 'svelte/store';

export type Setter<T> = (v: T) => void;
export type UpdateFn<T> = (v: T) => T;
export type Updater<T> = (u: UpdateFn<T>) => void;

const unset: any = Symbol();

export function useReadable<T>(store: Readable<T>): T {
  const [value, set] = React.useState<T>(unset as unknown as T);

  React.useEffect(() => {
    const unsubscribe = store.subscribe(set);
    return () => unsubscribe();
  }, [store]);

  return value === unset ? get(store) : value;
}

export function useWritable<T>(store: Writable<T>): [T, Setter<T>, Updater<T>] {
  const value = useReadable(store);
  return [value, store.set, store.update];
}
