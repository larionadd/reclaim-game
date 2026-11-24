import procedures from '../data/medical/procedures.json'
import { canReceiveProcedure, operationSuccessChance } from '../mechanics/medicalOperations'
import { useGame, type Worker } from '../store/game'
import { t } from '../i18n'
import type { Lang } from '../types'
import { prosthetics, type LimbSlot } from '../data/prosthetics'

export function NpcModificationPanel({ id, worker, lang }: { id: string; worker: Worker; lang: Lang }) {
  const propose = useGame(s => s.proposeModification), perform = useGame(s => s.performOperation), fit = useGame(s => s.fitProstheticFromStock), stock = useGame(s => s.prostheticStock), day = useGame(s => s.day), doctor = useGame(s => s.vetDoctorId ? s.workers[s.vetDoctorId] : null)
  const tr = (key: string) => t(lang, key)
  return <section className="npc-modifications"><h3>{tr('medicalModifications')}</h3><p>{tr('ownSavingsOnly')} · {tr('savings')}: {worker.savings} ₴</p>{worker.disabled && <p className="medical-warning">{tr('permanentDisability')}</p>}<div className="modification-list">{procedures.map(procedure => {
    const eligible = canReceiveProcedure(id, worker, procedure, day)
    const count = worker.operations.filter(op => op.id === procedure.id).length
    const accepted = worker.modificationDecision?.procedureId === procedure.id && worker.modificationDecision.accepted
    const refused = worker.modificationDecision?.procedureId === procedure.id && !worker.modificationDecision.accepted
    const limbSlot = procedure.id.startsWith('replacement_') ? procedure.id.slice('replacement_'.length) as LimbSlot : null
    const needsProsthesis = limbSlot && worker.operations.some(op => op.id === procedure.id && (!op.outcome || op.outcome === 'success')) && !worker.equippedProsthetics?.[limbSlot]
    const availableProsthetics = limbSlot ? prosthetics.filter(item => item.slot === limbSlot && (stock[item.id] ?? 0) > 0) : []
    return <article className="procedure-card" key={procedure.id}>
      <img className="procedure-art" src={`${import.meta.env.BASE_URL}${procedure.image.replace(/^\//, '')}`} alt="" loading="lazy"/>
      <div className="procedure-card-body">
        <strong>{procedure.name[lang]}</strong>
        <div className="procedure-facts"><span>{procedure.costCredits} ₴</span><span>{procedure.recoveryDays} {tr('daysRecovery')}</span></div>
        <small>{tr('operationSuccessChance')}: {doctor ? Math.round(operationSuccessChance(doctor.bimbofication) * 100) : 0}%</small>
        <p>{!eligible ? count && !procedure.repeatable ? tr('operationDone') : tr('procedureUnavailable') : accepted ? tr('proposalAccepted') : refused ? tr('proposalRefused') : tr('proposalNotMade')}{count ? ` · ${tr('timesPerformed')}: ${count}` : ''}</p>
        <div className="procedure-actions"><button disabled={!eligible} onClick={() => propose(id, procedure.id)}>{tr('proposeOperation')}</button><button disabled={!eligible || !accepted || worker.savings < procedure.costCredits} onClick={() => perform(id, procedure.id)}>{tr('performOperation')}</button></div>
        {needsProsthesis && <div className="post-operation-choice"><strong>{tr('chooseProsthesisAfterSurgery')}</strong>{availableProsthetics.length ? availableProsthetics.map(item => <button key={item.id} disabled={!worker.alive || !worker.active} onClick={() => fit(id, item.id)}>{tr('fitPurchasedProsthesis')}: {item.name[lang]} × {stock[item.id]}</button>) : <p>{tr('buyCompatibleProsthesis')}</p>}</div>}
      </div>
    </article>
  })}</div></section>
}
