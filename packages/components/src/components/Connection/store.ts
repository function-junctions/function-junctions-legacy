import { writable } from 'svelte/store';
import { ConnectionSocket } from '../Socket';
import { Point } from '../../types';

export const liveConnectionPoints = writable<{
  points: { p1: Point, p2: Point },
  socket?: ConnectionSocket;
} | undefined>();
export const showLiveConnection = writable<boolean>(false);