import { useState } from 'react'
import { candidates } from '../data/candidates'
import { displayName } from '../mechanics/npcIdentity'
import { actionMarkers, interactionGroups, interactionRequirement, thresholdHints, type InteractionAction } from '../mechanics/interactions'
import { useGame } from '../store/game'
import { t } from '../i18n'
import { Portrait } from './Portrait'
import { canAskOfficeConsent, canChooseOfficeIntimacy } from '../mechanics/bedroom'

export function OfficeInteraction() {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const staff = candidates.filter(c => g.workers[c.id]?.alive)
  const person = staff.find(c => c.id === selectedId)
  const w = person ? g.workers[person.id] : undefined

  return <section className="manor-panel office-interaction"><h2>{tr('callWorker')}</h2>
    {!person || !w ? <><p>{tr('chooseWorkerCard')}</p><div className="call-cards">{staff.map(c => { const worker = g.workers[c.id]; return <button key={c.id} onClick={() => setSelectedId(c.id)}><Portrait person={c} lang={g.lang}/><span><strong>{displayName(c, g.lang, worker.nickname)}</strong><small>{tr('health')}: {worker.health}% · {tr('respect')}: {worker.respect}</small><small>{tr('friendship')}: {worker.friendship} · {tr('fear')}: {worker.fear}</small></span></button> })}</div>{!staff.length && <p>{tr('noWorkerForOffice')}</p>}</> : <>
      <button className="call-back" onClick={() => setSelectedId(null)}>← {tr('allWorkers')}</button>
      <div className="called-worker"><Portrait person={person} lang={g.lang}/><div><h3>{displayName(person, g.lang, w.nickname)}</h3><p>{tr('calledToOffice')}</p></div></div>
      <div className="relation-grid"><span>{tr('respect')}: {w.respect}</span><span>{tr('fear')}: {w.fear}</span><span>{tr('friendship')}: {w.friendship}</span><span>{tr('love')}: {w.love}</span><span>{tr('debauchery')}: {w.debauchery}</span><span>{tr('submission')}: {w.submission}</span></div>
      {w.active && Object.entries(interactionGroups).map(([group, actions]) => <div className="interaction-group" key={group}><h3>{tr(group)}</h3><div>{actions.map(action => { const a = action as InteractionAction, requirement = interactionRequirement(w, a, g.money, g.stocks.bread); return <div className="interaction-choice" key={a}><button disabled={!!requirement} onClick={() => g.interact(person.id, a)}><span aria-hidden="true">{a === 'sex' && w.fear > 80 ? '😈' : actionMarkers[a]}</span> {tr(a)}</button><small>{thresholdHints[a] ? tr(thresholdHints[a]) : tr('availableAction')}{requirement && <> · {tr(requirement)}</>}</small></div> })}</div></div>)}
      <div className="interaction-group"><h3>{tr('officeIntimacy')}</h3><p>{tr('officeIntimacyHint')}</p><div className="interaction-choice"><button disabled={!canAskOfficeConsent(w, person.age) || w.intimacyConsentDay === g.day} onClick={() => g.officeIntimacy(person.id, 'officeAskConsent')}>{tr('askConsent')}</button></div><div>{(['officeTender','officePassionate','officeQuiet'] as const).map(action => <div className="interaction-choice" key={action}><button disabled={!canChooseOfficeIntimacy(w, person.age, g.day)} onClick={() => g.officeIntimacy(person.id, action)}>{tr(action)}</button><small>{tr('consentRequiredToday')}</small></div>)}</div></div>
      <p className="marker-legend">{tr('markerLegend')}</p>
    </>}
  </section>
}
