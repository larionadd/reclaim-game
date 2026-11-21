import { useState } from 'react'
import { useGame, type Contract, type ContractTerm, type Worker } from '../store/game'
import { t } from '../i18n'
import type { Lang } from '../types'

export function ContractSettings({ id, worker, lang }: { id: string; worker: Worker; lang: Lang }) {
  const game = useGame(), tr = (key: string) => t(lang, key)
  const [renewTerm, setRenewTerm] = useState<ContractTerm>(worker.contractTerm)
  const activeCount = game.hired.filter(workerId => game.workers[workerId]?.alive && game.workers[workerId]?.active).length
  const occupied = (housing: 'hut' | 'cage') => Object.entries(game.workers).filter(([workerId, other]) => workerId !== id && other.alive && other.active && other.housing === housing).length
  const hasHousing = occupied('hut') < game.huts * 2 || occupied('cage') < game.cages
  const canRenew = worker.alive && (worker.active || (activeCount < game.staffCapacity && hasHousing))
  const term = worker.active ? worker.contractTerm : renewTerm
  const chooseTerm = (value: string) => {
    const next = value === 'lifetime' ? 'lifetime' : Number(value) as 30 | 90
    setRenewTerm(next)
    if (worker.active) game.setContractTerm(id, next)
  }
  return <section className="contract-settings" aria-label={tr('contractSettings')}>
    <h3>{tr('contractSettings')}</h3>
    <p>{tr('contractStatus')}: <strong>{tr(worker.active ? 'contractActive' : 'contractCompleted')}</strong> · {tr('contractEnd')}: <strong>{worker.contractEndsDay === null ? tr('noEndDate') : `${tr('dayLabel')} ${worker.contractEndsDay}`}</strong></p>
    <div className="contract-fields">
      <label>{tr('paymentType')}<select value={worker.contract} disabled={!worker.alive || !worker.active} onChange={e => game.setContract(id, e.target.value as Contract)}><option value="paid">{tr('paid')}</option><option value="foodOnly">{tr('foodOnly')}</option></select></label>
      <label>{tr('contractWage')}<input type="number" min="0" max="30" value={worker.wage} disabled={!worker.alive || !worker.active || worker.contract !== 'paid'} onChange={e => game.setWage(id, Number(e.target.value))}/></label>
      <label>{tr('contractTerm')}<select value={term} disabled={!worker.alive} onChange={e => chooseTerm(e.target.value)}><option value={30}>30 {tr('days')}</option><option value={90}>90 {tr('days')}</option><option value="lifetime">{tr('lifetime')}</option></select></label>
    </div>
    <p>{worker.contract === 'paid' ? tr('paidContractHint') : tr('foodContractHint')}</p>
    <div className="contract-actions"><button disabled={!canRenew || (worker.active && worker.contractEndsDay === null)} onClick={() => game.renewContract(id, term)}>{tr(worker.active ? 'extendContract' : 'renewContract')}</button><button className="contract-terminate" disabled={!worker.alive || !worker.active} onClick={() => game.terminateContract(id)}>{tr('terminateContract')}</button></div>
    {!worker.active && worker.alive && !canRenew && <small>{tr('contractNoHousing')}</small>}
  </section>
}
