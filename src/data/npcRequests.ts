export interface NpcRequest {
  id: string
  minLove?: number
  adult?: boolean
  cost?: number
  dayOff?: boolean
  accept: { trust?: number; friendship?: number; love?: number; respect?: number }
  decline: { trust?: number; friendship?: number; love?: number; respect?: number }
}

export const npcRequests: NpcRequest[] = [
  { id: 'loan', cost: 5, accept: { trust: 4 }, decline: {} },
  { id: 'dayOff', dayOff: true, accept: { friendship: 3, respect: 2 }, decline: { respect: -2 } },
  { id: 'foundItem', accept: { friendship: 2 }, decline: {} },
  { id: 'repairFence', accept: { respect: 3, friendship: 2 }, decline: { respect: -1 } },
  { id: 'breakfast', accept: { friendship: 4 }, decline: {} },
  { id: 'familyLetter', accept: { trust: 4 }, decline: {} },
  { id: 'changeShift', dayOff: true, accept: { respect: 3 }, decline: { respect: 1 } },
  { id: 'sharedThings', accept: { trust: 2 }, decline: { trust: -2 } },
  { id: 'workMistake', accept: { trust: 4 }, decline: { trust: -3 } },
  { id: 'borrowTool', accept: { trust: 2, friendship: 2 }, decline: {} },
  { id: 'walkTogether', accept: { friendship: 3, love: 1 }, decline: {} },
  { id: 'marketGift', accept: { friendship: 3 }, decline: {} },
  { id: 'quietEvening', accept: { friendship: 3, love: 2 }, decline: {} },
  { id: 'futurePlans', accept: { trust: 4 }, decline: {} },
  { id: 'firstName', accept: { friendship: 2 }, decline: { respect: 1 } },
  { id: 'kissRequest', minLove: 31, adult: true, accept: { love: 3 }, decline: { trust: 1 } },
  { id: 'sharedGarden', minLove: 81, accept: { love: 3, trust: 2 }, decline: { trust: 1 } },
  { id: 'oralRequest', minLove: 81, adult: true, accept: { love: 2, trust: 2 }, decline: {} },
  { id: 'analRequest', minLove: 81, adult: true, accept: { trust: 3 }, decline: {} },
  { id: 'boundariesTalk', adult: true, accept: { trust: 4, love: 1 }, decline: { trust: 1 } },
]
