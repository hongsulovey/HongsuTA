"use client";

import { useEffect, useMemo } from "react";

const EVENT_START = "ta-ui-hover-start";
const EVENT_END = "ta-ui-hover-end";

type Handlers = {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
};

export function useUiHoverTrigger(): Handlers {
  return useMemo(
    () => ({
      onMouseEnter: () => window.dispatchEvent(new Event(EVENT_START)),
      onMouseLeave: () => window.dispatchEvent(new Event(EVENT_END)),
      onFocus: () => window.dispatchEvent(new Event(EVENT_START)),
      onBlur: () => window.dispatchEvent(new Event(EVENT_END)),
    }),
    []
  );
}

export function useUiHoverListener(onChange: (hovered: boolean) => void) {
  useEffect(() => {
    let counter = 0;
    const start = () => {
      counter += 1;
      onChange(counter > 0);
    };
    const end = () => {
      counter = Math.max(0, counter - 1);
      onChange(counter > 0);
    };
    window.addEventListener(EVENT_START, start);
    window.addEventListener(EVENT_END, end);
    return () => {
      window.removeEventListener(EVENT_START, start);
      window.removeEventListener(EVENT_END, end);
    };
  }, [onChange]);
}
