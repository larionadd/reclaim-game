import procedures from '../data/medical/procedures.json'
import { useGame, type Worker } from '../store/game'
import { t } from '../i18n'
import type { Lang } from '../types'

export function NpcModificationPanel({ id, worker, lang }: { id: string; worker: Worker; lang: Lang }) {
  const propose = useGame(s => s.proposeModification), perform = useGame(s => s.performOperation)
  const tr = (key: string) => t(lang, key)
  return <section className="npc-modifications"><h3>{tr('medicalModifications')}</h3><p>{tr('ownSavingsOnly')} · {tr('savings')}: {worker.savings} ₴</p><div className="modification-list">{procedures.map(procedure => { const done = worker.operations.some(op => op.id === procedure.id), accepted = worker.modificationDecision?.procedureId === procedure.id && worker.modificationDecision.accepted, refused = worker.modificationDecision?.procedureId === procedure.id && !worker.modificationDecision.accepted; return <article key={procedure.id}><strong>{procedure.name[lang]}</strong><small>{procedure.costCredits} ₴ · {procedure.recoveryDays} {tr('daysRecovery')}</small><p>{done ? tr('operationDone') : accepted ? tr('proposalAccepted') : refused ? tr('proposalRefused') : tr('proposalNotMade')}</p><div><button disabled={!worker.alive || !worker.active || done} onClick={() => propose(id, procedure.id)}>{tr('proposeOperation')}</button><button disabled={!accepted || worker.savings < procedure.costCredits || !worker.active} onClick={() => perform(id, procedure.id)}>{tr('performOperation')}</button></div></article> })}</div></section>
}
