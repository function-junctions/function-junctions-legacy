import {
  ContextMenu as ContextMenuType,
  ContextMenu as ContextMenuClass,
} from 'core/components/ContextMenu';
import React from 'react';
import { Unsubscriber } from 'svelte/store';

export type ContextMenuProps = {
  containerRef: React.RefObject<HTMLDivElement>;
  instance: ContextMenuType;
  setInstance: React.Dispatch<React.SetStateAction<ContextMenuType>>;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
};

const ContextMenu = ({
  children,
  containerRef,
  instance,
  setInstance,
  setOpened,
}: ContextMenuProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [unsubscribe, setUnsubscribe] = React.useState<Unsubscriber>();

  React.useEffect(() => {
    if (ref && ref?.current && containerRef && containerRef.current) {
      setInstance(new ContextMenuClass(ref.current, containerRef.current));
      const { opened: value } = instance;

      setUnsubscribe(value.subscribe((isOpened) => setOpened(isOpened)));
    }
  }, [ref, setInstance, containerRef, instance, setOpened]);

  React.useEffect(() => {
    return () => {
      unsubscribe?.();
    };
  }, [unsubscribe]);

  return (
    <div className="function-junctions-context_menu" ref={ref}>
      {children}
    </div>
  );
};

export default ContextMenu;
