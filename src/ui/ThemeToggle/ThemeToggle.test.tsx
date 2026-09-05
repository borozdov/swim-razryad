import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from '@/lib/theme';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'obsidian');
  });

  it('switches the look and saves the choice for the next visit', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('titan');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('titan');

    fireEvent.click(button);
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('obsidian');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('obsidian');
  });

  it('names the look a click leads to', () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'titan');
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: 'Включить тёмную тему' })).toBeInTheDocument();
  });

  it('resolves the look itself when the inline script did not run', () => {
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
    localStorage.setItem(THEME_STORAGE_KEY, 'titan');
    render(<ThemeToggle />);
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('titan');
  });
});
