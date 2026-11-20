import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BodyMeasurements, Job, Lang, Phase } from '../types'
import { applyProcedureMeasurements, updateBodyForDay } from '../mechanics/workerBody'
import { resolveDay } from '../mechanics/economy'
import { canHire } from '../mechanics/hiring'
import { phaseMessage } from '../mechanics/events'
import { candidates } from '../data/candidates'
import { farmGoods, humanFoods, purchasePrices, salePrices, type FarmGood, type FoodStocks, type HumanFood } from '../data/goods'
import { conditionEffects, productionForWorker, riskForWorker } from '../mechanics/farmProduction'
import { interactionRequirement, type InteractionAction } from '../mechanics/interactions'
import { canAskConsent, canCallBedroom, canChooseIntimacy, canPunishInBedroom, type BedroomAction } from '../mechanics/bedroom'
import { personalFor } from '../data/npcPersonal'
import procedures from '../data/medical/procedures.json'
import { canReceiveProcedure, resolveOperationOutcome } from '../mechanics/medicalOperations'

export type Housing = 'cage' | 'hut'
export type Contract = 'paid' | 'foodOnly'
export type ContractTerm = 30 | 90 | 'lifetime'
export type ShopItem = 'bread' | 'lard' | 'grain' | 'vodka'
export const shopPrices: Record<ShopItem, number> = purchasePrices
export interface SaleListing { good: FarmGood; quantity: number; price: number; listedDay: number; contributors: Record<string, number> }
export interface WorkerDayReport { id: string; healthBefore: number; healthAfter: number; paid: number; eaten: number; reasons: string[] }
export interface DayReport { day: number; sales: number; produced: number; workers: WorkerDayReport[] }
export interface GameEvent { id: number; day: number; phase: Phase; workerId: string; action: string; storyKey: string; changes: Record<string, number>; detail?: string }
export type Provenance = Record<FarmGood, Record<string, number>>
export interface Worker {
  nickname: string
  hiredOnDay: number
  contractTerm: ContractTerm
  contractEndsDay: number | null
  lastDayOnSite?: number
  active: boolean
  totalEarnedForPlayer: number
  totalReceivedFromPlayer: number
  body: BodyMeasurements
  diet: Record<HumanFood, number>
  contract: Contract
  ration: number
  wage: number
  agreedWage: number
  wageDebt: number
  housing: Housing
  savings: number
  modificationConsentAtSigning: boolean
  modificationDecision?: { procedureId: string; accepted: boolean; day: number }
  health: number
  alive: boolean
  injuredUntilDay?: number
  trust: number
  respect: number; fear: number; friendship: number; love: number; debauchery: number; submission: number
  intimacyConsentDay?: number
  traits: string[]
  operations: { id: string; day: number; outcome?: 'success' | 'complication' | 'disability' | 'death' }[]
  disabled?: boolean
  medicalEffects?: { lactation: boolean; oviposition: boolean; hair: 'normal' | 'growth' | 'loss' }
  workDays: { production: number; maintenance: number }
}
type Livestock = { cattle: number; sheep: number; chickens: number }
interface GameState {
  lang: Lang; day: number; phase: Phase; output: number; wellbeing: number; reputation: number
  money: number; food: number; feedDays: number; livestock: Livestock; staffCapacity: number; cages: number; huts: number; vodka: number; enterprises: string[]; enterpriseNames: Record<string,string>
  stocks: FoodStocks; provenance: Provenance; listings: SaleListing[]; totalSales: number; vetBuilt: boolean; vetDoctorId: string | null
  lastReport: DayReport | null
  journal: GameEvent[]; activeEvent: GameEvent | null
  hired: string[]; workers: Record<string, Worker>; assignments: Record<string, Job>; message: string
  toggleLang: () => void; hire: (id: string, contract?: Contract, term?: ContractTerm) => void; assign: (id: string, job: Job) => void
  setNickname: (id: string, nickname: string) => void
  setRation: (id: string, amount: number) => void; setWage: (id: string, amount: number) => void
  setFoodPlan: (id: string, food: HumanFood, amount: number) => void
  setContract: (id: string, contract: Contract) => void
  interact: (id: string, action: InteractionAction) => void; dismissEvent: () => void
  bedroomAction: (id: string, action: BedroomAction) => void
  setHousing: (id: string, housing: Housing) => void; reward: (id: string, amount: number) => void
  fine: (id: string, amount: number, reason: string) => void
  proposeModification: (id: string, procedureId: string) => void; performOperation: (id: string, procedureId: string) => void
  expandHousing: () => void; buildCage: () => void; buildHut: () => void; createEnterprise: (id: string, name: string) => void
  purchase: (items: Partial<Record<ShopItem, number>>) => void; sleep: () => void; advance: () => void; reset: () => void
  listForSale: (good: FarmGood, quantity: number) => void; buildVet: () => void; appointVet: (id: string) => void
}
const order: Phase[] = ['morning', 'day', 'evening', 'night']
const initial = {
  lang: 'uk' as Lang, day: 1, phase: 'morning' as Phase, output: 0, wellbeing: 76, reputation: 58,
  money: 120, food: 18, feedDays: 8, livestock: { cattle: 18, sheep: 26, chickens: 120 }, staffCapacity: 1, cages: 1, huts: 0, vodka: 0, enterprises: ['farm'], enterpriseNames: { farm: 'Ферма' },
  stocks: { bread: 18, lard: 0, meat: 0, milk: 0, cheese: 0, eggs: 0 }, provenance: { meat: {}, milk: {}, cheese: {}, eggs: {} } as Provenance, listings: [] as SaleListing[], totalSales: 0, vetBuilt: false, vetDoctorId: null as string | null, lastReport: null as DayReport | null, journal: [] as GameEvent[], activeEvent: null as GameEvent | null,
  hired: [] as string[], workers: {} as Record<string, Worker>, assignments: {} as Record<string, Job>, message: 'msgStart'
}
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
const eventUpdate = (s: GameState, id: string, action: string, before: Worker, after: Worker, money = s.money, reputation = s.reputation, detail?: string) => {
  const changes: Record<string, number> = {}
  for (const key of ['health', 'trust', 'respect', 'fear', 'friendship', 'love', 'debauchery', 'submission', 'savings'] as const) if (after[key] !== before[key]) changes[key] = after[key] - before[key]
  if (money !== s.money) changes.money = money - s.money
  if (reputation !== s.reputation) changes.reputation = reputation - s.reputation
  const event: GameEvent = { id: (s.journal.at(-1)?.id ?? 0) + 1, day: s.day, phase: s.phase, workerId: id, action, storyKey: `story_${action}`, changes, detail }
  return { journal: [...s.journal, event], activeEvent: event }
}
const defaultWorker = (id: string, contract: Contract = 'paid', day = 1, term: ContractTerm = 30): Worker => ({ nickname: '', hiredOnDay: day, contractTerm: term, contractEndsDay: term === 'lifetime' ? null : day + term - 1, active: true, totalEarnedForPlayer: 0, totalReceivedFromPlayer: 0, body: { ...(candidates.find(c => c.id === id)?.body ?? { heightCm: 170, weightKg: 65, chestCm: 90, waistCm: 75, hipsCm: 95 }) }, diet: { bread: contract === 'paid' ? 0 : 4, lard: 0, meat: 0, milk: 0, cheese: 0, eggs: 0 }, contract, ration: contract === 'paid' ? 0 : 4, wage: contract === 'paid' ? 12 : 0, agreedWage: contract === 'paid' ? 12 : 0, wageDebt: 0, housing: 'cage', savings: 0, modificationConsentAtSigning: personalFor(id)?.modificationConsentAtSigning ?? false, health: 76, alive: true, trust: 25, respect: 25, fear: 10, friendship: 10, love: 0, debauchery: 20, submission: 5, traits: candidates.find(c => c.id === id)?.traits ?? [], operations: [], workDays: { production: 0, maintenance: 0 } })
const occupied = (workers: Record<string, Worker>, housing: Housing, except?: string) => Object.entries(workers).filter(([id, w]) => id !== except && w.alive && w.active && w.housing === housing).length
const takeProvenance = (source: Record<string, number>, amount: number) => {
  const remaining = { ...source }, contributors: Record<string, number> = {}
  let count = amount
  for (const id of Object.keys(remaining)) { const taken = Math.min(count, remaining[id]); remaining[id] -= taken; if (taken) contributors[id] = taken; count -= taken; if (!count) break }
  return { remaining, contributors }
}

export const useGame = create<GameState>()(persist((set, get) => ({ ...initial,
  toggleLang: () => set(s => ({ lang: s.lang === 'uk' ? 'ru' : s.lang === 'ru' ? 'en' : 'uk' })),
  hire: (id, contract = 'paid', term = 30) => set(s => {
    const livingIds = s.hired.filter(workerId => s.workers[workerId]?.alive && s.workers[workerId]?.active)
    if (s.hired.includes(id) || !canHire(livingIds, id, s.staffCapacity) || !candidates.some(c => c.id === id && c.availableFromDay <= s.day)) return {}
    const housing: Housing = occupied(s.workers, 'hut') < s.huts * 2 ? 'hut' : 'cage'
    if (occupied(s.workers, housing) >= (housing === 'hut' ? s.huts * 2 : s.cages)) return {}
    return { hired: [...s.hired, id], workers: { ...s.workers, [id]: { ...defaultWorker(id, contract, s.day, term), housing } }, assignments: { ...s.assignments, [id]: 'rest' }, message: 'msgHired' }
  }),
  setNickname: (id, nickname) => set(s => {
    if (!s.workers[id]) return {}
    const value = nickname.slice(0, 24)
    if (value.trim() && Object.entries(s.workers).some(([otherId, worker]) => otherId !== id && worker.nickname.trim().toLocaleLowerCase() === value.trim().toLocaleLowerCase())) return {}
    return { workers: { ...s.workers, [id]: { ...s.workers[id], nickname: value } } }
  }),
  assign: (id, job) => set(s => s.phase === 'morning' && s.workers[id]?.alive && s.workers[id]?.active && (s.workers[id].injuredUntilDay ?? 0) <= s.day ? { assignments: { ...s.assignments, [id]: job } } : {}),
  setRation: (id, amount) => set(s => s.workers[id]?.alive && s.workers[id]?.active ? { workers: { ...s.workers, [id]: { ...s.workers[id], ration: clamp(Math.round(amount), 0, 5), diet: { ...s.workers[id].diet, bread: clamp(Math.round(amount), 0, 5), lard: 0, meat: 0, milk: 0, cheese: 0, eggs: 0 } } } } : {}),
  setFoodPlan: (id, food, amount) => set(s => {
    const worker = s.workers[id]; if (!worker?.alive || !worker.active || worker.contract !== 'foodOnly' || !humanFoods.includes(food)) return {}
    const diet = { ...worker.diet, [food]: clamp(Math.round(amount), 0, 5) }
    const total = humanFoods.reduce((sum, key) => sum + diet[key], 0)
    if (total > 5) return {}
    return { workers: { ...s.workers, [id]: { ...worker, diet, ration: total } } }
  }),
  setContract: (id, contract) => set(s => {
    const w = s.workers[id]; if (!w?.alive || !w.active || w.contract === contract) return {}
    const diet = { ...w.diet, bread: contract === 'foodOnly' ? 4 : 0, lard: 0, meat: 0, milk: 0, cheese: 0, eggs: 0 }
    return { workers: { ...s.workers, [id]: { ...w, contract, diet, ration: contract === 'foodOnly' ? 4 : 0, wage: contract === 'paid' ? 12 : 0, agreedWage: contract === 'paid' ? 12 : 0 } } }
  }),
  interact: (id, action) => set(s => {
    const w = s.workers[id]; if (!w?.alive || !w.active) return {}
    if (interactionRequirement(w, action, s.money, s.stocks.bread)) return {}
    const next = { ...w }, changes: Partial<GameState> = {}
    const add = (key: 'health' | 'respect' | 'fear' | 'friendship' | 'love' | 'debauchery' | 'submission', n: number) => { next[key] = clamp(next[key] + n, 0, 100) }
    switch (action) {
      case 'bonus': next.savings += 5; next.totalReceivedFromPlayer += 5; add('respect', 2); changes.money = s.money - 5; break
      case 'dayOff': add('respect', 3); changes.assignments = { ...s.assignments, [id]: 'rest' }; break
      case 'extraFood': add('health', 2); add('friendship', 2); changes.stocks = { ...s.stocks, bread: s.stocks.bread - 1 }; break
      case 'fine': next.savings--; add('respect', -5); add('fear', 6); add('submission', 2); changes.reputation = clamp(s.reputation - 2, 0, 100); break
      case 'hit': add('health', -15); add('fear', 20); add('submission', 5); add('respect', -20); add('friendship', -20); add('love', -30); changes.reputation = clamp(s.reputation - 25, 0, 100); break
      case 'dismiss': next.active = false; next.lastDayOnSite = s.day; changes.assignments = { ...s.assignments, [id]: 'rest' }; break
      case 'standOrder': add('fear', 2); add('submission', 5); add('respect', -2); break
      case 'forceDance': add('fear', 4); add('submission', 7); add('friendship', -4); add('respect', -2); changes.reputation = clamp(s.reputation - 3, 0, 100); break
      case 'forceApology': add('fear', 3); add('submission', 5); add('respect', -6); break
      case 'joke': add('friendship', 2); add('debauchery', 1); break
      case 'adultJoke': add('friendship', 3); add('debauchery', 3); break
      case 'flirt': add('friendship', 2); add('love', 3); add('debauchery', 2); break
      case 'romanceTalk': add('friendship', 2); add('love', 4); break
      case 'walk': add('friendship', 4); add('love', 1); break
      case 'hug': add('friendship', 3); add('love', 2); break
      case 'kiss': add('love', 3); break
      case 'sex': break
    }
    changes.workers = { ...s.workers, [id]: next }
    return { ...changes, ...eventUpdate(s, id, action, w, next, changes.money, changes.reputation) }
  }),
  bedroomAction: (id, action) => set(s => {
    const w = s.workers[id], age = candidates.find(c => c.id === id)?.age ?? 0
    if (!w || !canCallBedroom(w)) return {}
    const intimate = action === 'gentleIntimacy' || action === 'passionateIntimacy' || action === 'privateNight'
    if (action === 'askConsent' && (!canAskConsent(w, age) || w.intimacyConsentDay === s.day)) return {}
    if (intimate && !canChooseIntimacy(w, age, s.day)) return {}
    if ((action === 'reprimand' || action === 'extraDuty') && !canPunishInBedroom(w)) return {}
    const next = { ...w }, changes: Partial<GameState> = {}
    const add = (key: 'trust' | 'respect' | 'fear' | 'friendship' | 'love' | 'submission', n: number) => { next[key] = clamp(next[key] + n, 0, 100) }
    switch (action) {
      case 'askConsent': next.intimacyConsentDay = s.day; break
      case 'gentleIntimacy': add('love', 2); add('friendship', 1); next.intimacyConsentDay = undefined; break
      case 'passionateIntimacy': add('love', 3); add('trust', 1); next.intimacyConsentDay = undefined; break
      case 'privateNight': add('love', 4); add('friendship', 2); next.intimacyConsentDay = undefined; break
      case 'reprimand': add('fear', 3); add('submission', 2); add('respect', -4); add('trust', -2); changes.reputation = clamp(s.reputation - 1, 0, 100); break
      case 'extraDuty': add('fear', 4); add('submission', 3); add('respect', -5); changes.assignments = { ...s.assignments, [id]: 'production' }; changes.reputation = clamp(s.reputation - 2, 0, 100); break
    }
    changes.workers = { ...s.workers, [id]: next }
    return { ...changes, ...eventUpdate(s, id, action, w, next, changes.money, changes.reputation) }
  }),
  dismissEvent: () => set({ activeEvent: null }),
  setWage: (id, amount) => set(s => s.workers[id]?.alive && s.workers[id]?.active && s.workers[id].contract === 'paid' ? { workers: { ...s.workers, [id]: { ...s.workers[id], wage: clamp(Math.round(amount), 0, 30) } } } : {}),
  setHousing: (id, housing) => set(s => {
    const w = s.workers[id]
    if (!w?.alive || !w.active || w.housing === housing || occupied(s.workers, housing, id) >= (housing === 'cage' ? s.cages : s.huts * 2)) return {}
    const next = { ...w, housing, trust: clamp(w.trust + (housing === 'hut' ? 5 : -8), 0, 100), respect: clamp(w.respect + (housing === 'hut' ? 5 : -8), 0, 100), friendship: clamp(w.friendship + (housing === 'hut' ? 3 : -3), 0, 100), fear: clamp(w.fear + (housing === 'hut' ? -2 : 5), 0, 100) }
    return { workers: { ...s.workers, [id]: next }, ...eventUpdate(s, id, housing === 'hut' ? 'moveToHut' : 'moveToCage', w, next) }
  }),
  reward: (id, amount) => set(s => s.workers[id]?.alive && s.workers[id]?.active && amount > 0 && amount <= 10 && s.money >= amount ? { money: s.money - amount, workers: { ...s.workers, [id]: { ...s.workers[id], savings: s.workers[id].savings + amount, totalReceivedFromPlayer: s.workers[id].totalReceivedFromPlayer + amount, trust: clamp(s.workers[id].trust + 2, 0, 100) } } } : {}),
  fine: (id, amount, reason) => set(s => {
    const w = s.workers[id]; if (!w?.alive || !w.active || w.contract !== 'paid' || reason.trim().length < 8 || amount < 1 || amount > Math.floor(w.wage * .2) || w.savings < amount) return {}
    return { workers: { ...s.workers, [id]: { ...w, savings: w.savings - amount, trust: clamp(w.trust - 8, 0, 100) } }, reputation: clamp(s.reputation - 2, 0, 100), message: 'msgFine' }
  }),
  proposeModification: (id, procedureId) => set(s => {
    const w = s.workers[id], procedure = procedures.find(p => p.id === procedureId)
    if (!w || !procedure || !canReceiveProcedure(id, w, procedure, s.day) || !s.vetBuilt || !s.vetDoctorId || !s.workers[s.vetDoctorId]?.alive || !s.workers[s.vetDoctorId]?.active) return {}
    const accepted = w.modificationConsentAtSigning || (w.love >= 70 && w.fear < 35) || (w.debauchery >= 70 && w.trust >= 55 && w.fear < 35)
    const pressured = !accepted && w.fear >= 70
    const next: Worker = { ...w, modificationDecision: { procedureId, accepted, day: s.day }, trust: pressured ? clamp(w.trust - 8, 0, 100) : w.trust }
    const reputation = pressured ? clamp(s.reputation - 5, 0, 100) : s.reputation
    const action = accepted ? 'procedureAccepted' : pressured ? 'procedurePressure' : 'procedureRefused'
    return { workers: { ...s.workers, [id]: next }, reputation, ...eventUpdate(s, id, action, w, next, s.money, reputation, procedureId) }
  }),
  performOperation: (id, procedureId) => set(s => {
    const w = s.workers[id], procedure = procedures.find(p => p.id === procedureId)
    if (!w || !procedure || !canReceiveProcedure(id, w, procedure, s.day) || !s.vetBuilt || !s.vetDoctorId || !s.workers[s.vetDoctorId]?.alive || !s.workers[s.vetDoctorId]?.active || w.modificationDecision?.procedureId !== procedureId || !w.modificationDecision.accepted || w.savings < procedure.costCredits) return {}
    const outcome = resolveOperationOutcome(procedure, Math.random())
    const trait = procedureId === 'functional_prosthesis' ? 'strong_legs' : procedureId === 'powered_arm' ? 'strong_arms' : null
    const success = outcome === 'success', fatal = outcome === 'death', disabled = outcome === 'disability'
    const effect = procedure.effect as unknown as Record<string, number>
    const bodyDelta = success ? { weightKg: effect.weightKg ?? 0, chestCm: effect.chestCm ?? 0 } : {}
    const next: Worker = { ...w, savings: w.savings - procedure.costCredits, operations: [...w.operations, { id: procedureId, day: s.day, outcome }], traits: success && trait && !w.traits.includes(trait) ? [...w.traits, trait] : w.traits, body: applyProcedureMeasurements(w.body, bodyDelta), medicalEffects: success ? { lactation: (w.medicalEffects?.lactation ?? false) || procedureId === 'lactation_hormones', oviposition: (w.medicalEffects?.oviposition ?? false) || procedureId === 'oviposition_uterus', hair: procedureId === 'hair_growth_hormones' ? 'growth' : procedureId === 'hair_loss_hormones' ? 'loss' : w.medicalEffects?.hair ?? 'normal' } : w.medicalEffects, disabled: w.disabled || disabled, alive: !fatal, active: !fatal && w.active, lastDayOnSite: fatal ? s.day : w.lastDayOnSite, injuredUntilDay: fatal ? undefined : s.day + procedure.recoveryDays + (outcome === 'complication' ? 5 : disabled ? 14 : 0), health: fatal ? 0 : disabled ? Math.min(w.health, 20) : clamp(w.health - (outcome === 'complication' ? 15 : 3), 0, 100), modificationDecision: undefined }
    const reputation = clamp(s.reputation - (fatal ? 15 : disabled ? 8 : outcome === 'complication' ? 2 : 0), 0, 100)
    const action = fatal ? 'operationFatal' : disabled ? 'operationDisability' : outcome === 'complication' ? 'operationComplication' : 'operationComplete'
    return { workers: { ...s.workers, [id]: next }, assignments: { ...s.assignments, [id]: 'rest' }, reputation, ...eventUpdate(s, id, action, w, next, s.money, reputation, procedureId) }
  }),
  expandHousing: () => get().buildHut(),
  buildCage: () => set(s => s.cages < 5 && s.money >= 90 ? { cages: s.cages + 1, staffCapacity: s.staffCapacity + 1, money: s.money - 90, message: 'msgHousingExpanded' } : {}),
  buildHut: () => set(s => s.money >= 180 ? { huts: s.huts + 1, staffCapacity: s.staffCapacity + 2, money: s.money - 180, message: 'msgHousingExpanded' } : {}),
  createEnterprise: (id, name) => set(s => {
    const cost = id === 'depot' ? 500 : id === 'plant' ? 950 : Infinity
    const cleanName = name.trim().slice(0, 32)
    return s.money >= cost && !s.enterprises.includes(id) && cleanName.length >= 3 ? { money: s.money - cost, enterprises: [...s.enterprises, id], enterpriseNames: { ...s.enterpriseNames, [id]: cleanName } } : {}
  }),
  purchase: items => set(s => {
    const quantities = Object.fromEntries((Object.keys(shopPrices) as ShopItem[]).map(id => [id, Math.max(0, Math.min(99, Math.floor(items[id] ?? 0)))])) as Record<ShopItem, number>
    const total = (Object.keys(shopPrices) as ShopItem[]).reduce((sum, id) => sum + quantities[id] * shopPrices[id], 0)
    if (!total || total > s.money) return {}
    const stocks = { ...s.stocks, bread: s.stocks.bread + quantities.bread * 3, lard: s.stocks.lard + quantities.lard * 2 }
    return { money: s.money - total, food: stocks.bread + stocks.lard, stocks, feedDays: s.feedDays + quantities.grain * 5, vodka: s.vodka + quantities.vodka, message: 'msgOrder' }
  }),
  listForSale: (good, quantity) => set(s => {
    const count = Math.floor(quantity)
    if (!farmGoods.includes(good) || count < 1 || count > s.stocks[good]) return {}
    const { remaining, contributors } = takeProvenance(s.provenance[good], count)
    return { stocks: { ...s.stocks, [good]: s.stocks[good] - count }, provenance: { ...s.provenance, [good]: remaining }, listings: [...s.listings, { good, quantity: count, price: salePrices[good], listedDay: s.day, contributors }], message: 'msgListed' }
  }),
  buildVet: () => set(s => !s.vetBuilt && s.money >= 200 ? { money: s.money - 200, vetBuilt: true, message: 'msgVetBuilt' } : {}),
  appointVet: id => set(s => s.vetBuilt && candidates.find(c => c.id === id)?.role.en === 'Medic' && s.workers[id]?.alive && s.workers[id]?.active ? { vetDoctorId: id, assignments: { ...s.assignments, [id]: 'rest' }, message: 'msgVetAppointed' } : {}),
  sleep: () => { const startDay = get().day; while (get().day === startDay) get().advance() },
  advance: () => {
    const s = get(), next = order[(order.indexOf(s.phase) + 1) % 4]
    if (s.phase !== 'night') { set({ phase: next, message: phaseMessage[next] }); return }
    const living = Object.fromEntries(Object.entries(s.assignments).filter(([id]) => s.workers[id]?.alive && s.workers[id]?.active && id !== s.vetDoctorId).map(([id, job]) => [id, (s.workers[id].injuredUntilDay ?? 0) > s.day ? 'rest' : job])) as Record<string, Job>
    const result = resolveDay(living, s.wellbeing, s.reputation)
    let money = s.money, reputation = result.reputation
    const stocks = { ...s.stocks }
    const provenance: Provenance = { meat: { ...s.provenance.meat }, milk: { ...s.provenance.milk }, cheese: { ...s.provenance.cheese }, eggs: { ...s.provenance.eggs } }
    let producedUnits = 0, wellbeingBonus = 0
    const workers = { ...s.workers }
    const assignments = { ...s.assignments }
    let anyInjury = false, anyFatality = false
    const dayWorkers: WorkerDayReport[] = []
    const productionCount = Object.values(living).filter(job => job === 'production').length
    const teamHasProtector = s.hired.some(id => s.workers[id]?.active && s.workers[id]?.traits.includes('protective'))
    for (const id of s.hired) {
      const worker = workers[id]; if (!worker?.alive || !worker.active) continue
      let eaten = 0
      if (worker.contract === 'foodOnly') for (const food of humanFoods) { const amount = Math.min(worker.diet[food], stocks[food]); stocks[food] -= amount; eaten += amount; if (farmGoods.includes(food as FarmGood)) provenance[food as FarmGood] = takeProvenance(provenance[food as FarmGood], amount).remaining }
      const paid = worker.contract === 'paid' ? Math.min(worker.wage, money) : 0; money -= paid
      const fed = worker.contract === 'paid' ? paid >= 12 : eaten >= 3
      const healthChange = worker.contract === 'paid' ? (paid < 6 ? -10 : paid < 12 ? -4 : 0) : eaten < 2 ? -10 : eaten === 2 ? -4 : eaten >= 4 ? 2 : 0
      const traits = conditionEffects(worker, fed, worker.contract === 'paid' && paid < worker.agreedWage, living[id])
      wellbeingBonus += traits.wellbeing
      const workChange = (living[id] === 'production' ? -5 : living[id] === 'rest' ? 5 : 0) + (worker.housing === 'cage' ? -6 : 2) + traits.health
      const vetWorking = !!(s.vetBuilt && s.vetDoctorId && s.workers[s.vetDoctorId]?.alive && s.workers[s.vetDoctorId]?.active)
      const risk = riskForWorker(worker, teamHasProtector, productionCount) * (vetWorking ? .9 : 1)
      const incidentRoll = living[id] === 'production' ? Math.random() : 1
      const fatal = incidentRoll < .001
      const injured = !fatal && incidentRoll < risk
      const health = clamp(worker.health + healthChange + workChange - (injured ? 12 : 0), 0, 100)
      const wageShortfall = worker.contract === 'paid' ? Math.max(0, worker.agreedWage - paid) : 0
      if (living[id] === 'production' && s.feedDays > 0) {
        const produced = productionForWorker(worker, productionCount)
        for (const good of farmGoods) { stocks[good] += produced[good]; provenance[good][id] = (provenance[good][id] ?? 0) + produced[good]; producedUnits += produced[good] }
      }
      const workDays = { ...worker.workDays }
      if (living[id] === 'production' || living[id] === 'maintenance') workDays[living[id]]++
      const gained = workDays.maintenance >= 10 && !worker.traits.includes('skilled_mechanic') ? ['skilled_mechanic'] : []
      const baseline = candidates.find(c => c.id === id)?.body ?? worker.body
      workers[id] = { ...worker, workDays, traits: [...worker.traits, ...gained], body: updateBodyForDay(worker.body, baseline, worker.contract === 'paid' ? (fed ? 3 : 1) : eaten, worker.housing), savings: worker.savings + paid, totalReceivedFromPlayer: worker.totalReceivedFromPlayer + paid, wageDebt: worker.wageDebt + wageShortfall, trust: clamp(worker.trust - (wageShortfall ? 4 : 0) + (worker.housing === 'cage' ? -3 : 1) + traits.trust, 0, 100), respect: clamp(worker.respect + (worker.housing === 'hut' ? 1 : -2), 0, 100), fear: clamp(worker.fear + (worker.housing === 'cage' ? 1 : -1), 0, 100), health, alive: !fatal, active: !fatal && (worker.contractEndsDay === null || s.day < worker.contractEndsDay), lastDayOnSite: fatal || worker.contractEndsDay === s.day ? s.day : worker.lastDayOnSite, injuredUntilDay: injured ? s.day + 2 : worker.injuredUntilDay }
      const reasons = [worker.housing === 'cage' ? 'reportCage' : 'reportHut', living[id] === 'production' ? 'reportWork' : living[id] === 'rest' ? 'reportRest' : 'reportMaintenance']
      if (worker.contract === 'foodOnly') reasons.push(eaten < 3 ? 'reportHungry' : 'reportFed')
      else reasons.push(paid < worker.agreedWage ? 'reportUnderpaid' : 'reportPaid')
      if (injured) reasons.push('reportInjury')
      if (fatal) reasons.push('reportFatality')
      dayWorkers.push({ id, healthBefore: worker.health, healthAfter: health, paid, eaten, reasons })
      if (!workers[id].active) assignments[id] = 'rest'
      if (fatal) { anyFatality = true; reputation = clamp(reputation - 15, 0, 100); assignments[id] = 'rest' }
      if (injured) { anyInjury = true; reputation = clamp(reputation - 3, 0, 100); assignments[id] = 'rest' }
      if ((worker.contract === 'foodOnly' && eaten < 2) || wageShortfall > 0) reputation = clamp(reputation - 5, 0, 100)
    }
    const saleIncome = s.listings.reduce((sum, listing) => sum + listing.quantity * listing.price, 0)
    for (const listing of s.listings) for (const [id, quantity] of Object.entries(listing.contributors)) if (workers[id]) workers[id] = { ...workers[id], totalEarnedForPlayer: workers[id].totalEarnedForPlayer + quantity * listing.price }
    set({ day: s.day + 1, phase: next, output: s.output + producedUnits, wellbeing: clamp(result.wellbeing + wellbeingBonus + (s.vetBuilt && s.vetDoctorId && workers[s.vetDoctorId]?.active ? 1 : 0) - Object.values(workers).filter(w => w.alive && w.active && w.housing === 'cage').length * 3, 0, 100), reputation,
      food: stocks.bread + stocks.lard, stocks, provenance, listings: [], totalSales: s.totalSales + saleIncome, lastReport: { day: s.day, sales: saleIncome, produced: producedUnits, workers: dayWorkers },
      money: money + saleIncome + (s.enterprises.includes('depot') ? 18 : 0) + (s.enterprises.includes('plant') ? 36 : 0), feedDays: Math.max(0, s.feedDays - 1), workers, assignments,
      message: anyFatality ? 'msgFatality' : anyInjury ? 'msgInjury' : 'msgReport' })
  },
  reset: () => set(initial)
}), {
  name: 'reclaim-save-v1', version: 13,
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
    if (version < 7) old = { ...initial, ...old, provenance: { meat: {}, milk: {}, cheese: {}, eggs: {} }, listings: [] }
    if (version < 8) old = { ...initial, ...old, enterpriseNames: { farm: 'Ферма', ...(old.enterpriseNames ?? {}), ...(old.enterprises?.includes('depot') ? { depot: 'Ремонтне депо' } : {}), ...(old.enterprises?.includes('plant') ? { plant: 'Відновлювальний завод' } : {}) } }
    if (version < 9) old = { ...initial, ...old, lastReport: null, workers: Object.fromEntries(Object.entries(old.workers ?? {}).map(([id, w]) => [id, { ...w, respect: w.trust ?? 25, fear: 10, friendship: 10, love: 0, diet: w.contract === 'paid' ? { bread: 0, lard: 0, meat: 0, milk: 0, cheese: 0, eggs: 0 } : w.diet, ration: w.contract === 'paid' ? 0 : w.ration }])) }
    if (version < 10) old = { ...initial, ...old, journal: [], activeEvent: null, workers: Object.fromEntries(Object.entries(old.workers ?? {}).map(([id, w]) => [id, { ...w, debauchery: 20 }])) }
    if (version < 11) old = { ...initial, ...old, workers: Object.fromEntries(Object.entries(old.workers ?? {}).map(([id, w]) => [id, { ...w, submission: 5 }])) }
    if (version < 12) old = { ...initial, ...old, workers: Object.fromEntries(Object.entries(old.workers ?? {}).map(([id, w]) => [id, { ...w, intimacyConsentDay: undefined }])) }
    if (version < 13) return { ...initial, ...old, workers: Object.fromEntries(Object.entries(old.workers ?? {}).map(([id, w]) => {
      const legacy = w as Worker & { medicalGrant?: number }
      const { medicalGrant, ...rest } = legacy
      return [id, { ...rest, savings: (w.savings ?? 0) + (medicalGrant ?? 0), modificationConsentAtSigning: personalFor(id)?.modificationConsentAtSigning ?? false, modificationDecision: undefined }]
    })) }
    return persisted as GameState
  },
  partialize: s => ({ lang: s.lang, day: s.day, phase: s.phase, output: s.output, wellbeing: s.wellbeing, reputation: s.reputation,
    money: s.money, food: s.food, feedDays: s.feedDays, livestock: s.livestock, staffCapacity: s.staffCapacity, cages: s.cages, huts: s.huts, vodka: s.vodka, enterprises: s.enterprises, enterpriseNames: s.enterpriseNames, stocks: s.stocks, provenance: s.provenance, listings: s.listings, totalSales: s.totalSales, vetBuilt: s.vetBuilt, vetDoctorId: s.vetDoctorId, lastReport: s.lastReport, journal: s.journal, activeEvent: s.activeEvent, hired: s.hired, workers: s.workers, assignments: s.assignments, message: s.message })
}))
