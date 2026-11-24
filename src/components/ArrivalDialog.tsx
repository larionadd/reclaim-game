import { candidates } from '../data/candidates'
import { displayName } from '../mechanics/npcIdentity'
import { useGame } from '../store/game'
import { t } from '../i18n'
import { Portrait } from './Portrait'
import './ArrivalDialog.css'

export function ArrivalDialog() {
  const g = useGame()
  const tr = (key: string) => t(g.lang, key)
  const contractId = g.pendingContractNotices[0]
  const arrivalId = g.arrivalNotices[0]
  const id = contractId ?? arrivalId
  if (!id) return null
  const person = candidates.find(candidate => candidate.id === id)
  const name = person ? displayName(person, g.lang, g.workers[id]?.nickname) : id

  if (contractId) return <div className="arrival-overlay"><section className="arrival-dialog contract-notice" role="dialog" aria-modal="true" aria-labelledby="contract-notice-title">
    <span className="arrival-kicker">RECLAIM</span>
    <h2 id="contract-notice-title">{tr('contractSignedTitle')}</h2>
    <p className="arrival-name">{name}</p>
    <p>{tr('contractSignedNotice')}</p>
    <button autoFocus onClick={g.dismissContractNotice}>{tr('continue')}</button>
  </section></div>

  return <div className="arrival-overlay"><section className="arrival-dialog" role="dialog" aria-modal="true" aria-labelledby="arrival-title">
    <img className="arrival-scene" src={`${import.meta.env.BASE_URL}art/arrival-van.jpg`} alt=""/>
    <div className="arrival-content">
      <span className="arrival-kicker">{tr('dayLabel')} {g.day}</span>
      <h2 id="arrival-title">{tr('arrivalTitle')}</h2>
      {person && <div className="arrival-person"><Portrait person={person} lang={g.lang}/><strong>{name}</strong></div>}
      <p>{tr('arrivalScene')}</p>
      <button autoFocus onClick={g.dismissArrivalNotice}>{tr('continue')}</button>
    </div>
  </section></div>
}
