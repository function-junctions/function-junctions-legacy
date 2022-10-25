// TODO: make all these functions pure

import { get, Writable } from 'svelte/store';
import { InternalNode, Point } from '../..';
import { ContextMenu, EditorContextMenuBlueprint, NodeContextMenuBlueprint } from '../ContextMenu';
import Drag, { Position } from '../Drag';

export type InteractionContextMenu<T, C> =
  | { type: 'instance'; instance: ContextMenu; blueprint: T }
  | { type: 'callback'; callback: C };

export class Interaction {
  nodes: Writable<Record<string, InternalNode<unknown, any>>>;
  selectedNodesIds: string[] = [];

  position: Writable<Position>;

  options: {
    multiselect?: boolean;
    zoomable?: boolean;
    pannable?: boolean;
    moveable?: boolean;
  } = {
    multiselect: true,
    zoomable: true,
    pannable: true,
    moveable: true,
  };

  nodeMoving = false;
  containerMoving = false;

  previousCoordinates: Point = { x: 0, y: 0 };
  previousDistance?: number;

  dragger?: ReturnType<typeof Drag>;

  contextMenuOpen = false;
  editorContextMenu?: InteractionContextMenu<
    EditorContextMenuBlueprint,
    (event: MouseEvent) => void
  >;
  nodeContextMenu?: InteractionContextMenu<
    NodeContextMenuBlueprint,
    (ids: string[], event: MouseEvent) => void
  >;

  constructor(
    nodes: Writable<Record<string, InternalNode<unknown, any>>>,
    position: Writable<Position>,
    dragger?: ReturnType<typeof Drag>,
    options?: {
      multiselect?: boolean;
      zoomable?: boolean;
      pannable?: boolean;
      moveable?: boolean;
    },
    contextMenuOptions?: {
      editorContextMenu?: InteractionContextMenu<
        EditorContextMenuBlueprint,
        (event: MouseEvent) => void
      >;
      nodeContextMenu?: InteractionContextMenu<
        NodeContextMenuBlueprint,
        (ids: string[], event: MouseEvent) => void
      >;
    },
  ) {
    this.nodes = nodes;
    this.position = position;
    this.dragger = dragger;

    if (options) this.options = options;

    if (contextMenuOptions) {
      if (contextMenuOptions.editorContextMenu)
        this.editorContextMenu = contextMenuOptions.editorContextMenu;
      if (contextMenuOptions.nodeContextMenu)
        this.nodeContextMenu = contextMenuOptions.nodeContextMenu;
    }
  }

  private getCoordinates = (event: MouseEvent | TouchEvent) => {
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

  public zoom = (event: WheelEvent) => {
    if (this.options.zoomable) {
      const factor = 3.5;
      this.dragger?.zoom({
        deltaScale: Math.sign(event.deltaY) > 0 ? -factor : factor,
        x: event.pageX,
        y: event.pageY,
      });
    }
  };

  public pinch = (event: TouchEvent): number | void => {
    if (this.options.zoomable) {
      const [x1, y1] = [event.touches[0].pageX, event.touches[0].pageY];
      const [x2, y2] = [event.touches[1].pageX, event.touches[1].pageY];

      const distance = Math.hypot(x1 - x2, y1 - y2);

      if (this.previousDistance != null) {
        const x = (x1 + x2) / 2;
        const y = (y1 + y2) / 2;
        const factor = distance / 40;
        const delta = distance / this.previousDistance - 1;

        this.dragger?.zoom({
          deltaScale: Math.sign(delta) > 0 ? factor : -factor,
          x,
          y,
        });
      }

      this.previousDistance = distance;
    }
  };

  public startDrag = (event: MouseEvent | TouchEvent, contextMenuOpen?: boolean): Point | void => {
    if ('button' in event && event.button === 2) return;
    if (contextMenuOpen) return;

    const { pageX, pageY } = this.getCoordinates(event);

    this.previousCoordinates = { x: pageX, y: pageY };
    this.containerMoving = true;
  };

  public drag = (event: MouseEvent | TouchEvent): Point | void => {
    event.preventDefault();
    const { pageX, pageY } = this.getCoordinates(event);

    const movementX = pageX - (this.previousCoordinates.x ?? 0);
    const movementY = pageY - (this.previousCoordinates.y ?? 0);

    if (this.containerMoving && !this.nodeMoving && this.options.pannable) {
      this.dragger?.panBy({
        originX: movementX,
        originY: movementY,
      });
    } else if (
      this.containerMoving &&
      this.nodeMoving &&
      this.selectedNodesIds &&
      this.options.moveable
    ) {
      this.selectedNodesIds.forEach((id) => {
        if (this.selectedNodesIds.some((selectedNodeId) => id === selectedNodeId)) {
          const node = get(this.nodes)[id];

          // Get z coordinate to determine scale so nodes travel faster with scale
          const { scale } = get(this.position);

          if (node) {
            this.nodes.update((prevNode) => ({
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

    this.previousCoordinates = { x: pageX, y: pageY };
  };

  public touch = (event: TouchEvent) => {
    event.preventDefault();

    if (event.touches.length === 2) {
      this.pinch(event);
    } else if (event.touches.length === 1) {
      this.drag(event);
    }
  };

  public dragNode = (event: MouseEvent | TouchEvent, key: string) => {
    if ('button' in event && event.button === 2) return;
    if ('touches' in event && event.touches.length > 1) return;

    if (!this.options.moveable) return;
    if (this.containerMoving) return;
    if (this.contextMenuOpen) return;

    if (
      event.shiftKey &&
      this.options.multiselect &&
      !this.selectedNodesIds.some((selectedNodeId) => key === selectedNodeId)
    ) {
      this.selectedNodesIds = [...this.selectedNodesIds, key];
    } else {
      this.selectedNodesIds = [key];
    }

    this.nodeMoving = true;
  };

  public endDrag = () => {
    this.nodeMoving = false;
    this.containerMoving = false;
  };

  public openEditorContextMenu = (event: MouseEvent) => {
    if (this.nodeContextMenu && this.nodeContextMenu.type === 'instance')
      this.nodeContextMenu.instance.close();

    if (this.editorContextMenu) {
      event.preventDefault();

      if (this.editorContextMenu.type === 'instance') {
        this.editorContextMenu.instance.open(event);
      } else if (this.editorContextMenu.type === 'callback') {
        this.editorContextMenu.callback(event);
      }
    }
  };

  public openNodeContextMenu = (event: MouseEvent, key: string) => {
    if (this.nodeContextMenu) {
      this.selectedNodesIds = [key];

      event.preventDefault();
      event.stopPropagation();

      if (this.nodeContextMenu.type === 'instance') {
        this.nodeContextMenu.instance.close();
        this.nodeContextMenu.instance.open(event);
      } else if (this.nodeContextMenu.type === 'callback') {
        this.nodeContextMenu.callback(this.selectedNodesIds, event);
      }
    }
  };
}
