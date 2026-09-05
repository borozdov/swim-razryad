'use client';

import { useEffect } from 'react';
import { appHeight, isKeyboardOpen } from '@/lib/keyboard';

const FIELDS = 'input[type="text"], input[type="number"], textarea';

/**
 * Marks the document while the on-screen keyboard is up, so the layout can give it room
 * instead of being pushed off screen. Touch only: on a desktop, focusing a field takes
 * nothing away.
 */
export function KeyboardMode() {
  useEffect(() => {
    const viewport = window.visualViewport;
    const touch = window.matchMedia('(pointer: coarse)').matches;
    if (!viewport || !touch) return;

    const root = document.documentElement;
    let base = Math.max(window.innerHeight, viewport.height);

    const update = () => {
      // The tallest viewport seen is the one without a keyboard.
      if (viewport.height > base) base = viewport.height;
      const focused = document.activeElement?.matches(FIELDS) === true;
      const open = isKeyboardOpen(base, viewport.height, focused);
      root.style.setProperty('--keyboard-app-height', `${appHeight(viewport.height)}px`);
      const was = root.classList.contains('keyboard-open');
      root.classList.toggle('keyboard-open', open);
      if (open && !was) {
        // Let the layout settle before asking the browser to bring the field into view.
        window.setTimeout(() => {
          const active = document.activeElement;
          if (active instanceof HTMLElement && active.matches(FIELDS)) {
            active.scrollIntoView({ block: 'center', inline: 'nearest' });
          }
        }, 120);
      }
    };

    const later = () => window.setTimeout(update, 100);
    const rotated = () =>
      window.setTimeout(() => {
        base = Math.max(window.innerHeight, viewport.height);
        update();
      }, 300);

    viewport.addEventListener('resize', update);
    document.addEventListener('focusin', later);
    document.addEventListener('focusout', later);
    window.addEventListener('orientationchange', rotated);

    // A tap outside a field puts the keyboard away; nothing else here would.
    const blurOnOutsideTap = (event: PointerEvent) => {
      const active = document.activeElement;
      if (!(active instanceof HTMLElement) || !active.matches(FIELDS)) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (active.contains(target)) return;
      if (target.closest('input, textarea, select, button, label, a')) return;
      active.blur();
    };
    document.addEventListener('pointerdown', blurOnOutsideTap);

    update();
    return () => {
      viewport.removeEventListener('resize', update);
      document.removeEventListener('focusin', later);
      document.removeEventListener('focusout', later);
      window.removeEventListener('orientationchange', rotated);
      document.removeEventListener('pointerdown', blurOnOutsideTap);
      root.classList.remove('keyboard-open');
    };
  }, []);

  return null;
}
