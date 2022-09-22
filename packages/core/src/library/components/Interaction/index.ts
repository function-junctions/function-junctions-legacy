const getCoordinates = (event: MouseEvent | TouchEvent) => {
  let pageX: number;
  let pageY: number;

  if ('touches' in event) {
    const touch = event.touches[0];

    pageX = touch.pageX;
    pageY = touch.pageY;
  } else {
    pageX = event.pageX;
    pageY = event.pageY;
  }

  return {
    pageX,
    pageY,
  };
};
const zoom = (event: WheelEvent) => {
  if (zoomable) {
    event.preventDefault();

    const factor = 3.5;
    dragger.zoom({
      deltaScale: Math.sign(event.deltaY) > 0 ? -factor : factor,
      x: event.pageX,
      y: event.pageY,
    });
  }
};

const pinch = (event: TouchEvent) => {
  if (zoomable) {
    const [x1, y1] = [event.touches[0].pageX, event.touches[0].pageY];
    const [x2, y2] = [event.touches[1].pageX, event.touches[1].pageY];

    const distance = Math.hypot(x1 - x2, y1 - y2);

    if (typeof previousDistance !== 'undefined') {
      const x = (x1 + x2) / 2;
      const y = (y1 + y2) / 2;
      const factor = distance / 40;
      const delta = distance / previousDistance - 1;

      dragger.zoom({
        deltaScale: Math.sign(delta) > 0 ? factor : -factor,
        x,
        y,
      });
    }

    previousDistance = distance;
  }
};
const startDrag = (event: MouseEvent | TouchEvent) => {
  if ('button' in event && event.button === 2) return;
  if (contextMenuOpen) return;

  const { pageX, pageY } = getCoordinates(event);

  previousCoordinates.x = pageX;
  previousCoordinates.y = pageY;

  containerMoving = true;
};

const endDrag = () => {
  nodeMoving = false;
  containerMoving = false;
};
const drag = (event: MouseEvent | TouchEvent) => {
  event.preventDefault();
  const { pageX, pageY } = getCoordinates(event);

  const movementX = pageX - (previousCoordinates?.x ?? 0);
  const movementY = pageY - (previousCoordinates?.y ?? 0);

  if (containerMoving && !nodeMoving && pannable) {
    dragger.panBy({
      originX: movementX,
      originY: movementY,
    });
  } else if (containerMoving && nodeMoving && $selectedNodesIds && moveable) {
    $selectedNodesIds.forEach((id) => {
      if ($selectedNodesIds.some((selectedNodeId) => id === selectedNodeId)) {
        const node = $nodes[id];

        // Get z coordinate to determine scale so nodes travel faster with scale
        const { scale } = $position;

        if (node) {
          nodes.update((prevNode) => ({
            ...prevNode,
            [id]: {
              ...node,
              x: node.x + movementX / scale,
              y: node.y + movementY / scale,
            },
          }));
        }
      }
    });
  }

  previousCoordinates.x = pageX;
  previousCoordinates.y = pageY;
};

const touch = (event: TouchEvent) => {
  event.preventDefault();

  if (event.touches.length === 2) {
    pinch(event);
  } else if (event.touches.length === 1) {
    drag(event);
  }
};

const dragNode = (event: MouseEvent | TouchEvent, key: string) => {
  if ('button' in event && event.button === 2) return;
  if ('touches' in event && event.touches.length > 1) return;

  if (!moveable) return;
  if (containerMoving) return;
  if (contextMenuOpen) return;

  if (
    event.shiftKey &&
    multiselect &&
    !$selectedNodesIds.some((selectedNodeId) => key === selectedNodeId)
  ) {
    $selectedNodesIds = [...$selectedNodesIds, key];
  } else {
    $selectedNodesIds = [key];
  }

  nodeMoving = true;
};
