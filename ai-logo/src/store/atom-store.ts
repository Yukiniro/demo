import { atom } from "jotai";

export const viewSizeAtom = atom<{ width: number; height: number }>({
  width: 500,
  height: 500,
});

export const updateViewSizeAtom = atom(null, (get, set, size: { width: number; height: number }) => {
  const currentSize = get(viewSizeAtom);
  if (currentSize.width === size.width && currentSize.height === size.height) {
    return;
  }
  set(viewSizeAtom, size);
});
