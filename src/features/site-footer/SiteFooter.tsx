import { AuthorLink } from './AuthorLink';
import s from './SiteFooter.module.css';

/** Links out of the app, tagged so the main site can tell which one a visitor followed. */
export const authorUrl = (campaign: string): string =>
  `https://borozdov.ru/?utm_source=razryad.borozdov.ru&utm_medium=referral&utm_campaign=${campaign}`;

export const AUTHOR_URL = authorUrl('author_footer');

/** Who made it and where to find him. Nothing else in the footer. */
export function SiteFooter() {
  return (
    <footer className={s.root} data-chrome="footer">
      <span className={s.author}>
        Сделал <b>Nikita Borozdov</b>
        <br />
        мастер спорта
      </span>
      <AuthorLink href={AUTHOR_URL} />
    </footer>
  );
}
