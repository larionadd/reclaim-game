import type { Worker } from '../store/game'

export function polinaPortrait(
  day: number,
  operations: Worker['operations'] | undefined,
): string {
  const qualifyingDays = (operations ?? [])
    .filter(operation => ['breast_enlargement', 'lactation_hormones'].includes(operation.id) && (!operation.outcome || operation.outcome === 'success'))
    .map(operation => operation.day)
  if (!qualifyingDays.length) return '/art/portraits/polina-initial.jpg'

  const daysSinceModification = day - Math.min(...qualifyingDays)
  if (daysSinceModification >= 60) return '/art/portraits/polina-modified-two-months.png'
  if (daysSinceModification >= 30) return '/art/portraits/polina-modified-month.jpg'
  return '/art/portraits/polina-modified.jpg'
}
