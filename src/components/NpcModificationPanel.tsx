import procedures from '../data/medical/procedures.json'
import { canReceiveProcedure } from '../mechanics/medicalOperations'
import { useGame, type Worker } from '../store/game'
import { t } from '../i18n'
import type { Lang } from '../types'

export function NpcModificationPanel({ id, worker, lang }: { id: string; worker: Worker; lang: Lang }) {
  const propose = useGame(s => s.proposeModification), perform = useGame(s => s.performOperation), day = useGame(s => s.day)
  const tr = (key: string) => t(lang, key)
  return <section className="npc-modifications"><h3>{tr('medicalModifications')}</h3><p>{tr('ownSavingsOnly')} · {tr('savings')}: {worker.savings} ₴</p>{worker.disabled && <p className="medical-warning">{tr('permanentDisability')}</p>}<div className="modification-list">{procedures.map(procedure => {
    const eligible = canReceiveProcedure(id, worker, procedure, day)
    const count = worker.operations.filter(op => op.id === procedure.id).length
    const accepted = worker.modificationDecision?.procedureId === procedure.id && worker.modificationDecision.accepted
    const refused = worker.modificationDecision?.procedureId === procedure.id && !worker.modificationDecision.accepted
    const risk = Math.round((procedure.fatalityRisk + procedure.disabilityRisk + procedure.complicationRisk) * 100)
    return <article key={procedure.id}><strong>{procedure.name[lang]}</strong><small>{procedure.costCredits} ₴ · {procedure.recoveryDays} {tr('daysRecovery')}</small><small>{tr('operationRisk')}: {risk}% · {tr('deathRisk')}: {(procedure.fatalityRisk * 100).toFixed(1)}%</small><p>{!eligible ? count && !procedure.repeatable ? tr('operationDone') : tr('procedureUnavailable') : accepted ? tr('proposalAccepted') : refused ? tr('proposalRefused') : tr('proposalNotMade')}{count ? ` · ${tr('timesPerformed')}: ${count}` : ''}</p><div><button disabled={!eligible} onClick={() => propose(id, procedure.id)}>{tr('proposeOperation')}</button><button disabled={!eligible || !accepted || worker.savings < procedure.costCredits} onClick={() => perform(id, procedure.id)}>{tr('performOperation')}</button></div></article>
  })}</div></section>
}
