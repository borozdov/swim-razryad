import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InstallButton } from './InstallButton';
import { InstallModal } from './InstallModal';
import { InstallProvider } from './InstallProvider';

/** jsdom has no matchMedia; the environment answers "a browser tab", not "an installed app". */
const asBrowserTab = (installed: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches: query.includes('display-mode: standalone') ? installed : false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
};

/** The event Chrome fires; the provider keeps it and the button spends it. */
const fireInstallEvent = () => {
  const prompt = vi.fn().mockResolvedValue(undefined);
  const event = Object.assign(new Event('beforeinstallprompt'), {
    prompt,
    userChoice: Promise.resolve({ outcome: 'accepted' as const }),
  });
  fireEvent(window, event);
  return prompt;
};

const renderButton = () =>
  render(
    <InstallProvider>
      <InstallButton />
      <InstallModal />
    </InstallProvider>,
  );

beforeEach(() => {
  localStorage.clear();
  asBrowserTab(false);
});

describe('the install button of the header', () => {
  it('offers the install while the app runs in a browser tab', () => {
    renderButton();

    expect(screen.getByRole('button', { name: 'Установить приложение' })).toBeInTheDocument();
  });

  it('says nothing once the app runs from the home screen', () => {
    asBrowserTab(true);
    renderButton();

    expect(screen.queryByRole('button', { name: 'Установить приложение' })).not.toBeInTheDocument();
  });

  it('opens the card, and the card installs where the browser lets it', () => {
    renderButton();
    const prompt = fireInstallEvent();

    fireEvent.click(screen.getByRole('button', { name: 'Установить приложение' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Установить' }));
    expect(prompt).toHaveBeenCalledOnce();
  });

  it('tells where to look when the browser hands over no prompt', () => {
    renderButton();

    fireEvent.click(screen.getByRole('button', { name: 'Установить приложение' }));

    expect(screen.getByRole('dialog')).toHaveTextContent('меню браузера');
    expect(screen.queryByRole('button', { name: 'Установить' })).not.toBeInTheDocument();
  });
});
