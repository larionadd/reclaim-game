import type { Candidate, Lang } from '../types'
export const displayName = (candidate: Candidate, lang: Lang, nickname?: string) => nickname?.trim() || candidate.name[lang]
