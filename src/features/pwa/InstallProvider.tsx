'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { trackGoal } from '@/lib/analytics';
import { INSTALL_NEVER_KEY, isIos, isStandalone, shouldOffer } from '@/lib/install';
import { shouldRunTour } from '@/lib/onboarding';

/** The event Chrome fires instead of showing its own prompt. It is not in lib.dom yet. */
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const isInstallEvent = (event: Event): event is InstallEvent =>
  'prompt' in event && 'userChoice' in event;

export type Install = {
  /** Chrome kept an event for us: the app can be installed right here, right now. */
  ready: boolean;
  /** Already running from the home screen; there is nothing left to install. */
  standalone: boolean;
  ios: boolean;
  /** Whether the banner is on screen. */
  offered: boolean;
  show: () => void;
  hide: () => void;
  /** The card with the instructions, opened from the header and from the banner. */
  modal: boolean;
  openModal: () => void;
  closeModal: () => void;
  never: () => void;
  install: () => Promise<void>;
};

const InstallContext = createContext<Install | null>(null);

/** A moment of quiet first: a banner that meets the reader mid-tap is a banner in the way. */
const DELAY_MS = 1500;

/**
 * One owner for the install: the header button and the banner both need the event Chrome
 * hands over once, and only one listener may claim it.
 */
export function InstallProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [ios, setIos] = useState(false);
  const [offered, setOffered] = useState(false);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    const environment = { standalone: isStandalone(window), ios: isIos(navigator) };
    setStandalone(environment.standalone);
    setIos(environment.ios);
    if (environment.standalone) return;

    const onBeforeInstall = (event: Event) => {
      // Keep the event: Chrome only lets it be used later if its own prompt was suppressed.
      event.preventDefault();
      if (isInstallEvent(event)) setPrompt(event);
    };
    // Installing from the browser menu would leave the app offering an installed app.
    const onInstalled = () => {
      trackGoal('pwa_installed');
      setPrompt(null);
      setStandalone(true);
      setOffered(false);
      setModal(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    // The banner comes by itself only to a reader who has not turned it down, and never
    // on the first visit: the tour is running then, and two invitations at once are one
    // too many. From the second visit the tour is done and the banner has the screen.
    const welcome = shouldRunTour(localStorage);
    const timer =
      shouldOffer(localStorage, environment) && !welcome
        ? window.setTimeout(() => setOffered(true), DELAY_MS)
        : undefined;

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  const install = useCallback(async () => {
    if (prompt === null) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setPrompt(null);
    if (outcome === 'accepted') {
      setOffered(false);
      setModal(false);
    }
  }, [prompt]);

  const never = useCallback(() => {
    trackGoal('install_banner_never');
    try {
      localStorage.setItem(INSTALL_NEVER_KEY, '1');
    } catch {
      // Nothing to remember it with; the banner closes for this visit at least.
    }
    setOffered(false);
  }, []);

  const value = useMemo<Install>(
    () => ({
      ready: prompt !== null,
      standalone,
      ios,
      offered,
      show: () => setOffered(true),
      hide: () => setOffered(false),
      modal,
      openModal: () => setModal(true),
      closeModal: () => setModal(false),
      never,
      install,
    }),
    [prompt, standalone, ios, offered, modal, never, install],
  );

  return <InstallContext.Provider value={value}>{children}</InstallContext.Provider>;
}

/** Null outside the provider, so a component can render without one, as tests do. */
export const useInstall = (): Install | null => useContext(InstallContext);
