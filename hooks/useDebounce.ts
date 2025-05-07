// Dans hooks/useDebounce.ts (ou un autre fichier de hooks)
import { useState, useEffect } from 'react';

// Hook générique pour le debounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Met à jour la valeur 'debounced' après le délai spécifié
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Annule le timeout si la 'value' change avant la fin du délai
    // C'est le coeur du debounce : on ne met à jour que si l'utilisateur arrête de taper
    return () => {
      clearTimeout(handler);
    };
  },
  [value, delay] // Se ré-exécute seulement si la valeur ou le délai change
  );

  return debouncedValue;
}