import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Job, Lang, Phase } from '../types'
import { resolveDay } from '../mechanics/economy'
import { canHire } from '../mechanics/hiring'
import { phaseMessage } from '../mechanics/events'
import { candidates } from '../data/candidates'

export type Housing = 'cage' | 'hut'
export type Contract = 'paid' | 'foodOnly'
export type ShopItem = 'bread' | 'lard' | 'grain' | 'vodka'
export const shopPrices: Record<ShopItem, number> = { bread: 6, lard: 12, grain: 18, vodka: 25 }
export interface Worker {
  contract: Contract
  ration: number
  wage: number
  agreedWage: number
  wageDebt: number
  housing: Housing
  savings: number
  medicalGrant: number
  health: number
  alive: boolean
  injuredUntilDay?: number
  trust: number
  traits: string[]
  operations: { id: string; day: number }[]
  workDays: { production: number; maintenance: number }
}
type Livestock = { cattle: number; sheep: number; chickens: number }
interface GameState {
  lang: Lang; day: number; phase: Phase; output: number; wellbeing: number; reputation: number
  money: number; food: number; feedDays: number; livestock: Livestock; staffCapacity: number; cages: number; huts: number; vodka: number; enterprises: string[]
  hired: string[]; workers: Record<string, Worker>; assignments: Record<string, Job>; message: string
  toggleLang: () => void; hire: (id: string, contract?: Contract) => void; assign: (id: string, job: Job) => void
  setRation: (id: string, amount: number) => void; setWage: (id: string, amount: number) => void
  setHousing: (id: string, housing: Housing) => void; reward: (id: string, amount: number) => void
  fine: (id: string, amount: number, reason: string) => void; sponsor: (id: string, amount: number) => void
  expandHousing: () => void; buildCage: () => void; buildHut: () => void; createEnterprise: (id: string) => void
  purchase: (items: Partial<Record<ShopItem, number>>) => void; sleep: () => void; advance: () => void; reset: () => void
}
const order: Phase[] = ['morning', 'day', 'evening', 'night']
const initial = {
  lang: 'uk' as Lang, day: 1, phase: 'morning' as Phase, output: 24, wellbeing: 76, reputation: 58,
  money: 120, food: 18, feedDays: 8, livestock: { cattle: 18, sheep: 26, chickens: 120 }, staffCapacity: 1, cages: 1, huts: 0, vodka: 0, enterprises: ['farm'],
  hired: [] as string[], workers: {} as Record<string, Worker>, assignments: {} as Record<string, Job>, message: 'msgStart'
}
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
const defaultWorker = (id: string, contract: Contract = 'paid'): Worker => ({ contract, ration: contract === 'paid' ? 3 : 4, wage: contract === 'paid' ? 12 : 0, agreedWage: contract === 'paid' ? 12 : 0, wageDebt: 0, housing: 'cage', savings: 0, medicalGrant: 0, health: 76, alive: true, trust: 25, traits: candidates.find(c => c.id === id)?.traits ?? [], operations: [], workDays: { production: 0, maintenance: 0 } })
const occupied = (workers: Record<string, Worker>, housing: Housing, except?: string) => Object.entries(workers).filter(([id, w]) => id !== except && w.alive && w.housing === housing).length

export const useGame = create<GameState>()(persist((set, get) => ({ ...initial,
  toggleLang: () => set(s => ({ lang: s.lang === 'uk' ? 'ru' : s.lang === 'ru' ? 'en' : 'uk' })),
  hire: (id, contract = 'paid') => set(s => {
    const livingIds = s.hired.filter(workerId => s.workers[workerId]?.alive)
    if (s.hired.includes(id) || !canHire(livingIds, id, s.staffCapacity) || !candidates.some(c => c.id === id && c.availableFromDay <= s.day)) return {}
    const housing: Housing = occupied(s.workers, 'hut') < s.huts * 2 ? 'hut' : 'cage'
    if (occupied(s.workers, housing) >= (housing === 'hut' ? s.huts * 2 : s.cages)) return {}
    return { hired: [...s.hired, id], workers: { ...s.workers, [id]: { ...defaultWorker(id, contract), housing } }, assignments: { ...s.assignments, [id]: 'rest' }, message: 'msgHired' }
  }),
  assign: (id, job) => set(s => s.phase === 'morning' && s.workers[id]?.alive && (s.workers[id].injuredUntilDay ?? 0) <= s.day ? { assignments: { ...s.assignments, [id]: job } } : {}),
  setRation: (id, amount) => set(s => s.workers[id]?.alive ? { workers: { ...s.workers, [id]: { ...s.workers[id], ration: clamp(Math.round(amount), 0, 5) } } } : {}),
  setWage: (id, amount) => set(s => s.workers[id]?.alive && s.workers[id].contract === 'paid' ? { workers: { ...s.workers, [id]: { ...s.workers[id], wage: clamp(Math.round(amount), 0, 30) } } } : {}),
  setHousing: (id, housing) => set(s => s.workers[id]?.alive && occupied(s.workers, housing, id) < (housing === 'cage' ? s.cages : s.huts * 2) ? { workers: { ...s.workers, [id]: { ...s.workers[id], housing } } } : {}),
  reward: (id, amount) => set(s => s.workers[id]?.alive && amount > 0 && amount <= 10 && s.money >= amount ? { money: s.money - amount, workers: { ...s.workers, [id]: { ...s.workers[id], savings: s.workers[id].savings + amount, trust: clamp(s.workers[id].trust + 2, 0, 100) } } } : {}),
  fine: (id, amount, reason) => set(s => {
    const w = s.workers[id]; if (!w?.alive || w.contract !== 'paid' || reason.trim().length < 8 || amount < 1 || amount > Math.floor(w.wage * .2) || w.savings < amount) return {}
    return { workers: { ...s.workers, [id]: { ...w, savings: w.savings - amount, trust: clamp(w.trust - 8, 0, 100) } }, reputation: clamp(s.reputation - 2, 0, 100), message: 'msgFine' }
  }),
  sponsor: (id, amount) => set(s => s.workers[id]?.alive && amount > 0 && amount <= s.money ? { money: s.money - amount, workers: { ...s.workers, [id]: { ...s.workers[id], medicalGrant: s.workers[id].medicalGrant + amount } }, message: 'msgSponsor' } : {}),
  expandHousing: () => get().buildHut(),
  buildCage: () => set(s => s.cages < 5 && s.money >= 90 ? { cages: s.cages + 1, staffCapacity: s.staffCapacity + 1, money: s.money - 90, message: 'msgHousingExpanded' } : {}),
  buildHut: () => set(s => s.money >= 180 ? { huts: s.huts + 1, staffCapacity: s.staffCapacity + 2, money: s.money - 180, message: 'msgHousingExpanded' } : {}),
  createEnterprise: id => set(s => {
    const cost = id === 'depot' ? 500 : id === 'plant' ? 950 : Infinity
    return s.money >= cost && !s.enterprises.includes(id) ? { money: s.money - cost, enterprises: [...s.enterprises, id] } : {}
  }),
  purchase: items => set(s => {
    const quantities = Object.fromEntries((Object.keys(shopPrices) as ShopItem[]).map(id => [id, Math.max(0, Math.min(99, Math.floor(items[id] ?? 0)))])) as Record<ShopItem, number>
    const total = (Object.keys(shopPrices) as ShopItem[]).reduce((sum, id) => sum + quantities[id] * shopPrices[id], 0)
    if (!total || total > s.money) return {}
    return { money: s.money - total, food: s.food + quantities.bread * 3 + quantities.lard * 2, feedDays: s.feedDays + quantities.grain * 5, vodka: s.vodka + quantities.vodka, message: 'msgOrder' }
  }),
  sleep: () => { const startDay = get().day; while (get().day === startDay) get().advance() },
  advance: () => {
    const s = get(), next = order[(order.indexOf(s.phase) + 1) % 4]
    if (s.phase !== 'night') { set({ phase: next, message: phaseMessage[next] }); return }
    const living = Object.fromEntries(Object.entries(s.assignments).filter(([id]) => s.workers[id]?.alive).map(([id, job]) => [id, (s.workers[id].injuredUntilDay ?? 0) > s.day ? 'rest' : job])) as Record<string, Job>
    const result = resolveDay(living, s.wellbeing, s.reputation)
    let food = s.food, money = s.money, reputation = result.reputation
    const workers = { ...s.workers }
    const assignments = { ...s.assignments }
    let anyInjury = false, anyFatality = false
    for (const id of s.hired) {
      const worker = workers[id]; if (!worker?.alive) continue
      const eaten = Math.min(worker.ration, food); food -= eaten
      const paid = Math.min(worker.wage, money); money -= paid
      const healthChange = eaten < 2 ? -10 : eaten === 2 ? -4 : eaten >= 4 ? 2 : 0
      const workChange = (living[id] === 'production' ? -5 : living[id] === 'rest' ? 5 : 0) + (worker.housing === 'cage' ? -6 : 2)
      const productionCount = Object.values(living).filter(job => job === 'production').length
      const risk = productionCount >= 2 ? .12 : .04
      const incidentRoll = living[id] === 'production' ? Math.random() : 1
      const fatal = incidentRoll < .001
      const injured = !fatal && incidentRoll < risk
      const health = clamp(worker.health + healthChange + workChange - (injured ? 12 : 0), 0, 100)
      const wageShortfall = Math.max(0, worker.agreedWage - paid)
      const workDays = { ...worker.workDays }
      if (living[id] === 'production' || living[id] === 'maintenance') workDays[living[id]]++
      const gained = workDays.maintenance >= 10 && !worker.traits.includes('skilled_mechanic') ? ['skilled_mechanic'] : []
      workers[id] = { ...worker, workDays, traits: [...worker.traits, ...gained], savings: worker.savings + paid, wageDebt: worker.wageDebt + wageShortfall, trust: clamp(worker.trust - (wageShortfall ? 4 : 0) - (worker.housing === 'cage' ? 3 : 0), 0, 100), health, alive: !fatal, injuredUntilDay: injured ? s.day + 2 : worker.injuredUntilDay }
      if (fatal) { anyFatality = true; reputation = clamp(reputation - 15, 0, 100); assignments[id] = 'rest' }
      if (injured) { anyInjury = true; reputation = clamp(reputation - 3, 0, 100); assignments[id] = 'rest' }
      if (eaten < 2 || wageShortfall > 0) reputation = clamp(reputation - 5, 0, 100)
    }
    set({ day: s.day + 1, phase: next, output: s.output + result.output, wellbeing: clamp(result.wellbeing - Object.values(workers).filter(w => w.alive && w.housing === 'cage').length * 3, 0, 100), reputation,
      food, money: money + (s.feedDays > 0 ? 28 + result.output * 2 : 8) + (s.enterprises.includes('depot') ? 18 : 0) + (s.enterprises.includes('plant') ? 36 : 0), feedDays: Math.max(0, s.feedDays - 1), workers, assignments,
      message: anyFatality ? 'msgFatality' : anyInjury ? 'msgInjury' : 'msgReport' })
  },
  reset: () => set(initial)
}), {
  name: 'reclaim-save-v1', version: 4,
  migrate: (persisted, version) => {
    const old = persisted as Partial<GameState>
    if (version < 4) {
      const hired = old.hired ?? []
      const huts = Math.ceil(Math.max(0, hired.filter(id => old.workers?.[id]?.alive !== false).length - 1) / 2)
      const workers = Object.fromEntries(hired.map((id, i) => { const w = old.workers?.[id] ?? defaultWorker(id); return [id, {
        ...defaultWorker(id, w.contract), ...w, housing: (i === 0 ? 'cage' : 'hut') as Housing,
        traits: candidates.find(c => c.id === id)?.traits ?? [], operations: [], workDays: { production: 0, maintenance: 0 }
      }] }))
      return { ...initial, ...old, cages: 1, huts, staffCapacity: 1 + huts * 2, vodka: 0, enterprises: ['farm'], workers }
    }
    return persisted as GameState
  },
  partialize: s => ({ lang: s.lang, day: s.day, phase: s.phase, output: s.output, wellbeing: s.wellbeing, reputation: s.reputation,
    money: s.money, food: s.food, feedDays: s.feedDays, livestock: s.livestock, staffCapacity: s.staffCapacity, cages: s.cages, huts: s.huts, vodka: s.vodka, enterprises: s.enterprises, hired: s.hired, workers: s.workers, assignments: s.assignments, message: s.message })
}))
