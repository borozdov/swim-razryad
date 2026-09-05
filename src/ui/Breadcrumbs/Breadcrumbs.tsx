import Link from 'next/link';
import s from './Breadcrumbs.module.css';

export type Crumb = {
  label: string;
  /** The last crumb is the page itself and carries no link. */
  href?: string;
};

export type BreadcrumbsProps = {
  items: readonly Crumb[];
};

/**
 * The trail back up. It is the one piece of structured data both search engines read,
 * and the only way off a reference page that does not go through the browser's back
 * button, so it is shown and not only marked up.
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className={s.root} aria-label="Хлебные крошки">
      <ol className={s.list}>
        {items.map((item, index) => (
          <li key={item.label} className={s.item}>
            {item.href === undefined ? (
              <span aria-current="page">{item.label}</span>
            ) : (
              <Link href={item.href} className={s.link}>
                {item.label}
              </Link>
            )}
            {index === items.length - 1 ? null : (
              <span className={s.separator} aria-hidden="true">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
