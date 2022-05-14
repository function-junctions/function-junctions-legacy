import { get, Writable } from 'svelte/store';

export type DragPoints = Writable<{
  originX: number;
  originY: number;
  translateX: number;
  translateY: number;
  scale: number;
}>;

export type Drag = {
  element: HTMLElement;
  minScale: number;
  maxScale: number;
  scaleSensitivity: number;
  transformation: DragPoints;
};

const hasPositionChanged = ({ pos, prevPos }: { pos: number; prevPos: number }) => pos !== prevPos;

const valueInRange = (
  { minScale, maxScale, scale }: { minScale: number, maxScale: number, scale: number },
) => scale <= maxScale && scale >= minScale;

const getTranslate = (
  { minScale, maxScale, scale }: { minScale: number, maxScale: number, scale: number },
) => (
  { pos, prevPos, translate }: { pos: number, prevPos: number, translate: number },
) =>
  valueInRange({ minScale, maxScale, scale }) && hasPositionChanged({ pos, prevPos })
    ? translate + (pos - prevPos * scale) * (1 - 1 / scale)
    : translate;

const getMatrix = (
  { scale, translateX, translateY }: { scale: number, translateX: number, translateY: number },
) => `matrix(${scale}, 0, 0, ${scale}, ${translateX}, ${translateY})`;

const getScale = (
  { scale, minScale, maxScale, scaleSensitivity, deltaScale }:
    { scale: number, minScale: number, maxScale: number, scaleSensitivity: number, deltaScale: number },
) => {
  let newScale = scale + (deltaScale / (scaleSensitivity / scale));
  newScale = Math.max(minScale, Math.min(newScale, maxScale));
  return [scale, newScale];
};

const pan = ({ state, originX, originY }: { state: Drag, originX: number, originY: number }) => {
  const transformation = get(state.transformation);

  const translateX = transformation.translateX + originX;
  const translateY = transformation.translateY + originY;

  state.transformation.set({
    ...transformation,
    translateX,
    translateY,
  });

  state.element.style.transform = getMatrix({
    scale: transformation.scale,
    translateX,
    translateY,
  });
};

const canPan = (state: Drag) => ({
  panBy: ({ originX, originY }: { originX: number, originY: number }) => pan({ state, originX, originY }),
  panTo: ({ originX, originY, scale }: { originX: number, originY: number, scale: number }) => {
    const transformation = get(state.transformation);

    state.transformation.set({
      ...transformation,
      scale,
    });

    pan({ state, originX: originX - transformation.translateX, originY: originY - transformation.translateY });
  },
});

const canZoom = (state: Drag) => ({
  zoom: ({ x, y, deltaScale }: { x: number, y: number, deltaScale: number }) => {
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

    state.element.style.transformOrigin = `${newOriginX}px ${newOriginY}px`;
    state.element.style.transform = getMatrix({ scale: newScale, translateX, translateY });
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
) => {
  const state: Drag = {
    element,
    minScale,
    maxScale,
    scaleSensitivity,
    transformation,
  };
  return Object.assign({}, canZoom(state), canPan(state));
};