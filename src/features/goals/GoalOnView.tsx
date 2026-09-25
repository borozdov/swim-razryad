'use client';

import { useEffect } from 'react';
import { trackGoal, type Goal } from '@/lib/analytics';

export type GoalOnViewProps = {
  goal: Goal;
};

/**
 * Reports a goal once the page is on screen, with the path it was reached at. For the
 * 404 page: the host answers an unknown address with a page and not a status Metrika
 * can see, so without this a broken link reads as an ordinary visit.
 */
export function GoalOnView({ goal }: GoalOnViewProps) {
  useEffect(() => {
    trackGoal(goal, { path: window.location.pathname });
  }, [goal]);
  return null;
}
