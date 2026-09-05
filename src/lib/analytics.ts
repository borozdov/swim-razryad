/**
 * Yandex Metrika. Nothing loads and nothing is reported until the counter exists: the
 * number below is the only place to fill in, and while it is null the app carries no
 * third-party script at all.
 *
 * Goal names match fina.borozdov.ru where the two apps do the same thing, because a goal
 * in Metrika matches on the exact string and renaming one loses its history.
 */
export const METRIKA_ID: number | null = null;

export type Goal =
  | 'theme_toggle'
  | 'select_pool'
  | 'select_sex'
  | 'select_stroke'
  | 'select_distance'
  | 'calc_time_to_points'
  | 'share_result'
  | 'share_app'
  | 'onboarding_next'
  | 'onboarding_prev'
  | 'onboarding_finish'
  | 'install_open'
  | 'install_banner_action'
  | 'install_banner_never'
  | 'pwa_installed'
  | 'to_site';

type Params = Record<string, string | number>;

type Metrika = (id: number, action: string, goal: string, params?: Params) => void;

/** Reports a goal if a counter is configured and loaded. Silent otherwise, never throwing. */
export const trackGoal = (goal: Goal, params?: Params): void => {
  if (METRIKA_ID === null) return;
  const ym = (window as unknown as { ym?: Metrika }).ym;
  if (typeof ym !== 'function') return;
  try {
    ym(METRIKA_ID, 'reachGoal', goal, params);
  } catch {
    // Analytics is never a reason for the app to fail.
  }
};

/** The counter's own loader, inlined in the head so it starts before hydration. */
export const metrikaScript = (id: number): string =>
  `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};` +
  `m[i].l=1*new Date();for(var j=0;j<e.scripts.length;j++){if(e.scripts[j].src===r){return}}` +
  `k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})` +
  `(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${id}','ym');` +
  `ym(${id},'init',{webvisor:true,clickmap:true,accurateTrackBounce:true,trackLinks:true});`;
