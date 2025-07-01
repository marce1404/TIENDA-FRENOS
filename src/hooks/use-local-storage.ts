
"use client";

import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = (value: T | ((val: T) => T)) => void;

function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    // This effect runs when the key changes or on first mount to initialize from localStorage.
    // It should not depend on initialValue if initialValue can be a new reference (e.g. [] or {}) on each render.
    let valueToSet: T;
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      if (item !== null) {
        valueToSet = JSON.parse(item);
      } else {
        valueToSet = initialValue;
        if (typeof window !== 'undefined') {
          // Initialize localStorage if item doesn't exist for this key.
          window.localStorage.setItem(key, JSON.stringify(initialValue));
        }
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      valueToSet = initialValue;
      if (typeof window !== 'undefined') {
        try {
            // Attempt to set initialValue in localStorage as a fallback.
            window.localStorage.setItem(key, JSON.stringify(initialValue));
        } catch (e) {
            console.error(`Error setting localStorage key "${key}" during fallback:`, e);
        }
      }
    }
    setStoredValue(valueToSet);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // Only depend on key. initialValue is captured in closure for initial setup.

  const setValue: SetValue<T> = useCallback(
    (value) => {
      try {
        setStoredValue(prevStoredValue => { // Use functional update
          const valueToStore = value instanceof Function ? value(prevStoredValue) : value;
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
          return valueToStore;
        });
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key] // setValue is stable if key is stable.
  );
  
  return [storedValue, setValue];
}

export default useLocalStorage;
