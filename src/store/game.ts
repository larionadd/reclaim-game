import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BodyMeasurements, Job, Lang, Phase } from '../types'
import { applyProcedureMeasurements, updateBodyForDay } from '../mechanics/workerBody'
import { resolveDay } from '../mechanics/economy'
import { canHire } from '../mechanics/hiring'
import { phaseMessage } from '../mechanics/events'
import { candidates } from '../data/candidates'
import { npcRequests } from '../data/npcRequests'
import { letterFor } from '../data/candidateLetters'
import { farmGoods, humanFoods, foodCalories, atbibPrices, droneParts, officeGoods, bedroomGoods, adultToys, droneSalePrice, salePrices, sellableGoods, type AdultToy, type AtbibGood, type DronePart, type OfficeGood, type BedroomGood, type FarmGood, type FoodStocks, type HumanFood, type SaleGood } from '../data/goods'
import { conditionEffects, riskForWorker } from '../mechanics/farmProduction'
import { interactionRequirement, type InteractionAction } from '../mechanics/interactions'
import { canCallBedroom, canChooseIntimacy, canChooseOfficeIntimacy, canPunishInBedroom, type BedroomAction } from '../mechanics/bedroom'
import { personalFor } from '../data/npcPersonal'
import procedures from '../data/medical/procedures.json'
import { canReceiveProcedure, resolveOperationOutcome } from '../mechanics/medicalOperations'
import { resolveDisobedience, type Disobedience } from '../mechanics/disobedience'
import { prostheticBonuses, prostheticFor, type LimbSlot } from '../data/prosthetics'
import { canWorkAtFarm, hasUnfittedLimb } from '../mechanics/mobility'
import { canVisitWorkplace, type WorkplaceAction } from '../mechanics/workplace'

export type Housing = 'cage' | 'barrack' | 'hut'
const housingCapacity = (s: Pick<GameState, 'cages' | 'barracks' | 'huts'>, housing: Housing) => housing === 'cage' ? s.cages : housing === 'barrack' ? s.barracks * 4 : s.huts * 2
export type RoutineActivity = 'work' | 'rest' | 'sleep'
export type WorkerRoutine = Record<Phase, RoutineActivity>
export const defaultRoutine: WorkerRoutine = { morning: 'rest', day: 'work', evening: 'rest', night: 'sleep' }
export const calorieNeed = (worker: Worker) => Math.round((1500 + worker.body.weightKg * 10 + (worker.body.heightCm - 160) * 3) / 50) * 50
export const plannedCalories = (worker: Worker) => humanFoods.reduce((sum, food) => sum + (worker.diet[food] ?? 0) * foodCalories[food], 0)
export const currentActivity = (worker: Worker, phase: Phase, job: Job | undefined, day: number, inDogCrate = false): RoutineActivity => !inDogCrate && !worker.punishedInCage && !worker.punishedKneeling && worker.alive && worker.active && canWorkAtFarm(worker, day) && job && job !== 'rest' ? (worker.routine?.[phase] ?? defaultRoutine[phase]) : phase === 'night' ? 'sleep' : 'rest'
export const currentStatus = (worker: Worker, phase: Phase, job: Job | undefined, day: number, inDogCrate = false): string => inDogCrate ? 'statusInDogCrate' : worker.punishedInCage ? 'statusInCage' : worker.punishedKneeling ? 'statusKneeling' : phase === 'morning' && job && job !== 'rest' && currentActivity(worker, phase, job, day) === 'rest' && canWorkAtFarm(worker, day) ? 'activity_prepare' : `activity_${currentActivity(worker, phase, job, day)}`
export const currentLocation = (worker: Worker, phase: Phase, job: Job | undefined, day: number, vet = false, inDogCrate = false): string => inDogCrate ? 'dogCrate' : worker.punishedInCage ? 'cage' : currentActivity(worker, phase, job, day) === 'work' ? (vet ? 'vet' : job ?? 'rest') : worker.housing
export type Contract = 'paid' | 'foodOnly'
export type ContractTerm = 30 | 90 | 'lifetime'
export type ShopItem = AtbibGood
export const shopPrices = atbibPrices
export const vetDailyIncome = 25
export const bimboLocked = (worker: Worker) => worker.bimbofication >= 10
export type StoreGood = SaleGood | 'drone'
export interface StoreListing { good: StoreGood; quantity: number; price: number }
export type TrainingKind = 'run' | 'bag' | 'spar'
export interface SaleListing { good: SaleGood; quantity: number; price: number; listedDay: number; contributors: Record<string, number> }
export interface WorkerDayReport { id: string; healthBefore: number; healthAfter: number; debaucheryBefore: number; debaucheryAfter: number; paid: number; eaten: number; calories?: number; calorieNeed?: number; reasons: string[]; statuses: string[] }
export interface DayReport { day: number; sales: number; vetIncome?: number; produced: number; producedGoods: Record<SaleGood, number>; dronesProduced: number; feedBefore: number; feedAfter: number; feedByTypeBefore?: FeedStock; feedByTypeAfter?: FeedStock; moneyBefore: number; moneyAfter: number; foodAfter: { bread: number; lard: number }; workers: WorkerDayReport[] }
export interface GameEvent { id: number; day: number; phase: Phase; workerId: string; action: string; storyKey: string; changes: Record<string, number>; detail?: string }
export interface PendingNpcRequest { workerId: string; requestId: string }
export type Provenance = Record<SaleGood, Record<string, number>>
export interface Worker {
  nickname: string
  hiredOnDay: number
  contractTerm: ContractTerm
  contractEndsDay: number | null
  lastDayOnSite?: number
  active: boolean
  arrivalDay?: number
  totalEarnedForPlayer: number
  totalReceivedFromPlayer: number
  body: BodyMeasurements
  diet: Record<HumanFood, number>
  routine: WorkerRoutine
  contract: Contract
  ration: number
  wage: number
  agreedWage: number
  wageDebt: number
  requestedWage: number
  absenceCount: number
  housing: Housing
  punishedInCage?: boolean
  punishedKneeling?: boolean
  guaranteedShiftsLeft?: number
  savings: number
  modificationConsentAtSigning: boolean
  modificationDecision?: { procedureId: string; accepted: boolean; day: number }
  health: number
  alive: boolean
  injuredUntilDay?: number
  trust: number
  bimbofication: number
  love: number; debauchery: number; submission: number
  intimacyConsentDay?: number
  sexCounts: { conventional: number; oral: number; anal: number }
  clothing: 'clothed' | 'unclothed'
  analItem: 'analPlug' | 'analVibrator' | null
  handcuffed: boolean
  intimacyInjury: { oral: number; anal: number; vaginal: number }
  traits: string[]
  operations: { id: string; day: number; outcome?: 'success' | 'complication' | 'disability' | 'death' }[]
  disabled?: boolean
  medicalEffects?: { lactation: boolean; oviposition: boolean; hair: 'normal' | 'growth' | 'loss' }
  prostheticInventory: string[]
  equippedProsthetics: Partial<Record<LimbSlot, string>>
  workplaceInspectedDay?: number
  workplaceResponseDay?: number
  actionCounts?: Record<string, number>
  workDays: { production: number; maintenance: number }
  training: { speed: number; strength: number; combat: number }
}
type Livestock = { cattle: number; pigs: number; chickens: number }
type FeedStock = { chickens: number; pigs: number; cattle: number }
interface GameState {
  lang: Lang; prologueSeen: boolean; playerName: string; day: number; phase: Phase; output: number; wellbeing: number; reputation: number
  money: number; food: number; feedDays: number; feedStock: FeedStock; livestock: Livestock; staffCapacity: number; cages: number; barracks: number; huts: number; vodka: number; enterprises: string[]; enterpriseNames: Record<string,string>
  prostheticStock: Record<string, number>
  officeStock: Record<OfficeGood, number>; officePlaced: Record<OfficeGood, number>; bedroomPlaced: Record<BedroomGood, number>; officeCagedNpcId: string | null
  partStock: Record<DronePart, number>; drones: number; storeListings: StoreListing[]; trainingPlans: Record<string, TrainingKind>
  stocks: FoodStocks; provenance: Provenance; listings: SaleListing[]; totalSales: number; vetBuilt: boolean; vetDoctorId: string | null
  lastReport: DayReport | null; reportPending: boolean
  journal: GameEvent[]; activeEvent: GameEvent | null
  pendingRequest: PendingNpcRequest | null
  pendingContractNotices: string[]; arrivalNotices: string[]
  hired: string[]; workers: Record<string, Worker>; assignments: Record<string, Job>; message: string
  actionPhaseUsed: Phase | null; actionDay: number; actionCounts: Record<string, number>
  canUseAction: (action: string) => boolean; setRoutine: (id: string, phase: Phase, activity: RoutineActivity) => void
  toggleLang: () => void; setLang: (lang: Lang) => void; finishPrologue: () => void; hire: (id: string, contract?: Contract, term?: ContractTerm, offeredWage?: number, modifications?: boolean) => void; assign: (id: string, job: Job) => void
  setPlayerName: (name: string) => void
  setNickname: (id: string, nickname: string) => void
  setRation: (id: string, amount: number) => void; setWage: (id: string, amount: number) => void
  setFoodPlan: (id: string, food: HumanFood, amount: number) => void
  setContract: (id: string, contract: Contract) => void; setContractTerm: (id: string, term: ContractTerm) => void; renewContract: (id: string, term: ContractTerm) => void; terminateContract: (id: string) => void
  interact: (id: string, action: InteractionAction) => void; dismissEvent: () => void
  resolveRequest: (accept: boolean) => void
  dismissReport: () => void
  dismissContractNotice: () => void; dismissArrivalNotice: () => void
  bedroomAction: (id: string, action: BedroomAction) => void
  officeIntimacy: (id: string, action: 'vaginalSex' | 'oralSex' | 'analSex' | 'foreheadStrike') => void
  useAdultToy: (id: string, item: AdultToy, room: 'bedroom' | 'office') => void
  setNpcClothing: (id: string, clothing: Worker['clothing'], room: 'bedroom' | 'office') => void
  setNpcAnalItem: (id: string, item: Worker['analItem'], room: 'bedroom' | 'office') => void
  setNpcHandcuffed: (id: string, value: boolean, room: 'bedroom' | 'office') => void
  workplaceAction: (id: string, action: WorkplaceAction) => void
  setHousing: (id: string, housing: Housing) => void; reward: (id: string, amount: number) => void
  fine: (id: string, amount: number, reason: string) => void
  proposeModification: (id: string, procedureId: string) => void; performOperation: (id: string, procedureId: string) => void
  buyProsthetic: (itemId: string) => void; issueProsthetic: (workerId: string, itemId: string) => void; equipProsthetic: (workerId: string, itemId: string) => void; fitProstheticFromStock: (workerId: string, itemId: string) => void; removeProsthetic: (workerId: string, slot: LimbSlot) => void
  expandHousing: () => void; buildCage: () => void; buildBarrack: () => void; buildHut: () => void; createEnterprise: (id: string, name: string) => void
  setTraining: (id: string, kind: TrainingKind) => void; listInStore: (good: StoreGood, quantity: number, price: number) => void; removeStoreListing: (index: number) => void
  sellDrones: (quantity: number) => void
  purchase: (items: Partial<Record<ShopItem, number>>) => void; sleep: () => void; advance: () => void; reset: () => void
  placeOfficeItem: (item: OfficeGood, room?: 'office' | 'bedroom') => void; removeOfficeItem: (item: OfficeGood, room?: 'office' | 'bedroom') => void; officeCageAction: (id: string, action: 'cage' | 'release') => void
  listForSale: (good: SaleGood, quantity: number) => void; buildVet: () => void; appointVet: (id: string) => void
}
const order: Phase[] = ['morning', 'day', 'evening', 'night']
const startingCapital = 500
const initial = {
  lang: 'uk' as Lang, prologueSeen: false, playerName: 'Альфа', day: 1, phase: 'morning' as Phase, output: 0, wellbeing: 76, reputation: 58,
  money: startingCapital, food: 18, feedDays: 0, feedStock: { chickens: 0, pigs: 0, cattle: 0 }, livestock: { cattle: 0, pigs: 0, chickens: 0 }, staffCapacity: 1, cages: 1, barracks: 0, huts: 0, vodka: 0, enterprises: ['farm'], enterpriseNames: { farm: 'Ферма' },
  prostheticStock: {} as Record<string, number>,
  officeStock: Object.fromEntries(officeGoods.map(id => [id, 0])) as Record<OfficeGood, number>, officePlaced: Object.fromEntries(officeGoods.map(id => [id, 0])) as Record<OfficeGood, number>,
  bedroomPlaced: Object.fromEntries(bedroomGoods.map(id => [id, 0])) as Record<BedroomGood, number>, officeCagedNpcId: null as string | null,
  partStock: Object.fromEntries(droneParts.map(part => [part, 0])) as Record<DronePart, number>, drones: 0, storeListings: [] as StoreListing[], trainingPlans: {} as Record<string, TrainingKind>,
  stocks: { bread: 18, lard: 0, meat: 0, milk: 0, cheese: 0, eggs: 0, girlEggs: 0, girlMilk: 0 }, provenance: { meat: {}, milk: {}, cheese: {}, eggs: {}, girlEggs: {}, girlMilk: {} } as Provenance, listings: [] as SaleListing[], totalSales: 0, vetBuilt: false, vetDoctorId: null as string | null, lastReport: null as DayReport | null, reportPending: false, journal: [] as GameEvent[], activeEvent: null as GameEvent | null, pendingRequest: null as PendingNpcRequest | null,
  hired: [] as string[], workers: {} as Record<string, Worker>, assignments: {} as Record<string, Job>, pendingContractNotices: [] as string[], arrivalNotices: [] as string[], message: 'msgStart', actionPhaseUsed: null as Phase | null, actionDay: 1, actionCounts: {} as Record<string, number>
}
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
const chooseNpcRequest = (s: GameState): PendingNpcRequest | null => {
  if (s.pendingRequest || Math.random() >= .3) return null
  const eligible = s.hired.flatMap(workerId => {
    const worker = s.workers[workerId], age = candidates.find(c => c.id === workerId)?.age ?? 0
    if (!worker?.alive || !worker.active || worker.housing === 'cage' || worker.punishedInCage || worker.punishedKneeling || s.officeCagedNpcId === workerId) return []
    return npcRequests.filter(request => (request.minLove === undefined || worker.love >= request.minLove) && (!request.adult || age >= 18) && (!request.cost || s.money >= request.cost)).map(request => ({ workerId, requestId: request.id }))
  })
  return eligible.length ? eligible[Math.floor(Math.random() * eligible.length)] : null
}
const eventUpdate = (s: GameState, id: string, action: string, before: Worker, after: Worker, money = s.money, reputation = s.reputation, detail?: string) => {
  const changes: Record<string, number> = {}
  for (const key of ['health', 'trust', 'love', 'debauchery', 'submission', 'savings'] as const) if (after[key] !== before[key]) changes[key] = after[key] - before[key]
  if (money !== s.money) changes.money = money - s.money
  if (reputation !== s.reputation) changes.reputation = reputation - s.reputation
  const event: GameEvent = { id: (s.journal.at(-1)?.id ?? 0) + 1, day: s.day, phase: s.phase, workerId: id, action, storyKey: `story_${action}`, changes, detail }
  return { journal: [...s.journal, event], activeEvent: event }
}
const defaultWorker = (id: string, contract: Contract = 'paid', day = 1, term: ContractTerm = 30): Worker => ({ nickname: '', hiredOnDay: day, contractTerm: term, contractEndsDay: term === 'lifetime' ? null : day + term - 1, active: true, totalEarnedForPlayer: 0, totalReceivedFromPlayer: 0, body: { ...(candidates.find(c => c.id === id)?.body ?? { heightCm: 170, weightKg: 65, chestCm: 90, waistCm: 75, hipsCm: 95 }) }, diet: { bread: contract === 'paid' ? 0 : 9, lard: 0, meat: 0, milk: 0, cheese: 0, eggs: 0 }, routine: { ...defaultRoutine }, contract, ration: contract === 'paid' ? 0 : 9, wage: contract === 'paid' ? 12 : 0, agreedWage: contract === 'paid' ? 12 : 0, wageDebt: 0, requestedWage: letterFor(id)?.requestedWage ?? 12, absenceCount: 0, housing: 'cage', savings: 0, modificationConsentAtSigning: personalFor(id)?.modificationConsentAtSigning ?? false, health: 76, alive: true, trust: 25, bimbofication: 0, love: 0, debauchery: 20, submission: 5, sexCounts: { conventional: 0, oral: 0, anal: 0 }, clothing: 'clothed', analItem: null, handcuffed: false, intimacyInjury: { oral: 0, anal: 0, vaginal: 0 }, traits: candidates.find(c => c.id === id)?.traits ?? [], operations: [], prostheticInventory: [], equippedProsthetics: {}, workDays: { production: 0, maintenance: 0 }, training: { speed: 0, strength: 0, combat: 0 } })
const occupied = (workers: Record<string, Worker>, housing: Housing, except?: string) => Object.entries(workers).filter(([id, w]) => id !== except && w.alive && (w.active || w.arrivalDay !== undefined) && w.housing === housing).length
const takeProvenance = (source: Record<string, number>, amount: number) => {
  const remaining = { ...source }, contributors: Record<string, number> = {}
  let count = amount
  for (const id of Object.keys(remaining)) { const taken = Math.min(count, remaining[id]); remaining[id] -= taken; if (taken) contributors[id] = taken; count -= taken; if (!count) break }
  return { remaining, contributors }
}

export const useGame = create<GameState>()(persist((set, get) => ({ ...initial,
  toggleLang: () => set(s => ({ lang: s.lang === 'uk' ? 'ru' : s.lang === 'ru' ? 'en' : 'uk' })),
  setLang: lang => set({ lang }),
  setPlayerName: name => set({ playerName: name.trim().slice(0, 32) || 'Альфа' }),
  finishPrologue: () => set({ prologueSeen: true }),
  canUseAction: action => { const s = get(); return (s.actionDay !== s.day || s.actionPhaseUsed !== s.phase) && (s.actionDay !== s.day || (s.actionCounts[action] ?? 0) < 3) },
  setRoutine: (id, phase, activity) => set(s => { const w = s.workers[id]; return w?.alive && w.active ? { workers: { ...s.workers, [id]: { ...w, routine: { ...defaultRoutine, ...w.routine, [phase]: activity } } } } : {} }),
  hire: (id, contract = 'paid', term = 30, offeredWage, modifications = false) => set(s => {
    const livingIds = s.hired.filter(workerId => s.workers[workerId]?.alive && (s.workers[workerId]?.active || s.workers[workerId]?.arrivalDay !== undefined))
    if (s.hired.includes(id) || !canHire(livingIds, id, s.staffCapacity) || !candidates.some(c => c.id === id && c.availableFromDay <= s.day)) return {}
    const letter = letterFor(id), offer = contract === 'paid' ? clamp(Math.floor(offeredWage ?? letter?.requestedWage ?? 12), 0, 30) : 0
    if (contract === 'paid' && offer < (letter?.minimumWage ?? 8)) return { message: 'msgOfferRejected' }
    const housing: Housing = (['hut', 'barrack', 'cage'] as Housing[]).find(kind => occupied(s.workers, kind) < housingCapacity(s, kind)) ?? 'cage'
    if (occupied(s.workers, housing) >= housingCapacity(s, housing)) return {}
    return { hired: [...s.hired, id], workers: { ...s.workers, [id]: { ...defaultWorker(id, contract, s.day + 1, term), active: false, arrivalDay: s.day + 1, modificationConsentAtSigning: modifications, wage: offer, agreedWage: offer, housing } }, assignments: { ...s.assignments, [id]: 'rest' }, pendingContractNotices: [...s.pendingContractNotices, id], message: 'msgHired' }
  }),
  dismissContractNotice: () => set(s => ({ pendingContractNotices: s.pendingContractNotices.slice(1) })),
  dismissReport: () => set({ reportPending: false }),
  dismissArrivalNotice: () => set(s => ({ arrivalNotices: s.arrivalNotices.slice(1) })),
  setNickname: (id, nickname) => set(s => {
    if (!s.workers[id]) return {}
    const value = nickname.slice(0, 24)
    if (value.trim() && Object.entries(s.workers).some(([otherId, worker]) => otherId !== id && worker.nickname.trim().toLocaleLowerCase() === value.trim().toLocaleLowerCase())) return {}
    return { workers: { ...s.workers, [id]: { ...s.workers[id], nickname: value } } }
  }),
  assign: (id, job) => set(s => {
    const w = s.workers[id]
    if (s.phase !== 'morning' || !w?.alive || !w.active || w.punishedInCage || w.punishedKneeling || s.officeCagedNpcId === id || (w.injuredUntilDay ?? 0) > s.day || s.vetDoctorId === id || (job !== 'rest' && hasUnfittedLimb(w))) return {}
    if (!(['production', 'rest', 'layEggs', 'milking', 'droneAssembly', 'storeSales', 'training'] as Job[]).includes(job)) return {}
    if (job === 'layEggs' && !w.medicalEffects?.oviposition) return {}
    if (job === 'milking' && !w.medicalEffects?.lactation) return {}
    if (job === 'droneAssembly' && !s.enterprises.includes('droneAssembly')) return {}
    if (job === 'storeSales' && !s.enterprises.includes('store')) return {}
    if (job === 'training' && !s.enterprises.includes('trainingCamp')) return {}
    return { assignments: { ...s.assignments, [id]: job } }
  }),
  setRation: (id, amount) => set(s => s.workers[id]?.alive && s.workers[id]?.active ? { workers: { ...s.workers, [id]: { ...s.workers[id], ration: clamp(Math.round(amount), 0, 99), diet: { ...s.workers[id].diet, bread: clamp(Math.round(amount), 0, 99), lard: 0, meat: 0, milk: 0, cheese: 0, eggs: 0 } } } } : {}),
  setFoodPlan: (id, food, amount) => set(s => {
    const worker = s.workers[id]; if (!worker?.alive || !worker.active || !humanFoods.includes(food)) return {}
    const diet = { ...worker.diet, [food]: clamp(Math.round(amount), 0, 99) }
    const total = humanFoods.reduce((sum, key) => sum + diet[key], 0)
    return { workers: { ...s.workers, [id]: { ...worker, diet, ration: total } } }
  }),
  setContract: (id, contract) => set(s => {
    const w = s.workers[id]; if (!w?.alive || !w.active || w.contract === contract) return {}
    const wage = contract === 'paid' ? Math.max(w.requestedWage, 8) : 0
    return { workers: { ...s.workers, [id]: { ...w, contract, wage, agreedWage: wage } } }
  }),
  setContractTerm: (id, term) => set(s => {
    const w = s.workers[id]
    if (!w?.alive || !w.active || !([30, 90, 'lifetime'] as ContractTerm[]).includes(term)) return {}
    return { workers: { ...s.workers, [id]: { ...w, contractTerm: term, contractEndsDay: term === 'lifetime' ? null : s.day + term - 1 } } }
  }),
  renewContract: (id, term) => set(s => {
    const w = s.workers[id]
    if (!w?.alive || !([30, 90, 'lifetime'] as ContractTerm[]).includes(term)) return {}
    if (w.arrivalDay !== undefined) return {}
    if (w.active && w.contractEndsDay === null) return {}
    const freeHousing = (housing: Housing) => occupied(s.workers, housing, id) < housingCapacity(s, housing)
    if (!w.active && (s.hired.filter(otherId => s.workers[otherId]?.alive && (s.workers[otherId]?.active || s.workers[otherId]?.arrivalDay !== undefined)).length >= s.staffCapacity || !(['hut', 'barrack', 'cage'] as Housing[]).some(freeHousing))) return {}
    const base = w.active ? Math.max(s.day, w.contractEndsDay ?? s.day) : s.day - 1
    const housing = w.active || freeHousing(w.housing) ? w.housing : (['hut', 'barrack', 'cage'] as Housing[]).find(freeHousing) ?? 'cage'
    return { workers: { ...s.workers, [id]: { ...w, active: true, housing, hiredOnDay: w.active ? w.hiredOnDay : s.day, contractTerm: term, contractEndsDay: term === 'lifetime' ? null : base + term, lastDayOnSite: undefined } }, assignments: w.active ? s.assignments : { ...s.assignments, [id]: 'rest' as Job }, message: 'msgContractRenewed' }
  }),
  terminateContract: id => set(s => {
    const w = s.workers[id]
    if (!w?.alive || !w.active) return {}
    return { workers: { ...s.workers, [id]: { ...w, active: false, contractEndsDay: s.day, lastDayOnSite: s.day } }, assignments: { ...s.assignments, [id]: 'rest' as Job }, vetDoctorId: s.vetDoctorId === id ? null : s.vetDoctorId, message: 'msgContractTerminated' }
  }),
  interact: (id, action) => set(s => {
    const w = s.workers[id]; if (!w?.alive || hasUnfittedLimb(w) || (!w.active && !['joke','adultJoke','flirt','romanceTalk','walk','hug','kiss'].includes(action))) return {}
    if (interactionRequirement(w, action, s.money, s.stocks.bread) || !get().canUseAction(action) || (action === 'punishCage' && w.housing !== 'cage' && occupied(s.workers, 'cage', id) >= s.cages)) return {}
    const next = { ...w }, changes: Partial<GameState> = {}
    if (['fine', 'hit', 'standOrder', 'forceDance', 'forceApology', 'punishCage', 'punishKneel'].includes(action)) next.guaranteedShiftsLeft = Math.max(3, w.guaranteedShiftsLeft ?? 0)
    const add = (key: 'health' | 'trust' | 'love' | 'debauchery' | 'submission', n: number) => { next[key] = clamp(next[key] + n, 0, 100) }
    switch (action) {
      case 'bonus': next.savings += 5; next.totalReceivedFromPlayer += 5; add('trust', 2); changes.money = s.money - 5; break
      case 'dayOff': add('trust', 3); changes.assignments = { ...s.assignments, [id]: 'rest' }; break
      case 'extraFood': add('health', 2); add('trust', 2); changes.stocks = { ...s.stocks, bread: s.stocks.bread - 1 }; break
      case 'fine': next.savings--; add('trust', -5); add('submission', 2); changes.reputation = clamp(s.reputation - 2, 0, 100); break
      case 'hit': add('health', -15); add('trust', -20); add('submission', 5); add('love', -30); changes.reputation = clamp(s.reputation - 25, 0, 100); break
      case 'dismiss': next.active = false; next.lastDayOnSite = s.day; changes.assignments = { ...s.assignments, [id]: 'rest' }; break
      case 'standOrder': add('submission', 5); break
      case 'forceDance': add('submission', 7); add('trust', -4); changes.reputation = clamp(s.reputation - 3, 0, 100); break
      case 'forceApology': add('submission', 5); add('trust', -6); break
      case 'punishCage': next.housing = 'cage'; next.punishedInCage = true; next.punishedKneeling = false; next.guaranteedShiftsLeft = Math.max(3, w.guaranteedShiftsLeft ?? 0); add('submission', 5); add('trust', -8); changes.assignments = { ...s.assignments, [id]: 'rest' }; break
      case 'punishKneel': next.punishedKneeling = true; next.guaranteedShiftsLeft = Math.max(3, w.guaranteedShiftsLeft ?? 0); add('submission', 5); add('trust', -8); changes.assignments = { ...s.assignments, [id]: 'rest' }; break
      case 'endKneeling': next.punishedKneeling = false; break
      case 'joke': add('trust', 2); add('debauchery', 1); break
      case 'adultJoke': add('trust', 3); add('debauchery', 3); break
      case 'flirt': add('love', 3); add('debauchery', 2); break
      case 'romanceTalk': add('trust', 2); add('love', 4); break
      case 'walk': add('trust', 4); add('love', 1); break
      case 'hug': add('trust', 3); add('love', 2); break
      case 'kiss': add('love', 3); break
    }
    changes.workers = { ...s.workers, [id]: next }
    return { ...changes, actionPhaseUsed: s.phase, actionDay: s.day, actionCounts: { ...(s.actionDay === s.day ? s.actionCounts : {}), [action]: (s.actionDay === s.day ? s.actionCounts[action] ?? 0 : 0) + 1 }, ...eventUpdate(s, id, action, w, next, changes.money, changes.reputation) }
  }),
  bedroomAction: (id, action) => set(s => {
    const w = s.workers[id], age = candidates.find(c => c.id === id)?.age ?? 0
    if (!w || !canCallBedroom(w) || !get().canUseAction(action)) return {}
    const intimate = action === 'oralSex' || action === 'analSex'
    if (intimate && !canChooseIntimacy(w, age)) return {}
    if ((action === 'reprimand' || action === 'extraDuty') && !canPunishInBedroom(w)) return {}
    const next = { ...w }, changes: Partial<GameState> = {}
    if (action === 'reprimand' || action === 'extraDuty') next.guaranteedShiftsLeft = Math.max(3, w.guaranteedShiftsLeft ?? 0)
    const add = (key: 'trust' | 'love' | 'submission', n: number) => { next[key] = clamp(next[key] + n, 0, 100) }
    switch (action) {
      case 'oralSex': case 'analSex': add('love', 2); add('trust', 1); next.sexCounts = { ...w.sexCounts, [action === 'oralSex' ? 'oral' : 'anal']: (w.sexCounts?.[action === 'oralSex' ? 'oral' : 'anal'] ?? 0) + 1 }; next.intimacyInjury = { ...w.intimacyInjury, [action === 'oralSex' ? 'oral' : 'anal']: clamp((w.intimacyInjury?.[action === 'oralSex' ? 'oral' : 'anal'] ?? 0) + 10, 0, 100) }; break
      case 'reprimand': add('submission', 2); add('trust', -4); changes.reputation = clamp(s.reputation - 1, 0, 100); break
      case 'extraDuty': add('submission', 3); add('trust', -5); changes.assignments = { ...s.assignments, [id]: 'production' }; changes.reputation = clamp(s.reputation - 2, 0, 100); break
    }
    changes.workers = { ...s.workers, [id]: next }
    return { ...changes, actionPhaseUsed: s.phase, actionDay: s.day, actionCounts: { ...(s.actionDay === s.day ? s.actionCounts : {}), [action]: (s.actionDay === s.day ? s.actionCounts[action] ?? 0 : 0) + 1 }, ...eventUpdate(s, id, action, w, next, changes.money, changes.reputation) }
  }),
  officeIntimacy: (id, action) => set(s => {
    const w = s.workers[id], age = candidates.find(c => c.id === id)?.age ?? 0
    if (!w?.alive || s.officeCagedNpcId === id || hasUnfittedLimb(w) || (action !== 'foreheadStrike' && !canChooseOfficeIntimacy(w, age)) || !get().canUseAction(action)) return {}
    if (action === 'foreheadStrike') {
      const next = { ...w, trust: clamp(w.trust - 2, 0, 100) }
      return { workers: { ...s.workers, [id]: next }, actionPhaseUsed: s.phase, actionDay: s.day, actionCounts: { ...(s.actionDay === s.day ? s.actionCounts : {}), [action]: (s.actionDay === s.day ? s.actionCounts[action] ?? 0 : 0) + 1 }, ...eventUpdate(s, id, action, w, next) }
    }
    const kind = action === 'vaginalSex' ? 'conventional' : action === 'oralSex' ? 'oral' : 'anal'
    const injuryKind: keyof Worker['intimacyInjury'] = action === 'vaginalSex' ? 'vaginal' : action === 'oralSex' ? 'oral' : 'anal'
    const next = { ...w, love: clamp(w.love + 2, 0, 100), trust: clamp(w.trust + 1, 0, 100), sexCounts: { ...w.sexCounts, [kind]: (w.sexCounts?.[kind] ?? 0) + 1 }, intimacyInjury: { ...w.intimacyInjury, [injuryKind]: clamp((w.intimacyInjury?.[injuryKind] ?? 0) + 10, 0, 100) } }
    return { workers: { ...s.workers, [id]: next }, actionPhaseUsed: s.phase, actionDay: s.day, actionCounts: { ...(s.actionDay === s.day ? s.actionCounts : {}), [action]: (s.actionDay === s.day ? s.actionCounts[action] ?? 0 : 0) + 1 }, ...eventUpdate(s, id, action, w, next) }
  }),
  useAdultToy: (id, item, room) => set(s => {
    const w = s.workers[id], age = candidates.find(c => c.id === id)?.age ?? 0
    if (!w?.alive || !adultToys.includes(item) || (s.officeStock[item] ?? 0) + (s.officePlaced[item] ?? 0) < 1 || !canChooseIntimacy(w, age) || hasUnfittedLimb(w) || (room === 'bedroom' ? !canCallBedroom(w) : s.officeCagedNpcId === id) || !get().canUseAction('useAdultToy')) return {}
    const next = { ...w, love: clamp(w.love + 1, 0, 100), trust: clamp(w.trust + 1, 0, 100) }
    return { workers: { ...s.workers, [id]: next }, actionPhaseUsed: s.phase, actionDay: s.day, actionCounts: { ...(s.actionDay === s.day ? s.actionCounts : {}), useAdultToy: (s.actionDay === s.day ? s.actionCounts.useAdultToy ?? 0 : 0) + 1 }, ...eventUpdate(s, id, 'useAdultToy', w, next, s.money, s.reputation, item) }
  }),
  setNpcClothing: (id, clothing, room) => set(s => {
    const w = s.workers[id]
    if (!w?.active || !w.alive || hasUnfittedLimb(w) || w.clothing === clothing || (room === 'bedroom' ? !canCallBedroom(w) : s.officeCagedNpcId === id)) return {}
    const next = { ...w, clothing }
    return { workers: { ...s.workers, [id]: next }, ...eventUpdate(s, id, clothing === 'clothed' ? 'dressNpc' : 'undressNpc', w, next) }
  }),
  setNpcAnalItem: (id, item, room) => set(s => {
    const w = s.workers[id]
    if (!w?.active || !w.alive || hasUnfittedLimb(w) || w.analItem === item || (room === 'bedroom' ? !canCallBedroom(w) : s.officeCagedNpcId === id)) return {}
    if (item && (w.analItem || (room === 'bedroom' ? s.bedroomPlaced[item] : s.officePlaced[item]) < 1)) return {}
    const next = { ...w, analItem: item }
    return { workers: { ...s.workers, [id]: next }, ...eventUpdate(s, id, item ? `equip_${item}` : 'removeAnalItem', w, next) }
  }),
  setNpcHandcuffed: (id, value, room) => set(s => {
    const w = s.workers[id]
    if (!w?.active || !w.alive || hasUnfittedLimb(w) || w.handcuffed === value || (room === 'bedroom' ? !canCallBedroom(w) : s.officeCagedNpcId === id)) return {}
    if (value && (room === 'bedroom' ? s.bedroomPlaced.handcuffs : s.officePlaced.handcuffs) < 1) return {}
    const next = { ...w, handcuffed: value }
    return { workers: { ...s.workers, [id]: next }, ...eventUpdate(s, id, value ? 'putOnHandcuffs' : 'removeHandcuffs', w, next) }
  }),
  workplaceAction: (id, action) => set(s => {
    const w = s.workers[id], job = s.assignments[id]
    if (s.officeCagedNpcId === id || !canVisitWorkplace(w, job, s.day, s.phase, s.vetDoctorId === id) || !get().canUseAction(action)) return {}
    if (action === 'inspectWork' ? w.workplaceInspectedDay === s.day : w.workplaceResponseDay === s.day) return {}
    const next: Worker = { ...w }, changes: Partial<GameState> = {}
    if (action === 'punishWork' || action === 'threatenWork') next.guaranteedShiftsLeft = Math.max(3, w.guaranteedShiftsLeft ?? 0)
    switch (action) {
      case 'inspectWork': next.workplaceInspectedDay = s.day; next.trust = clamp(w.trust + 1, 0, 100); break
      case 'praiseWork': next.workplaceResponseDay = s.day; next.trust = clamp(w.trust + 4, 0, 100); break
      case 'punishWork': next.workplaceResponseDay = s.day; next.trust = clamp(w.trust - 6, 0, 100); next.submission = clamp(w.submission + 2, 0, 100); changes.reputation = clamp(s.reputation - 1, 0, 100); break
      case 'threatenWork': next.workplaceResponseDay = s.day; next.submission = clamp(w.submission + 8, 0, 100); next.trust = clamp(w.trust - 8, 0, 100); changes.reputation = clamp(s.reputation - 3, 0, 100); break
      case 'giveDayOff': next.workplaceResponseDay = s.day; next.trust = clamp(w.trust + 3, 0, 100); changes.assignments = { ...s.assignments, [id]: 'rest' }; break
    }
    return { ...changes, workers: { ...s.workers, [id]: next }, actionPhaseUsed: s.phase, actionDay: s.day, actionCounts: { ...(s.actionDay === s.day ? s.actionCounts : {}), [action]: (s.actionDay === s.day ? s.actionCounts[action] ?? 0 : 0) + 1 }, ...eventUpdate(s, id, action, w, next, s.money, changes.reputation) }
  }),
  dismissEvent: () => set({ activeEvent: null }),
  resolveRequest: accept => set(s => {
    const pending = s.pendingRequest
    if (!pending) return {}
    const request = npcRequests.find(row => row.id === pending.requestId)
    const worker = s.workers[pending.workerId]
    if (!request || !worker?.alive || !worker.active || worker.housing === 'cage' || worker.punishedInCage || worker.punishedKneeling || s.officeCagedNpcId === pending.workerId) return { pendingRequest: null }
    const effects = accept ? request.accept : request.decline
    const next = { ...worker }
    for (const key of ['trust', 'love', 'submission'] as const) next[key] = clamp(next[key] + (effects[key] ?? 0), 0, 100)
    if (accept && request.cost) next.savings += request.cost
    if (accept && (request.id === 'oralRequest' || request.id === 'analRequest')) {
      const kind = request.id === 'oralRequest' ? 'oral' : 'anal'
      next.sexCounts = { ...worker.sexCounts, [kind]: (worker.sexCounts?.[kind] ?? 0) + 1 }
      next.intimacyInjury = { ...worker.intimacyInjury, [kind]: clamp((worker.intimacyInjury?.[kind] ?? 0) + 10, 0, 100) }
    }
    const money = s.money - (accept ? request.cost ?? 0 : 0)
    return { pendingRequest: null, workers: { ...s.workers, [pending.workerId]: next }, money, assignments: accept && request.dayOff ? { ...s.assignments, [pending.workerId]: 'rest' as Job } : s.assignments, ...eventUpdate(s, pending.workerId, accept ? 'npcRequestAccepted' : 'npcRequestDeclined', worker, next, money, s.reputation, request.id) }
  }),
  setWage: (id, amount) => set(s => s.workers[id]?.alive && s.workers[id]?.active && s.workers[id].contract === 'paid' && Number.isFinite(amount) ? { workers: { ...s.workers, [id]: { ...s.workers[id], wage: clamp(Math.round(amount), 0, 30), agreedWage: clamp(Math.round(amount), 0, 30) } } } : {}),
  setHousing: (id, housing) => set(s => {
    const w = s.workers[id]
    if (!w?.alive || !w.active || hasUnfittedLimb(w) || w.housing === housing || occupied(s.workers, housing, id) >= housingCapacity(s, housing)) return {}
    const next = { ...w, housing, punishedInCage: false, trust: clamp(w.trust + (housing === 'hut' ? 5 : housing === 'cage' ? -8 : 0), 0, 100), love: clamp(w.love + (housing === 'hut' ? 2 : housing === 'cage' ? -3 : 0), 0, 100) }
    return { workers: { ...s.workers, [id]: next }, ...eventUpdate(s, id, housing === 'hut' ? 'moveToHut' : housing === 'barrack' ? 'moveToBarrack' : 'moveToCage', w, next) }
  }),
  reward: (id, amount) => set(s => s.workers[id]?.alive && s.workers[id]?.active && amount > 0 && amount <= 10 && s.money >= amount ? { money: s.money - amount, workers: { ...s.workers, [id]: { ...s.workers[id], savings: s.workers[id].savings + amount, totalReceivedFromPlayer: s.workers[id].totalReceivedFromPlayer + amount, trust: clamp(s.workers[id].trust + 2, 0, 100) } } } : {}),
  fine: (id, amount, reason) => set(s => {
    const w = s.workers[id]; if (!w?.alive || !w.active || w.contract !== 'paid' || reason.trim().length < 8 || amount < 1 || amount > Math.floor(w.wage * .2) || w.savings < amount) return {}
    return { workers: { ...s.workers, [id]: { ...w, savings: w.savings - amount, trust: clamp(w.trust - 8, 0, 100) } }, reputation: clamp(s.reputation - 2, 0, 100), message: 'msgFine' }
  }),
  proposeModification: (id, procedureId) => set(s => {
    const w = s.workers[id], procedure = procedures.find(p => p.id === procedureId)
    if (!w || !procedure || !canReceiveProcedure(id, w, procedure, s.day) || !s.vetBuilt || !s.vetDoctorId || s.officeCagedNpcId === s.vetDoctorId || !s.workers[s.vetDoctorId] || !canWorkAtFarm(s.workers[s.vetDoctorId], s.day)) return {}
    const accepted = w.modificationConsentAtSigning || w.love >= 70 || (w.debauchery >= 70 && w.trust >= 55)
    const pressured = !accepted && w.submission >= 70
    const next: Worker = { ...w, modificationDecision: { procedureId, accepted, day: s.day }, trust: pressured ? clamp(w.trust - 8, 0, 100) : w.trust }
    const reputation = pressured ? clamp(s.reputation - 5, 0, 100) : s.reputation
    const action = accepted ? 'procedureAccepted' : pressured ? 'procedurePressure' : 'procedureRefused'
    return { workers: { ...s.workers, [id]: next }, reputation, ...eventUpdate(s, id, action, w, next, s.money, reputation, procedureId) }
  }),
  performOperation: (id, procedureId) => set(s => {
    const w = s.workers[id], procedure = procedures.find(p => p.id === procedureId)
    if (!w || !procedure || !canReceiveProcedure(id, w, procedure, s.day) || !s.vetBuilt || !s.vetDoctorId || s.officeCagedNpcId === s.vetDoctorId || !s.workers[s.vetDoctorId] || !canWorkAtFarm(s.workers[s.vetDoctorId], s.day) || w.modificationDecision?.procedureId !== procedureId || !w.modificationDecision.accepted || w.savings < procedure.costCredits) return {}
    const outcome = resolveOperationOutcome(procedure, Math.random(), s.workers[s.vetDoctorId].bimbofication)
    const trait = procedureId === 'functional_prosthesis' ? 'strong_legs' : procedureId === 'powered_arm' ? 'strong_arms' : null
    const success = outcome === 'success', fatal = outcome === 'death', disabled = outcome === 'disability'
    const effect = procedure.effect as unknown as Record<string, number>
    const bodyDelta = success ? { weightKg: effect.weightKg ?? 0, chestCm: effect.chestCm ?? 0 } : {}
    const next: Worker = { ...w, savings: w.savings - procedure.costCredits, operations: [...w.operations, { id: procedureId, day: s.day, outcome }], traits: success && trait && !w.traits.includes(trait) ? [...w.traits, trait] : w.traits, body: applyProcedureMeasurements(w.body, bodyDelta), medicalEffects: success ? { lactation: (w.medicalEffects?.lactation ?? false) || procedureId === 'lactation_hormones', oviposition: (w.medicalEffects?.oviposition ?? false) || procedureId === 'oviposition_uterus', hair: procedureId === 'hair_growth_hormones' ? 'growth' : procedureId === 'hair_loss_hormones' ? 'loss' : w.medicalEffects?.hair ?? 'normal' } : w.medicalEffects, prostheticInventory: w.prostheticInventory ?? [], equippedProsthetics: w.equippedProsthetics ?? {}, disabled: w.disabled || disabled, alive: !fatal, active: !fatal && w.active, lastDayOnSite: fatal ? s.day : w.lastDayOnSite, injuredUntilDay: fatal ? undefined : s.day + procedure.recoveryDays + (outcome === 'complication' ? 5 : disabled ? 14 : 0), health: fatal ? 0 : disabled ? Math.min(w.health, 20) : clamp(w.health - (outcome === 'complication' ? 15 : 3), 0, 100), modificationDecision: undefined }
    const reputation = clamp(s.reputation - (fatal ? 15 : disabled ? 8 : outcome === 'complication' ? 2 : 0), 0, 100)
    const action = fatal ? 'operationFatal' : disabled ? 'operationDisability' : outcome === 'complication' ? 'operationComplication' : 'operationComplete'
    return { workers: { ...s.workers, [id]: next }, assignments: { ...s.assignments, [id]: 'rest' }, reputation, ...eventUpdate(s, id, action, w, next, s.money, reputation, procedureId) }
  }),
  buyProsthetic: itemId => set(s => { const item = prostheticFor(itemId); return item && s.money >= item.price ? { money: s.money - item.price, prostheticStock: { ...s.prostheticStock, [itemId]: (s.prostheticStock[itemId] ?? 0) + 1 } } : {} }),
  issueProsthetic: (workerId, itemId) => set(s => { const w = s.workers[workerId]; if (!w?.alive || !w.active || !prostheticFor(itemId) || (s.prostheticStock[itemId] ?? 0) < 1) return {}; return { prostheticStock: { ...s.prostheticStock, [itemId]: s.prostheticStock[itemId] - 1 }, workers: { ...s.workers, [workerId]: { ...w, prostheticInventory: [...(w.prostheticInventory ?? []), itemId] } } } }),
  equipProsthetic: (workerId, itemId) => set(s => { const w = s.workers[workerId], item = prostheticFor(itemId); if (!w?.alive || !w.active || !item || !(w.prostheticInventory ?? []).includes(itemId) || !w.operations.some(op => op.id === `replacement_${item.slot}` && (!op.outcome || op.outcome === 'success'))) return {}; const old = w.equippedProsthetics?.[item.slot]; return { workers: { ...s.workers, [workerId]: { ...w, prostheticInventory: [...(w.prostheticInventory ?? []).filter((id, index) => id !== itemId || index !== w.prostheticInventory.indexOf(itemId)), ...(old ? [old] : [])], equippedProsthetics: { ...w.equippedProsthetics, [item.slot]: itemId } } } } }),
  fitProstheticFromStock: (workerId, itemId) => set(s => { const w = s.workers[workerId], item = prostheticFor(itemId); if (!w?.alive || !w.active || !item || (s.prostheticStock[itemId] ?? 0) < 1 || !w.operations.some(op => op.id === `replacement_${item.slot}` && (!op.outcome || op.outcome === 'success'))) return {}; const old = w.equippedProsthetics?.[item.slot]; return { prostheticStock: { ...s.prostheticStock, [itemId]: s.prostheticStock[itemId] - 1 }, workers: { ...s.workers, [workerId]: { ...w, prostheticInventory: [...(w.prostheticInventory ?? []), ...(old ? [old] : [])], equippedProsthetics: { ...w.equippedProsthetics, [item.slot]: itemId } } } } }),
  removeProsthetic: (workerId, slot) => set(s => { const w = s.workers[workerId], old = w?.equippedProsthetics?.[slot]; if (!w?.alive || !w.active || !old) return {}; const equipped = { ...w.equippedProsthetics }; delete equipped[slot]; return { assignments: { ...s.assignments, [workerId]: 'rest' }, workers: { ...s.workers, [workerId]: { ...w, prostheticInventory: [...(w.prostheticInventory ?? []), old], equippedProsthetics: equipped } } } }),
  expandHousing: () => get().buildHut(),
  buildCage: () => set(s => s.cages < 5 && s.money >= 90 ? { cages: s.cages + 1, staffCapacity: s.staffCapacity + 1, money: s.money - 90, message: 'msgHousingExpanded' } : {}),
  buildBarrack: () => set(s => s.money >= 300 ? { barracks: s.barracks + 1, staffCapacity: s.staffCapacity + 4, money: s.money - 300, message: 'msgHousingExpanded' } : {}),
  buildHut: () => set(s => s.money >= 180 ? { huts: s.huts + 1, staffCapacity: s.staffCapacity + 2, money: s.money - 180, message: 'msgHousingExpanded' } : {}),
  createEnterprise: (id, name) => set(s => {
    const cost = id === 'droneAssembly' ? 450 : id === 'store' ? 300 : id === 'trainingCamp' ? 400 : Infinity
    const cleanName = (id === 'store' ? name.trim() : name.trim() || (id === 'droneAssembly' ? 'Збірка дронів' : id === 'trainingCamp' ? 'Тренувальний табір' : '')).slice(0, 32)
    return s.money >= cost && !s.enterprises.includes(id) && cleanName.length >= 3 ? { money: s.money - cost, enterprises: [...s.enterprises, id], enterpriseNames: { ...s.enterpriseNames, [id]: cleanName } } : {}
  }),
  setTraining: (id, kind) => set(s => s.enterprises.includes('trainingCamp') && s.assignments[id] === 'training' && s.workers[id]?.alive && (['run','bag','spar'] as TrainingKind[]).includes(kind) ? { trainingPlans: { ...s.trainingPlans, [id]: kind } } : {}),
  listInStore: (good, quantity, price) => set(s => {
    const count = Math.floor(quantity), ask = Math.floor(price)
    if (!s.enterprises.includes('store') || ![...sellableGoods, 'drone'].includes(good) || !Number.isFinite(count) || !Number.isFinite(ask) || count < 1 || ask < 1 || ask > 9999) return {}
    if (good === 'drone') { if (count > s.drones) return {}; return { drones: s.drones - count, storeListings: [...s.storeListings, { good, quantity: count, price: ask }] } }
    if (count > s.stocks[good]) return {}
    const { remaining } = takeProvenance(s.provenance[good], count)
    return { stocks: { ...s.stocks, [good]: s.stocks[good] - count }, provenance: { ...s.provenance, [good]: remaining }, storeListings: [...s.storeListings, { good, quantity: count, price: ask }] }
  }),
  removeStoreListing: index => set(s => {
    const item = s.storeListings[index]; if (!item) return {}
    const storeListings = s.storeListings.filter((_, i) => i !== index)
    return item.good === 'drone' ? { storeListings, drones: s.drones + item.quantity } : { storeListings, stocks: { ...s.stocks, [item.good]: s.stocks[item.good] + item.quantity } }
  }),
  sellDrones: quantity => set(s => { const count = Math.floor(quantity); return s.enterprises.includes('droneAssembly') && count > 0 && count <= s.drones ? { drones: s.drones - count, money: s.money + count * droneSalePrice, totalSales: s.totalSales + count * droneSalePrice } : {} }),
  purchase: items => set(s => {
    const quantities = Object.fromEntries((Object.keys(shopPrices) as ShopItem[]).map(id => [id, Math.max(0, Math.min(99, Math.floor(items[id] ?? 0)))])) as Record<ShopItem, number>
    const total = (Object.keys(shopPrices) as ShopItem[]).reduce((sum, id) => sum + quantities[id] * shopPrices[id], 0)
    if (!total || total > s.money) return {}
    const stocks = { ...s.stocks, bread: s.stocks.bread + quantities.bread * 3, lard: s.stocks.lard + quantities.lard * 2 }
    const partStock = { ...s.partStock }
    for (const part of droneParts) partStock[part] = (partStock[part] ?? 0) + quantities[part]
    const officeStock = { ...s.officeStock }
    for (const item of officeGoods) officeStock[item] = (officeStock[item] ?? 0) + quantities[item]
    return { money: s.money - total, food: stocks.bread + stocks.lard, stocks, partStock, officeStock,
      livestock: { chickens: s.livestock.chickens + quantities.chicken, pigs: s.livestock.pigs + quantities.pig, cattle: s.livestock.cattle + quantities.cow },
      feedStock: { chickens: s.feedStock.chickens + quantities.grain * 10, pigs: s.feedStock.pigs + quantities.pigFeed * 10, cattle: s.feedStock.cattle + quantities.cowFeed * 10 },
      vodka: s.vodka + quantities.vodka, message: 'msgOrder' }
  }),
  placeOfficeItem: (item, room = 'office') => set(s => {
    if (!officeGoods.includes(item) || (s.officeStock[item] ?? 0) < 1 || (room === 'bedroom' && !bedroomGoods.includes(item as BedroomGood))) return {}
    return room === 'office' ? { officeStock: { ...s.officeStock, [item]: s.officeStock[item] - 1 }, officePlaced: { ...s.officePlaced, [item]: (s.officePlaced[item] ?? 0) + 1 } } : { officeStock: { ...s.officeStock, [item]: s.officeStock[item] - 1 }, bedroomPlaced: { ...s.bedroomPlaced, [item]: (s.bedroomPlaced[item as BedroomGood] ?? 0) + 1 } }
  }),
  removeOfficeItem: (item, room = 'office') => set(s => {
    if (!officeGoods.includes(item) || (room === 'bedroom' && !bedroomGoods.includes(item as BedroomGood))) return {}
    if (room === 'office') return (s.officePlaced[item] ?? 0) > 0 ? { officePlaced: { ...s.officePlaced, [item]: s.officePlaced[item] - 1 }, officeStock: { ...s.officeStock, [item]: (s.officeStock[item] ?? 0) + 1 }, officeCagedNpcId: item === 'dogCrate' && s.officePlaced.dogCrate === 1 ? null : s.officeCagedNpcId } : {}
    return (s.bedroomPlaced[item as BedroomGood] ?? 0) > 0 ? { bedroomPlaced: { ...s.bedroomPlaced, [item]: s.bedroomPlaced[item as BedroomGood] - 1 }, officeStock: { ...s.officeStock, [item]: (s.officeStock[item] ?? 0) + 1 } } : {}
  }),
  officeCageAction: (id, action) => set(s => {
    const worker = s.workers[id]
    if (action === 'release') return s.officeCagedNpcId === id && worker ? { officeCagedNpcId: null, ...eventUpdate(s, id, 'officeRelease', worker, worker) } : {}
    const occupied = s.officeCagedNpcId && s.workers[s.officeCagedNpcId]?.alive && s.workers[s.officeCagedNpcId]?.active
    if (!worker?.alive || !worker.active || occupied || (s.officePlaced.dogCrate ?? 0) < 1 || !get().canUseAction('officeCage')) return {}
    return { officeCagedNpcId: id, actionPhaseUsed: s.phase, actionDay: s.day, actionCounts: { ...(s.actionDay === s.day ? s.actionCounts : {}), officeCage: (s.actionDay === s.day ? s.actionCounts.officeCage ?? 0 : 0) + 1 }, ...eventUpdate(s, id, 'officeCage', worker, worker) }
  }),
  listForSale: (good, quantity) => set(s => {
    const count = Math.floor(quantity)
    if (!sellableGoods.includes(good) || count < 1 || count > s.stocks[good]) return {}
    const { remaining, contributors } = takeProvenance(s.provenance[good], count)
    return { stocks: { ...s.stocks, [good]: s.stocks[good] - count }, provenance: { ...s.provenance, [good]: remaining }, listings: [...s.listings, { good, quantity: count, price: salePrices[good], listedDay: s.day, contributors }], message: 'msgListed' }
  }),
  buildVet: () => set(s => { if (s.vetBuilt || s.money < 200) return {}; return { money: s.money - 200, vetBuilt: true, vetDoctorId: null, message: 'msgVetBuilt' } }),
  appointVet: id => set(s => s.vetBuilt && s.officeCagedNpcId !== id && s.workers[id] && canWorkAtFarm(s.workers[id], s.day) ? { vetDoctorId: id, assignments: { ...s.assignments, [id]: 'rest' }, message: 'msgVetAppointed' } : {}),
  sleep: () => { const startDay = get().day; while (get().day === startDay && !get().reportPending && !get().pendingRequest && !get().pendingContractNotices.length && !get().arrivalNotices.length) get().advance() },
  advance: () => {
    if (get().reportPending || get().pendingRequest || get().pendingContractNotices.length || get().arrivalNotices.length) return
    const s = get(), next = order[(order.indexOf(s.phase) + 1) % 4]
    if (s.phase !== 'night') { set({ phase: next, message: phaseMessage[next], actionPhaseUsed: null }); set(current => ({ pendingRequest: chooseNpcRequest(current) })); return }
    const planned = Object.fromEntries(Object.entries(s.assignments).filter(([id]) => s.workers[id]?.alive && s.workers[id]?.active && id !== s.vetDoctorId).map(([id, job]) => [id, s.officeCagedNpcId !== id && !s.workers[id].punishedInCage && !s.workers[id].punishedKneeling && canWorkAtFarm(s.workers[id], s.day) && order.some(phase => (s.workers[id].routine?.[phase] ?? defaultRoutine[phase]) === 'work') ? job : 'rest'])) as Record<string, Job>
    const disobedience: Record<string, Disobedience> = {}
    const living = Object.fromEntries(Object.entries(planned).map(([id, job]) => { const result = resolveDisobedience(s.workers[id], job, Math.random()); disobedience[id] = result; return [id, result ? 'rest' : job] })) as Record<string, Job>
    const result = resolveDay(Object.fromEntries(Object.entries(living).map(([id, job]) => [id, job === 'layEggs' || job === 'milking' ? 'production' : job])) as Record<string, Job>, s.wellbeing, s.reputation)
    let money = s.money, reputation = result.reputation
    const stocks = { ...s.stocks }
    const provenance: Provenance = Object.fromEntries(sellableGoods.map(good => [good, { ...(s.provenance[good] ?? {}) }])) as Provenance
    let producedUnits = 0, dronesProduced = 0, wellbeingBonus = 0, drones = s.drones
    const producedGoods = Object.fromEntries(sellableGoods.map(good => [good, 0])) as Record<SaleGood, number>
    const partStock = { ...s.partStock }
    const workers = { ...s.workers }
    const assignments = { ...s.assignments }
    let anyInjury = false, anyFatality = false
    const dayWorkers: WorkerDayReport[] = []
    const productionCount = Object.values(living).filter(job => job === 'production' || job === 'layEggs' || job === 'milking').length
    const journal = [...s.journal]
    const teamHasProtector = s.hired.some(id => s.workers[id]?.active && s.workers[id]?.traits.includes('protective'))
    for (const id of s.hired) {
      const worker = workers[id]; if (!worker?.alive || !worker.active) continue
      let eaten = 0, consumedCalories = 0
      for (const food of humanFoods) { const amount = Math.min(worker.diet[food], stocks[food]); stocks[food] -= amount; eaten += amount; consumedCalories += amount * foodCalories[food]; if (farmGoods.includes(food as FarmGood)) provenance[food as FarmGood] = takeProvenance(provenance[food as FarmGood], amount).remaining }
      const paid = worker.contract === 'paid' && !disobedience[id] ? Math.min(worker.wage, money) : 0; money -= paid
      const fed = consumedCalories > 0 ? consumedCalories >= calorieNeed(worker) : worker.contract === 'paid' && paid >= worker.agreedWage
      const nutritionRatio = consumedCalories / Math.max(1, calorieNeed(worker))
      const healthChange = nutritionRatio === 0 && worker.contract === 'paid' && paid >= worker.agreedWage ? 0 : nutritionRatio === 0 ? -5 : nutritionRatio < .5 ? -3 : nutritionRatio < .8 ? -1 : nutritionRatio >= 1 ? 1 : 0
      const traits = conditionEffects(worker, fed, worker.contract === 'paid' && paid < worker.agreedWage, living[id])
      wellbeingBonus += traits.wellbeing
      const workChange = (worker.housing === 'cage' ? -1 : worker.housing === 'hut' ? 1 : 0) + traits.health
      const vetWorking = !!(s.vetBuilt && s.vetDoctorId && s.officeCagedNpcId !== s.vetDoctorId && s.workers[s.vetDoctorId] && canWorkAtFarm(s.workers[s.vetDoctorId], s.day))
      const risk = riskForWorker(worker, teamHasProtector, productionCount) * (vetWorking ? .9 : 1)
      const incidentRoll = living[id] === 'production' || living[id] === 'layEggs' || living[id] === 'milking' ? Math.random() : 1
      const fatal = incidentRoll < .001
      const injured = !fatal && incidentRoll < risk
      const unclothedWork = worker.clothing === 'unclothed' && living[id] !== 'rest'
      const health = clamp(worker.health + healthChange + workChange - (injured ? 12 : 0) - (unclothedWork ? 2 : 0) - (worker.analItem ? 1 : 0), 0, 100)
      const wageShortfall = worker.contract === 'paid' && !disobedience[id] ? Math.max(0, worker.agreedWage - paid) : 0
      // Livestock output is calculated once per day below, capped by workers and feed.
      if (living[id] === 'layEggs' && worker.medicalEffects?.oviposition) { const quantity = 2 * order.filter(phase => (worker.routine?.[phase] ?? defaultRoutine[phase]) === 'work').length; stocks.girlEggs += quantity; provenance.girlEggs[id] = (provenance.girlEggs[id] ?? 0) + quantity; producedUnits += quantity; producedGoods.girlEggs += quantity }
      if (living[id] === 'milking' && worker.medicalEffects?.lactation) { const enlarged = worker.operations.some(op => op.id === 'breast_enlargement' && (!op.outcome || op.outcome === 'success')); const quantity = (2 + Number(enlarged) + prostheticBonuses(worker.equippedProsthetics).extraGoods) * order.filter(phase => (worker.routine?.[phase] ?? defaultRoutine[phase]) === 'work').length; stocks.girlMilk += quantity; provenance.girlMilk[id] = (provenance.girlMilk[id] ?? 0) + quantity; producedUnits += quantity; producedGoods.girlMilk += quantity }
      if (living[id] === 'droneAssembly' && s.enterprises.includes('droneAssembly')) {
        const shifts = order.filter(phase => (worker.routine?.[phase] ?? defaultRoutine[phase]) === 'work').length
        for (let shift = 0; shift < shifts && droneParts.every(part => (partStock[part] ?? 0) > 0); shift++) { for (const part of droneParts) partStock[part]--; drones++; producedUnits++; dronesProduced++ }
      }
      const workDays = { ...worker.workDays }
      if (living[id] === 'production') workDays.production++
      const gained: string[] = []
      const training = { ...worker.training }
      if (living[id] === 'training' && s.enterprises.includes('trainingCamp')) {
        const plan = s.trainingPlans[id] ?? 'run'
        if (plan === 'run') training.speed = clamp(training.speed + 1, 0, 100)
        if (plan === 'bag') training.strength = clamp(training.strength + 1, 0, 100)
      }
      const baseline = candidates.find(c => c.id === id)?.body ?? worker.body
      workers[id] = { ...worker, workDays, training, traits: [...worker.traits, ...gained], debauchery: clamp(worker.debauchery + Number(!!worker.analItem), 0, 100), guaranteedShiftsLeft: planned[id] !== 'rest' && !disobedience[id] ? Math.max(0, (worker.guaranteedShiftsLeft ?? 0) - order.filter(phase => (worker.routine?.[phase] ?? defaultRoutine[phase]) === 'work').length) : worker.guaranteedShiftsLeft, body: updateBodyForDay(worker.body, baseline, nutritionRatio, worker.housing), savings: worker.savings + paid, totalReceivedFromPlayer: worker.totalReceivedFromPlayer + paid, wageDebt: worker.wageDebt + wageShortfall, absenceCount: worker.absenceCount + Number(!!disobedience[id]), trust: clamp(worker.trust - (wageShortfall ? 4 : 0) + (worker.housing === 'cage' ? -3 : worker.housing === 'hut' ? 1 : 0) + traits.trust, 0, 100), health, alive: !fatal, active: !fatal && (worker.contractEndsDay === null || s.day < worker.contractEndsDay), lastDayOnSite: fatal || worker.contractEndsDay === s.day ? s.day : worker.lastDayOnSite, injuredUntilDay: injured ? s.day + 2 : worker.injuredUntilDay }
      const reasons = [worker.housing === 'cage' ? 'reportCage' : worker.housing === 'barrack' ? 'reportBarrack' : 'reportHut', disobedience[id] ? (disobedience[id] === 'unauthorizedAbsence' ? 'reportAbsence' : 'reportRefusal') : living[id] === 'rest' ? 'reportRest' : 'reportWork']
      if (worker.contract === 'foodOnly') reasons.push(consumedCalories < calorieNeed(worker) * .8 ? 'reportHungry' : 'reportFed')
      else reasons.push(disobedience[id] ? 'reportNoPayDiscipline' : paid < worker.agreedWage ? 'reportUnderpaid' : 'reportPaid')
      if (injured) reasons.push('reportInjury')
      if (unclothedWork) reasons.push('reportUnclothedWork')
      if (worker.analItem) reasons.push('reportAnalItem')
      if (fatal) reasons.push('reportFatality')
      if (disobedience[id]) journal.push({ id: (journal.at(-1)?.id ?? 0) + 1, day: s.day, phase: 'night', workerId: id, action: disobedience[id], storyKey: `story_${disobedience[id]}`, changes: {} })
      const statuses = [worker.clothing === 'unclothed' ? 'reportStatusUnclothed' : null, worker.analItem === 'analPlug' ? 'reportStatusAnalPlug' : worker.analItem === 'analVibrator' ? 'reportStatusAnalVibrator' : null, worker.handcuffed ? 'reportStatusHandcuffed' : null, worker.punishedKneeling ? 'reportStatusKneeling' : null, worker.punishedInCage || worker.housing === 'cage' ? 'reportStatusCaged' : null, s.officeCagedNpcId === id ? 'reportStatusDogCrate' : null].filter((status): status is string => status !== null)
      dayWorkers.push({ id, healthBefore: worker.health, healthAfter: health, debaucheryBefore: worker.debauchery, debaucheryAfter: workers[id].debauchery, paid, eaten, calories: consumedCalories, calorieNeed: calorieNeed(worker), reasons, statuses })
      if (!workers[id].active || hasUnfittedLimb(workers[id])) assignments[id] = 'rest'
      if (fatal) { anyFatality = true; reputation = clamp(reputation - 15, 0, 100); assignments[id] = 'rest' }
      if (injured) { anyInjury = true; reputation = clamp(reputation - 3, 0, 100); assignments[id] = 'rest' }
      if ((worker.contract === 'foodOnly' && consumedCalories < calorieNeed(worker) * .5) || wageShortfall > 0) reputation = clamp(reputation - 5, 0, 100)
    }
    const farmWorkers = s.hired.filter(id => living[id] === 'production' && workers[id]?.alive && workers[id]?.active)
    const feedStock = { ...s.feedStock }
    const fedChickens = Math.min(s.livestock.chickens, feedStock.chickens); feedStock.chickens -= fedChickens
    const fedPigs = Math.min(s.livestock.pigs, feedStock.pigs); feedStock.pigs -= fedPigs
    const fedCattle = Math.min(s.livestock.cattle, feedStock.cattle); feedStock.cattle -= fedCattle
    const productiveChickens = Math.min(fedChickens, farmWorkers.length * 8)
    const productivePigs = Math.min(fedPigs, farmWorkers.length * 2)
    const productiveCattle = Math.min(fedCattle, farmWorkers.length * 2)
    const farmYield = { eggs: productiveChickens * 2, meat: s.day % 2 === 0 ? productivePigs * 2 : 0, milk: productiveCattle * 2, cheese: productiveCattle }
    for (const good of farmGoods) {
      const quantity = farmYield[good]
      stocks[good] += quantity; producedUnits += quantity; producedGoods[good] += quantity
      if (quantity && farmWorkers.length) provenance[good][farmWorkers[0]] = (provenance[good][farmWorkers[0]] ?? 0) + quantity
    }
    const sparring = s.hired.filter(id => living[id] === 'training' && s.trainingPlans[id] === 'spar' && workers[id]?.alive && workers[id]?.active)
    for (const worker of Object.values(workers)) worker.intimacyInjury = { oral: Math.max(0, (worker.intimacyInjury?.oral ?? 0) - 2), anal: Math.max(0, (worker.intimacyInjury?.anal ?? 0) - 2), vaginal: Math.max(0, (worker.intimacyInjury?.vaginal ?? 0) - 2) }
    for (let i = 0; i + 1 < sparring.length; i += 2) for (const id of [sparring[i], sparring[i + 1]]) workers[id] = { ...workers[id], training: { ...workers[id].training, combat: clamp(workers[id].training.combat + 1, 0, 100) } }
    const saleIncome = s.listings.reduce((sum, listing) => sum + listing.quantity * listing.price, 0)
    for (const listing of s.listings) for (const [id, quantity] of Object.entries(listing.contributors)) if (workers[id]) workers[id] = { ...workers[id], totalEarnedForPlayer: workers[id].totalEarnedForPlayer + quantity * listing.price }
    const sellers = s.hired.filter(id => living[id] === 'storeSales' && workers[id]?.alive && workers[id]?.active)
    let capacity = sellers.reduce((sum, id) => sum + order.filter(phase => (workers[id].routine?.[phase] ?? defaultRoutine[phase]) === 'work').length * 2, 0)
    let storeIncome = 0
    const storeListings = s.storeListings.map(listing => {
      const base = listing.good === 'drone' ? droneSalePrice : salePrices[listing.good]
      const demand = listing.price > base * 2 ? 0 : listing.price > base * 1.5 ? 1 : listing.price > base ? 2 : capacity
      const sold = Math.min(listing.quantity, capacity, demand)
      capacity -= sold; storeIncome += sold * listing.price
      return { ...listing, quantity: listing.quantity - sold }
    }).filter(listing => listing.quantity > 0)
    const vetOperating = !!(s.vetBuilt && s.vetDoctorId && s.officeCagedNpcId !== s.vetDoctorId && workers[s.vetDoctorId]?.alive && workers[s.vetDoctorId]?.active && !workers[s.vetDoctorId]?.punishedInCage && !workers[s.vetDoctorId]?.punishedKneeling && canWorkAtFarm(workers[s.vetDoctorId], s.day))
    const vetIncome = vetOperating ? vetDailyIncome : 0
    const arrivingIds = s.hired.filter(id => workers[id]?.alive && workers[id].arrivalDay === s.day + 1)
    for (const id of arrivingIds) workers[id] = { ...workers[id], active: true, arrivalDay: undefined }
    set({ day: s.day + 1, phase: next, actionPhaseUsed: null, actionDay: s.day + 1, actionCounts: {}, arrivalNotices: [...s.arrivalNotices, ...arrivingIds], output: s.output + producedUnits, wellbeing: clamp(result.wellbeing + wellbeingBonus + (vetOperating ? 1 : 0), 0, 100), reputation,
      food: stocks.bread + stocks.lard, stocks, partStock, drones, storeListings, provenance, listings: [], journal, totalSales: s.totalSales + saleIncome + storeIncome + vetIncome, lastReport: { day: s.day, sales: saleIncome + storeIncome + vetIncome, vetIncome, produced: producedUnits, producedGoods, dronesProduced, feedBefore: Object.values(s.feedStock).reduce((a,b)=>a+b,0), feedAfter: Object.values(feedStock).reduce((a,b)=>a+b,0), feedByTypeBefore: { ...s.feedStock }, feedByTypeAfter: { ...feedStock }, moneyBefore: s.money, moneyAfter: money + saleIncome + storeIncome + vetIncome, foodAfter: { bread: stocks.bread, lard: stocks.lard }, workers: dayWorkers }, reportPending: true,
      money: money + saleIncome + storeIncome + vetIncome, feedStock, feedDays: 0, workers, assignments,
      message: anyFatality ? 'msgFatality' : anyInjury ? 'msgInjury' : 'msgReport' })
    if (!arrivingIds.length) set(current => ({ pendingRequest: chooseNpcRequest(current) }))
  },
  reset: () => set(initial)
}), {
  name: 'reclaim-save-v1', version: 31,
  migrate: (persisted, version) => {
    let old = persisted as Partial<GameState>
    if (version < 4) {
      const hired = old.hired ?? []
      const huts = Math.ceil(Math.max(0, hired.filter(id => old.workers?.[id]?.alive !== false).length - 1) / 2)
      const workers = Object.fromEntries(hired.map((id, i) => { const w = old.workers?.[id] ?? defaultWorker(id); return [id, {
        ...defaultWorker(id, w.contract), ...w, housing: (i === 0 ? 'cage' : 'hut') as Housing,
        traits: candidates.find(c => c.id === id)?.traits ?? [], operations: [], workDays: { production: 0, maintenance: 0 }
      }] }))
      old = { ...initial, ...old, cages: 1, huts, staffCapacity: 1 + huts * 2, vodka: 0, enterprises: ['farm'], workers }
    }
    if (version < 5) old = { ...initial, ...old, workers: Object.fromEntries(Object.entries(old.workers ?? {}).map(([id, w]) => [id, { ...defaultWorker(id, w.contract, 1, 'lifetime'), ...w, nickname: '', hiredOnDay: 1, contractTerm: 'lifetime' as ContractTerm, contractEndsDay: null, active: w.alive, totalEarnedForPlayer: 0, totalReceivedFromPlayer: w.savings, body: candidates.find(c => c.id === id)?.body ?? defaultWorker(id).body }])) }
    if (version < 6) old = { ...initial, ...old, output: 0, stocks: { ...initial.stocks, bread: old.food ?? initial.food }, listings: [], totalSales: 0, vetBuilt: false, vetDoctorId: null,
      workers: Object.fromEntries(Object.entries(old.workers ?? {}).map(([id, w]) => [id, { ...w, diet: { ...defaultWorker(id, w.contract).diet, bread: w.ration } }])) }
    if (version < 7) old = { ...initial, ...old, provenance: { ...initial.provenance }, listings: [] }
    if (version < 8) old = { ...initial, ...old, enterpriseNames: { farm: 'Ферма', ...(old.enterpriseNames ?? {}), ...(old.enterprises?.includes('depot') ? { depot: 'Ремонтне депо' } : {}), ...(old.enterprises?.includes('plant') ? { plant: 'Відновлювальний завод' } : {}) } }
    if (version < 9) old = { ...initial, ...old, lastReport: null, workers: Object.fromEntries(Object.entries(old.workers ?? {}).map(([id, w]) => [id, { ...w, respect: w.trust ?? 25, fear: 10, friendship: 10, love: 0, diet: w.contract === 'paid' ? { bread: 0, lard: 0, meat: 0, milk: 0, cheese: 0, eggs: 0 } : w.diet, ration: w.contract === 'paid' ? 0 : w.ration }])) }
    if (version < 10) old = { ...initial, ...old, journal: [], activeEvent: null, workers: Object.fromEntries(Object.entries(old.workers ?? {}).map(([id, w]) => [id, { ...w, debauchery: 20 }])) }
    if (version < 11) old = { ...initial, ...old, workers: Object.fromEntries(Object.entries(old.workers ?? {}).map(([id, w]) => [id, { ...w, submission: 5 }])) }
    if (version < 12) old = { ...initial, ...old, workers: Object.fromEntries(Object.entries(old.workers ?? {}).map(([id, w]) => [id, { ...w, intimacyConsentDay: undefined }])) }
    if (version < 13) old = { ...initial, ...old, workers: Object.fromEntries(Object.entries(old.workers ?? {}).map(([id, w]) => {
      const legacy = w as Worker & { medicalGrant?: number }
      const { medicalGrant, ...rest } = legacy
      return [id, { ...rest, savings: (w.savings ?? 0) + (medicalGrant ?? 0), modificationConsentAtSigning: personalFor(id)?.modificationConsentAtSigning ?? false, modificationDecision: undefined }]
    })) }
    if (version < 14) old = { ...initial, ...old, stocks: { ...initial.stocks, ...(old.stocks ?? {}) }, provenance: { ...initial.provenance, ...(old.provenance ?? {}) }, workers: Object.fromEntries(Object.entries(old.workers ?? {}).map(([id, w]) => [id, { ...w, requestedWage: letterFor(id)?.requestedWage ?? 12, absenceCount: 0 }])) }
    if (version < 15) old = { ...initial, ...old, prostheticStock: {}, workers: Object.fromEntries(Object.entries(old.workers ?? {}).map(([id, w]) => { const equippedProsthetics: Partial<Record<LimbSlot, string>> = {}; for (const [operationId, itemId] of Object.entries({ replacement_left_arm: 'arm_left_standard', replacement_right_arm: 'arm_right_standard', replacement_left_leg: 'leg_left_standard', replacement_right_leg: 'leg_right_standard' })) if (w.operations?.some(op => op.id === operationId && (!op.outcome || op.outcome === 'success'))) { const slot = prostheticFor(itemId)?.slot; if (slot) equippedProsthetics[slot] = itemId } return [id, { ...w, prostheticInventory: [], equippedProsthetics }] })) }
    if (version < 16) old = { ...initial, ...old, actionPhaseUsed: null, actionDay: old.day ?? 1, actionCounts: {}, workers: Object.fromEntries(Object.entries(old.workers ?? {}).map(([id, w]) => [id, { ...w, routine: { ...defaultRoutine, ...w.routine }, diet: w.contract === 'foodOnly' && (w.diet?.bread ?? 0) === 4 && humanFoods.every(food => food === 'bread' || !w.diet?.[food]) ? { ...w.diet, bread: 9 } : w.diet }])) }
    if (version < 17) old = { ...initial, ...old, partStock: { ...initial.partStock }, drones: 0, storeListings: [], trainingPlans: {}, assignments: Object.fromEntries(Object.entries(old.assignments ?? {}).map(([id, job]) => [id, (job as string) === 'maintenance' ? 'rest' : job])) as Record<string, Job>, workers: Object.fromEntries(Object.entries(old.workers ?? {}).map(([id, w]) => [id, { ...w, training: { speed: 0, strength: 0, combat: 0 } }])) }
    if (version < 18) old = { ...initial, ...old, workers: Object.fromEntries(Object.entries(old.workers ?? {}).map(([id, w]) => [id, { ...w, sexCounts: { conventional: 0, oral: 0, anal: 0 } }])) }
    if (version < 19) old = { ...initial, ...old, officeStock: Object.fromEntries(officeGoods.map(id => [id, 0])) as Record<OfficeGood, number>, officePlaced: Object.fromEntries(officeGoods.map(id => [id, 0])) as Record<OfficeGood, number> }
    if (version < 20) old = { ...initial, ...old, bedroomPlaced: { ...initial.bedroomPlaced }, officeCagedNpcId: null }
    if (version < 21) {
      const enterprises = new Set(old.enterprises ?? ['farm'])
      if (enterprises.delete('depot')) enterprises.add('droneAssembly')
      if (enterprises.delete('plant')) enterprises.add('trainingCamp')
      old = { ...old, enterprises: [...enterprises], enterpriseNames: { ...old.enterpriseNames, ...(enterprises.has('droneAssembly') && !old.enterpriseNames?.droneAssembly ? { droneAssembly: 'Збірка дронів' } : {}), ...(enterprises.has('trainingCamp') && !old.enterpriseNames?.trainingCamp ? { trainingCamp: 'Тренувальний табір' } : {}) } }
    }
    if (version < 22) old = { ...old, pendingRequest: null }
    if (version < 23) old = { ...old, prologueSeen: false }
    if (version < 24) old = { ...old, pendingContractNotices: [], arrivalNotices: [] }
    if (version < 25) old = { ...old, bedroomPlaced: { ...initial.bedroomPlaced, ...(old.bedroomPlaced ?? {}) }, workers: Object.fromEntries(Object.entries(old.workers ?? {}).map(([id, w]) => [id, { ...w, clothing: 'clothed', analItem: null, handcuffed: false, intimacyInjury: { oral: 0, anal: 0, vaginal: 0 } }])) }
    if (version < 26) old = { ...old, barracks: 0, playerName: 'Альфа' }
    if (version < 27) old = { ...old, reportPending: false }
    if (version < 28) old = { ...old, livestock: { cattle: 0, pigs: 0, chickens: 0 }, feedStock: { chickens: Math.max(0, old.feedDays ?? 0), pigs: 0, cattle: 0 }, feedDays: 0 }
    if (version < 29) {
      const allowed = new Set(candidates.map(candidate => candidate.id))
      old = { ...old,
        hired: (old.hired ?? []).filter(id => allowed.has(id)),
        workers: Object.fromEntries(Object.entries(old.workers ?? {}).filter(([id]) => allowed.has(id)).map(([id, worker]) => [id, { ...worker, bimbofication: 0 }])),
        assignments: Object.fromEntries(Object.entries(old.assignments ?? {}).filter(([id]) => allowed.has(id))),
        vetDoctorId: old.vetDoctorId && allowed.has(old.vetDoctorId) ? old.vetDoctorId : null,
        pendingRequest: old.pendingRequest && allowed.has(old.pendingRequest.workerId) ? old.pendingRequest : null,
        pendingContractNotices: (old.pendingContractNotices ?? []).filter(id => allowed.has(id)),
        arrivalNotices: (old.arrivalNotices ?? []).filter(id => allowed.has(id)),
        journal: (old.journal ?? []).filter(event => allowed.has(event.workerId)),
        activeEvent: old.activeEvent && allowed.has(old.activeEvent.workerId) ? old.activeEvent : null,
        lastReport: old.lastReport ? { ...old.lastReport, workers: old.lastReport.workers.filter(row => allowed.has(row.id)) } : null,
        officeCagedNpcId: old.officeCagedNpcId && allowed.has(old.officeCagedNpcId) ? old.officeCagedNpcId : null,
      }
    }
    if (version < 30) old = { ...old, workers: Object.fromEntries(Object.entries(old.workers ?? {}).map(([id, worker]) => {
      const { guilt: _guilt, defiance: _defiance, loyalty: _loyalty, respect: _respect, fear: _fear, friendship: _friendship, ...current } = worker as Worker & Record<string, unknown>
      void _guilt; void _defiance; void _loyalty; void _respect; void _fear; void _friendship
      return [id, current]
    })) }
    if (version < 31 && (old.day ?? 1) <= 7 && (old.totalSales ?? 0) === 0 && (old.money ?? 0) < 200) old = { ...old, money: startingCapital }
    return old as GameState
  },
  partialize: s => ({ lang: s.lang, prologueSeen: s.prologueSeen, playerName: s.playerName, day: s.day, phase: s.phase, output: s.output, wellbeing: s.wellbeing, reputation: s.reputation,
    money: s.money, food: s.food, feedDays: s.feedDays, feedStock: s.feedStock, livestock: s.livestock, staffCapacity: s.staffCapacity, cages: s.cages, barracks: s.barracks, huts: s.huts, vodka: s.vodka, enterprises: s.enterprises, enterpriseNames: s.enterpriseNames, prostheticStock: s.prostheticStock, partStock: s.partStock, drones: s.drones, storeListings: s.storeListings, trainingPlans: s.trainingPlans, officeStock: s.officeStock, officePlaced: s.officePlaced, bedroomPlaced: s.bedroomPlaced, officeCagedNpcId: s.officeCagedNpcId, stocks: s.stocks, provenance: s.provenance, listings: s.listings, totalSales: s.totalSales, vetBuilt: s.vetBuilt, vetDoctorId: s.vetDoctorId, lastReport: s.lastReport, reportPending: s.reportPending, journal: s.journal, activeEvent: s.activeEvent, pendingRequest: s.pendingRequest, pendingContractNotices: s.pendingContractNotices, arrivalNotices: s.arrivalNotices, hired: s.hired, workers: s.workers, assignments: s.assignments, message: s.message, actionPhaseUsed: s.actionPhaseUsed, actionDay: s.actionDay, actionCounts: s.actionCounts })
}))

useGame.subscribe(state => {
  const locked = Object.entries(state.workers).filter(([, worker]) => bimboLocked(worker) && (worker.trust !== 100 || worker.love !== 100 || worker.submission !== 100))
  if (!locked.length) return
  const workers = { ...state.workers }
  for (const [id, worker] of locked) workers[id] = { ...worker, bimbofication: 10, trust: 100, love: 100, submission: 100 }
  useGame.setState({ workers })
})
