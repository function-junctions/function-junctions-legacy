
import { get, type Writable } from 'svelte/store';

export type Position = {
  originX: number;
  originY: number;
  translateX: number;
  translateY: number;
  scale: number;
};

export type Drag = {
  element: HTMLElement;
  minScale: number;
  maxScale: number;
  scaleSensitivity: number;
  transformation: Writable<Position>;
};

export type HasPositionChanged = (position: { pos: number; prevPos: number }) => boolean;
export type ValueInRange = (scale: { minScale: number, maxScale: number, scale: number }) => boolean;
export type GetTruePosition = (scale: {
  x: number,
  y: number,
  scale: number,
  translateX: number,
  translateY: number,
  originX: number,
  originY: number,
}) => { x: number, y: number };
export type GetTranslate = (scale: { minScale: number, maxScale: number, scale: number })
  => (position: { pos: number, prevPos: number, translate: number }) => number;
export type GetMatrix = (translate: { scale: number, translateX: number, translateY: number }) => string;
export type GetScale = (scale: {
  scale: number,
  minScale: number,
  maxScale: number,
  scaleSensitivity: number,
  deltaScale: number,
}) => [number, number];
export type Pan = (positions: { state: Drag, originX: number, originY: number }) => void;
export type CanPan = (state: Drag) => {
  panBy: (origins: { originX: number, originY: number }) => void;
  panTo: (positions: { originX: number, originY: number, scale: number }) => void;
};
export type CanZoom = (state: Drag) => {
   zoom: (postions: { x: number, y: number, deltaScale: number }) => void;
};
export type DragInstance = ReturnType<CanZoom> & ReturnType<CanPan>;

const hasPositionChanged: HasPositionChanged = ({ pos, prevPos }) => pos !== prevPos;

const valueInRange: ValueInRange = ({ minScale, maxScale, scale }) => scale <= maxScale && scale >= minScale;

const getTranslate: GetTranslate = ({ minScale, maxScale, scale }) => ({ pos, prevPos, translate }) =>
  valueInRange({ minScale, maxScale, scale }) && hasPositionChanged({ pos, prevPos })
    ? translate + (pos - prevPos * scale) * (1 - 1 / scale)
    : translate;

export const getTruePosition: GetTruePosition = ({ x, y, scale, translateX, translateY, originX, originY }) => {
  const xRelativeToTranslation = x - translateX;
  const yRelativeToTranslation = y - translateY;

  const offsetX = (originX * scale) - originX;
  const offsetY = (originY * scale) - originY;

  return {
    x: (xRelativeToTranslation + offsetX) / scale,
    y: (yRelativeToTranslation + offsetY) / scale,
  };
};

export const getMatrix: GetMatrix = ({ scale, translateX, translateY }) =>
  `matrix(${scale}, 0, 0, ${scale}, ${translateX}, ${translateY})`;

const getScale: GetScale = ({ scale, minScale, maxScale, scaleSensitivity, deltaScale }) => {
  let newScale = scale + (deltaScale / (scaleSensitivity / scale));
  newScale = Math.max(minScale, Math.min(newScale, maxScale));
  return [scale, newScale];
};

const pan: Pan = ({ state, originX, originY }) => {
  const transformation = get(state.transformation);

  const translateX = transformation.translateX + originX;
  const translateY = transformation.translateY + originY;

  state.transformation.set({
    ...transformation,
    translateX,
    translateY,
  });
};

const canPan: CanPan = (state: Drag) => ({
  panBy: ({ originX, originY }) => pan({ state, originX, originY }),
  panTo: ({ originX, originY, scale }) => {
    const transformation = get(state.transformation);

    state.transformation.set({
      ...transformation,
      scale,
    });

    pan({ state, originX: originX - transformation.translateX, originY: originY - transformation.translateY });
  },
});

const canZoom: CanZoom = (state) => ({
  zoom: ({ x, y, deltaScale }) => {
    const transformation = get(state.transformation);
    const { left, top } = state.element.getBoundingClientRect();
    const { minScale, maxScale, scaleSensitivity } = state;

    const [scale, newScale] = getScale({
      scale: transformation.scale,
      deltaScale,
      minScale,
      maxScale,
      scaleSensitivity,
    });

    const originX = x - left;
    const originY = y - top;
    const newOriginX = originX / scale;
    const newOriginY = originY / scale;

    const translate = getTranslate({ scale, minScale, maxScale });
    
    const translateX = translate({
      pos: originX,
      prevPos: transformation.originX,
      translate: transformation.translateX,
    });

    const translateY = translate({
      pos: originY,
      prevPos: transformation.originY,
      translate: transformation.translateY,
    });

    state.transformation.set({
      originX: newOriginX,
      originY: newOriginY,
      translateX,
      translateY,
      scale: newScale,
    });
  },
});

export default (
  { minScale, maxScale, element, transformation, scaleSensitivity = 100 }: {
    minScale: number,
    maxScale: number,
    element: HTMLElement,
    transformation: Drag['transformation'];
    scaleSensitivity: number,
  },
): DragInstance => {
  const state: Drag = {
    element,
    minScale,
    maxScale,
    scaleSensitivity,
    transformation,
  };
  return Object.assign({}, canZoom(state), canPan(state));
};