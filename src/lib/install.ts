/**
 * What the install banner needs to know, kept out of the component so it can be tested
 * without a browser. Everything here is a pure question about the environment.
 */

/** Remembered only when the reader says never; closing the banner is a decision for one visit. */
export const INSTALL_NEVER_KEY = 'razryad.install.never';

export type InstallEnvironment = {
  standalone: boolean;
  ios: boolean;
};

/** True once the app runs from the home screen: there is nothing left to install. */
export const isStandalone = (window: Window): boolean => {
  const media = typeof window.matchMedia === 'function';
  const asApp = media && window.matchMedia('(display-mode: standalone)').matches;
  // iOS never reports display-mode; it sets a flag on navigator instead.
  const iosApp = 'standalone' in window.navigator && window.navigator.standalone === true;
  return asApp || iosApp;
};

/**
 * iOS never fires beforeinstallprompt, so the banner there can only show instructions.
 * iPadOS reports itself as a Mac, hence the touch check.
 */
export const isIos = (navigator: Navigator): boolean => {
  const platforms = [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod',
  ];
  const platform = 'platform' in navigator ? String(navigator.platform) : '';
  return (
    platforms.includes(platform) ||
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  );
};

/** The banner is offered unless the reader has turned it down for good. */
export const shouldOffer = (
  storage: Pick<Storage, 'getItem'>,
  environment: InstallEnvironment,
): boolean => {
  if (environment.standalone) return false;
  try {
    return storage.getItem(INSTALL_NEVER_KEY) !== '1';
  } catch {
    // Private mode throws on every read; a banner is not worth failing over.
    return true;
  }
};
