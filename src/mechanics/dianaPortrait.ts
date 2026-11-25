import type { Worker } from '../store/game'

const path = '/art/portraits/'

export function dianaPortrait(
  day: number,
  firstArrivalDay: number | undefined,
  active: boolean | undefined,
  housing: Worker['housing'] | undefined,
  operations: Worker['operations'] | undefined,
): string {
  if (firstArrivalDay === undefined || day < firstArrivalDay) return `${path}diana.jpg`
  if (active && housing === 'cage') return `${path}diana-cage.png`

  const qualifyingDays = (operations ?? [])
    .filter(operation => ['breast_enlargement', 'lactation_hormones'].includes(operation.id) && (!operation.outcome || operation.outcome === 'success'))
    .map(operation => operation.day)
  if (qualifyingDays.length > 0) {
    const firstModificationDay = Math.min(...qualifyingDays)
    return `${path}${day - firstModificationDay >= 30 ? 'diana-modified-month.png' : 'diana-modified.png'}`
  }
  if (day - firstArrivalDay >= 30) return `${path}diana-month.jpg`
  if (day - firstArrivalDay >= 7) return `${path}diana-week.jpg`
  return `${path}diana.jpg`
}
