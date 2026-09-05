import Link from 'next/link';
import { QR_PATH } from '@/lib/routes';
import s from './QrLink.module.css';

/** The way into the QR card, an icon in the header the way fina.borozdov.ru carries it. */
export function QrLink() {
  return (
    <Link href={QR_PATH} className={s.root} aria-label="QR-код приложения" title="QR-код">
      <svg
        className={s.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="8" height="8" rx="1" />
        <rect x="14" y="2" width="8" height="8" rx="1" />
        <rect x="2" y="14" width="8" height="8" rx="1" />
        <rect x="14" y="14" width="4" height="4" rx="0.5" />
        <rect x="20" y="14" width="2" height="2" rx="0.3" />
        <rect x="14" y="20" width="2" height="2" rx="0.3" />
        <rect x="20" y="20" width="2" height="2" rx="0.3" />
        <rect x="5" y="5" width="2" height="2" rx="0.3" fill="currentColor" />
        <rect x="17" y="5" width="2" height="2" rx="0.3" fill="currentColor" />
        <rect x="5" y="17" width="2" height="2" rx="0.3" fill="currentColor" />
      </svg>
    </Link>
  );
}
