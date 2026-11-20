export type FineReason = 'documented_damage' | 'serious_safety_violation'
export type FinanceEvent = { id: string; kind: 'wage' | 'bonus' | 'fine' | 'procedure'; amount: number; note: string }
export type WorkerFinance = { savings: number; events: FinanceEvent[] }

const recorded = (state: WorkerFinance, id: string) => state.events.some(event => event.id === id)
const addEvent = (state: WorkerFinance, event: FinanceEvent): WorkerFinance => recorded(state, event.id) ? state : {
  savings: Math.max(0, state.savings + event.amount),
  events: [...state.events, event]
}

export function payShift(state: WorkerFinance, shiftId: string, agreedWage: number, performanceBonus: number): WorkerFinance {
  if (!Number.isInteger(agreedWage) || agreedWage < 0 || !Number.isInteger(performanceBonus) || performanceBonus < 0 || performanceBonus > 10) throw new Error('Invalid pay')
  const withWage = addEvent(state, { id: `${shiftId}:wage`, kind: 'wage', amount: agreedWage, note: 'Agreed wage' })
  return performanceBonus ? addEvent(withWage, { id: `${shiftId}:bonus`, kind: 'bonus', amount: performanceBonus, note: 'Performance bonus' }) : withWage
}

export function applyFine(state: WorkerFinance, fineId: string, agreedWage: number, amount: number, reason: FineReason, documented: boolean, appealResolved: boolean): WorkerFinance {
  if (recorded(state, fineId)) return state
  if (!documented || !appealResolved) throw new Error('Fine requires evidence and a resolved appeal')
  if (!Number.isInteger(amount) || amount < 1 || amount > Math.floor(agreedWage * 0.2) || amount > state.savings) throw new Error('Fine exceeds limit or savings')
  return addEvent(state, { id: fineId, kind: 'fine', amount: -amount, note: reason })
}

export function purchaseProcedure(state: WorkerFinance, purchaseId: string, price: number, consented: boolean): WorkerFinance {
  if (recorded(state, purchaseId)) return state
  if (!consented || !Number.isInteger(price) || price < 0 || state.savings < price) throw new Error('Purchase not authorized or affordable')
  return { ...state, savings: state.savings - price, events: [...state.events, { id: purchaseId, kind: 'procedure', amount: -price, note: 'Chosen procedure' }] }
}
