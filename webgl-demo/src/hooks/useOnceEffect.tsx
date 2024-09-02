/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";

function useOnceEffect(effect: () => void, p0: never[]) {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) {
      return;
    }
    mounted.current = true;
    return effect();
  }, []);
}

export default useOnceEffect;
