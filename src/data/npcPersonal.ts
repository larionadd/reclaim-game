import raw from './npcPersonal.json'
import type { Localized } from '../types'

export interface RelativePerson { name: Localized; age: number; candidateId?: string }
export interface RelativeRecord { state: 'none' | 'unknown' | 'known'; people: RelativePerson[] }
export interface NpcPersonal {
  id: string
  orientation: 'heterosexual' | 'bisexual' | 'gay' | 'lesbian' | 'asexual' | 'questioning'
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed'
  modificationConsentAtSigning: boolean
  relatives: { mother: RelativeRecord; father: RelativeRecord; children: RelativeRecord }
}

export const npcPersonal = raw as NpcPersonal[]
export const personalFor = (id: string) => npcPersonal.find(person => person.id === id)
