import Link from 'next/link';
import { GoalOnView } from '@/features/goals/GoalOnView';
import { SiteShell } from '@/features/site-shell/SiteShell';
import s from './not-found.module.css';

/** The root layout is bare, so the 404 page puts the chrome on itself. */
export default function NotFound() {
  return (
    <SiteShell>
      <div className={s.root}>
        <span className={s.code}>404</span>
        <h1>Страницы нет</h1>
        <Link href="/">На главную</Link>
        <GoalOnView goal="page_not_found" />
      </div>
    </SiteShell>
  );
}
