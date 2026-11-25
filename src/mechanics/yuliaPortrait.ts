import type { Worker } from '../store/game'

const path = '/art/portraits/'

export function yuliaPortrait(
  day: number,
  firstArrivalDay: number | undefined,
  clothing: Worker['clothing'] | undefined,
  operations: Worker['operations'] | undefined,
): string {
  if (clothing === 'unclothed') return `${path}yulia.jpg`
  if (firstArrivalDay === undefined) return `${path}yulia-initial.jpg`

  const qualifyingDays = (operations ?? [])
    .filter(operation => ['breast_enlargement', 'lactation_hormones'].includes(operation.id) && (!operation.outcome || operation.outcome === 'success'))
    .map(operation => operation.day)
  if (qualifyingDays.length > 0) {
    const firstModificationDay = Math.min(...qualifyingDays)
    return `${path}${day - firstModificationDay >= 30 ? 'yulia-modified-month.png' : 'yulia-modified.png'}`
  }
  if (day - firstArrivalDay >= 30) return `${path}yulia-month.png`
  if (day - firstArrivalDay >= 7) return `${path}yulia-week.jpg`
  return `${path}yulia-initial.jpg`
}
