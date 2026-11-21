import type { Worker } from '../store/game'

export const interactionGroups = {
  reward: ['bonus', 'dayOff', 'extraFood'],
  punish: ['fine', 'hit', 'dismiss', 'standOrder', 'forceDance', 'forceApology'],
  talk: ['joke', 'adultJoke', 'flirt', 'romanceTalk', 'walk', 'hug', 'kiss', 'sex']
} as const

export type InteractionAction = typeof interactionGroups[keyof typeof interactionGroups][number]

export const actionMarkers: Record<InteractionAction, string> = {
  bonus: '😇', dayOff: '😇', extraFood: '😇', fine: '😈', hit: '😈', dismiss: '😈',
  standOrder: '😈', forceDance: '😈', forceApology: '😈',
  joke: '😇😈', adultJoke: '😇😈', flirt: '😇😈', romanceTalk: '😇', walk: '😇', hug: '😇', kiss: '😇', sex: '😇'
}
export const eventMarker = (action: string) => ['moveToHut', 'askConsent', 'gentleIntimacy', 'passionateIntimacy', 'privateNight', 'officeAskConsent', 'officeTender', 'officePassionate', 'officeQuiet'].includes(action) ? '😇' : ['moveToCage', 'reprimand', 'extraDuty', 'sexPressure'].includes(action) ? '😈' : actionMarkers[action as InteractionAction] ?? ''

export function interactionRequirement(w: Worker, action: InteractionAction, money: number, bread: number): string | null {
  switch (action) {
    case 'bonus': return w.contract !== 'paid' ? 'needsPaidContract' : money < 5 ? 'needsFiveHryvnias' : null
    case 'dayOff': return null
    case 'extraFood': return w.contract !== 'foodOnly' ? 'needsFoodContract' : bread < 1 ? 'needsBread' : null
    case 'fine': return w.contract !== 'paid' ? 'needsPaidContract' : w.savings < 1 ? 'needsSavings' : null
    case 'hit': case 'dismiss': case 'joke': return null
    case 'standOrder': return w.fear < 20 ? 'needsFear20' : null
    case 'forceDance': return w.fear < 35 ? 'needsFear35' : w.submission < 15 ? 'needsSubmission15' : null
    case 'forceApology': return w.fear < 50 ? 'needsFear50' : w.submission < 30 ? 'needsSubmission30' : null
    case 'adultJoke': return w.friendship < 20 ? 'needsFriendship20' : w.debauchery < 25 ? 'needsDebauchery25' : w.fear >= 35 ? 'needsFearBelow35' : null
    case 'flirt': return w.friendship < 35 ? 'needsFriendship35' : w.debauchery < 35 ? 'needsDebauchery35' : w.fear >= 25 ? 'needsFearBelow25' : null
    case 'romanceTalk': return w.friendship < 45 ? 'needsFriendship45' : w.love < 15 ? 'needsLove15' : w.fear >= 25 ? 'needsFearBelow25' : null
    case 'walk': return w.friendship < 35 && w.respect < 50 ? 'needsWalk' : null
    case 'hug': return w.friendship < 55 ? 'needsFriendship55' : w.fear >= 35 ? 'needsFearBelow35' : null
    case 'kiss': return w.friendship < 70 ? 'needsFriendship70' : w.love < 55 ? 'needsLove55' : w.fear >= 20 ? 'needsFearBelow20' : null
    case 'sex': return w.love > 80 || w.fear > 80 ? null : 'needsLoveOrFear81'
  }
}

export const thresholdHints: Partial<Record<InteractionAction, string>> = {
  standOrder: 'hintStandOrder', forceDance: 'hintForceDance', forceApology: 'hintForceApology', adultJoke: 'hintAdultJoke', flirt: 'hintFlirt', romanceTalk: 'hintRomanceTalk', walk: 'hintWalk', hug: 'hintHug', kiss: 'hintKiss', sex: 'hintSex'
}
