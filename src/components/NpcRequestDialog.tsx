import { candidates } from '../data/candidates'
import { displayName } from '../mechanics/npcIdentity'
import { useGame } from '../store/game'
import { t } from '../i18n'
import { Portrait } from './Portrait'

export function NpcRequestDialog() {
  const g = useGame(), pending = g.pendingRequest, tr = (key: string) => t(g.lang, key)
  if (!pending) return null
  const person = candidates.find(candidate => candidate.id === pending.workerId)
  if (!person) return null
  return <div className="npc-request-overlay"><section className="npc-request-dialog" role="dialog" aria-modal="true" aria-label={tr('npcRequestTitle')}><div className="npc-request-person"><Portrait person={person} lang={g.lang}/><div><small>{tr('npcRequestTitle')} · {tr(g.phase)}</small><h2>{displayName(person, g.lang, g.workers[person.id]?.nickname)}</h2></div></div><p>{tr(`request_${pending.requestId}`)}</p><div className="npc-request-actions"><button onClick={() => g.resolveRequest(false)}>{tr('requestDecline')}</button><button className="primary-action" onClick={() => g.resolveRequest(true)}>{tr('requestAccept')}</button></div></section></div>
}
