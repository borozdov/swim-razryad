import Link from 'next/link';
import { ShareAppButton } from '@/features/share/ShareAppButton';
import { HOME_PATH } from '@/lib/routes';
import { SITE_URL, canonicalUrl } from '@/lib/seo';
import { ThemeToggle } from '@/ui';
import { QrCode } from './QrCode';
import s from './QrScreen.module.css';

/** What a scanner reads: the canonical home address, trailing slash and all. */
const TARGET = canonicalUrl(HOME_PATH);

/** The address without its scheme, the way a chip prints it. */
const HOST = new URL(SITE_URL).host;

/** The letter of the seal: the app answers to it the way fina answers to F. */
const SEAL = 'Р';

const TAGS = ['PWA', 'Оффлайн', 'Нормативы'];

/**
 * The card a camera is pointed at. A screen of its own, outside the shell: the header,
 * the sections and the footer would all be noise around a code someone is scanning.
 * It carries the same data-screen as the shell does, because globals.css keys the
 * one-screen rule off that attribute and this card is one screen too.
 */
export function QrScreen() {
  return (
    <div className={s.page} data-screen="app">
      <Link href={HOME_PATH} className={s.back} aria-label="Назад" title="Назад">
        <svg
          className={s.backIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </Link>
      <div className={s.theme}>
        <ThemeToggle />
      </div>

      <article className={s.card}>
        <Link href={HOME_PATH} className={s.logo} aria-label="Разряд, by Borozdov">
          <span className={s.logoTop}>Разряд</span>
          <span className={s.logoBottom}>by Borozdov</span>
        </Link>

        <div className={s.plate}>
          <QrCode text={TARGET} seal={SEAL} />
        </div>

        <div className={s.info}>
          {/* The one heading of the screen: a card with no heading is a card with no name. */}
          <h1 className={s.title}>Разрядные нормативы ЕВСК</h1>
          <p className={s.subtitle}>Отсканируйте, чтобы открыть сайт</p>
        </div>

        <div className={s.actions}>
          <Link href={HOME_PATH} className={s.chip}>
            <svg
              className={s.chipIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            {HOST}
          </Link>
          <ShareAppButton label="Поделиться" />
        </div>

        <div className={s.divider} />

        <div className={s.tags}>
          {TAGS.map((tag) => (
            <span key={tag} className={s.tag}>
              {tag}
            </span>
          ))}
        </div>
      </article>
    </div>
  );
}
