import { ContextMenu as ContextMenuType, ContextMenu as ContextMenuClass } from 'core/index';
import React from 'react';

export type ContextMenuProps = {
  containerRef: React.RefObject<HTMLDivElement>;
  instance: ContextMenuType | undefined;
  setInstance: React.Dispatch<React.SetStateAction<ContextMenuType | undefined>>;
  onOpened: (opened: boolean) => void;
  children: React.ReactNode;
};

const ContextMenu = ({
  children,
  containerRef,
  instance,
  setInstance,
  onOpened,
}: ContextMenuProps) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref && ref?.current && containerRef && containerRef.current) {
      if (!instance) {
        const contextMenuInstance = new ContextMenuClass(ref.current, containerRef.current);
        setInstance(contextMenuInstance);

        if (contextMenuInstance) {
          const { opened: value } = contextMenuInstance;

          value.subscribe((isOpened) => {
            onOpened(isOpened);
          });
        }
      } else {
        instance.scope = containerRef.current;
      }
    }
  }, [ref, setInstance, containerRef, instance, onOpened]);

  return (
    <div className="function-junctions-context_menu" ref={ref}>
      {children}
    </div>
  );
};

export default ContextMenu;
