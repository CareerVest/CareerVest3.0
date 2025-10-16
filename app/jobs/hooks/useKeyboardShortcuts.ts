import { useEffect } from 'react';

interface KeyboardShortcutsConfig {
  onNext: () => void;
  onPrevious: () => void;
  onApply: () => void;
  onSkip: () => void;
  onView: () => void;
}

export function useKeyboardShortcuts({
  onNext,
  onPrevious,
  onApply,
  onSkip,
  onView,
}: KeyboardShortcutsConfig) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'arrowright':
          event.preventDefault();
          onNext();
          break;
        case 'arrowleft':
          event.preventDefault();
          onPrevious();
          break;
        case 'a':
          event.preventDefault();
          onApply();
          break;
        case 's':
          event.preventDefault();
          onSkip();
          break;
        case 'v':
          event.preventDefault();
          onView();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrevious, onApply, onSkip, onView]);
}
