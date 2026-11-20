import rows from './candidateLetters.json'
import type { Localized } from '../types'

export interface CandidateLetter { id: string; requestedWage: number; minimumWage: number; guilt: number; defiance: number; letter: Localized }
export const candidateLetters = rows as CandidateLetter[]
export const letterFor = (id: string) => candidateLetters.find(row => row.id === id)
