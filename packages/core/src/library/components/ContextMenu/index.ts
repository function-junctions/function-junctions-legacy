import { writable } from 'svelte/store';

export type ContextMenuItem<T> = {
  type: T;
  title?: string;
  onClick?: () => void;
};

export type GenericContextMenuTypes = 'divider' | 'custom';

export type EditorContextMenuItem = ContextMenuItem<GenericContextMenuTypes>;
export type NodeContextMenuItem = ContextMenuItem<'delete' | 'clone' | GenericContextMenuTypes>;

export type EditorContextMenuBlueprint = {
  nodes: boolean;
  items?: EditorContextMenuItem[];
};

export type NodeContextMenuBlueprint = {
  items: NodeContextMenuItem[];
};

export type EditorContextMenuProp =
  | EditorContextMenuBlueprint
  | ((event: MouseEvent) => void)
  | undefined;
export type NodeContextMenuProp =
  | NodeContextMenuBlueprint
  | ((ids: string[], event: MouseEvent) => void)
  | undefined;

export class ContextMenu {
  element: HTMLElement;
  scope: HTMLElement;

  x = 0;
  y = 0;

  opened = writable(false);

  constructor(element: HTMLElement, scope: HTMLElement) {
    this.element = element;
    this.scope = scope;
  }

  private position = (mouseX: number, mouseY: number) => {
    let { left: scopeOffsetX, top: scopeOffsetY } = this.scope.getBoundingClientRect();

    scopeOffsetX = scopeOffsetX < 0 ? 0 : scopeOffsetX;
    scopeOffsetY = scopeOffsetY < 0 ? 0 : scopeOffsetY;

    const scopeX = mouseX - scopeOffsetX;
    const scopeY = mouseY - scopeOffsetY;

    // ? check if the element will go out of bounds
    const outOfBoundsOnX = scopeX + this.element.clientWidth > this.scope.clientWidth;

    const outOfBoundsOnY = scopeY + this.element.clientHeight > this.scope.clientHeight;

    let normalizedX = mouseX;
    let normalizedY = mouseY;

    // ? normalize on X
    if (outOfBoundsOnX) {
      normalizedX = scopeOffsetX + this.scope.clientWidth - this.element.clientWidth;
    }

    // ? normalize on Y
    if (outOfBoundsOnY) {
      normalizedY = scopeOffsetY + this.scope.clientHeight - this.element.clientHeight;
    }

    return { normalizedX, normalizedY };
  };

  public open = (event: MouseEvent) => {
    event.preventDefault();

    const { pageX: mouseX, pageY: mouseY } = event;

    const { normalizedX, normalizedY } = this.position(mouseX, mouseY);

    this.x = mouseX;
    this.y = mouseY;

    this.element.classList.remove('function-junctions-context_menu-visible');

    this.element.style.top = `${normalizedY}px`;
    this.element.style.left = `${normalizedX}px`;

    this.opened.set(true);

    setTimeout(() => {
      this.element.classList.add('function-junctions-context_menu-visible');
    });
  };

  public close = () => {
    this.element.classList.remove('function-junctions-context_menu-visible');
    this.opened.set(false);
  };

  public evaluate = (event: MouseEvent) => {
    if ((event.target as HTMLElement)?.offsetParent !== this.element) this.close();
  };
}
