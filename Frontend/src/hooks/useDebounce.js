import { useState, useEffect } from "react";

/**
 * useDebounce — delays updating a value until the user stops changing it.
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default 2000ms)
 */
export function useDebounce(value, delay = 2000) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer); // cleanup on every change
  }, [value, delay]);

  return debouncedValue;
}