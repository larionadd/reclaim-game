import { useState } from 'react'
import { candidates } from '../data/candidates'
import { displayName } from '../mechanics/npcIdentity'
import { actionMarkers, interactionGroups, interactionRequirement, thresholdHints, type InteractionAction } from '../mechanics/interactions'
import { useGame } from '../store/game'
import { t } from '../i18n'
import { Portrait } from './Portrait'
import { canChooseOfficeIntimacy } from '../mechanics/bedroom'
import { hasUnfittedLimb } from '../mechanics/mobility'

export function OfficeInteraction() {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const staff = candidates.filter(c => g.workers[c.id]?.alive && !hasUnfittedLimb(g.workers[c.id]))
  const person = staff.find(c => c.id === selectedId)
  const w = person ? g.workers[person.id] : undefined
  const cagedId = g.officeCagedNpcId && g.workers[g.officeCagedNpcId]?.alive && g.workers[g.officeCagedNpcId]?.active ? g.officeCagedNpcId : null

  return <section className="manor-panel office-interaction"><h2>{tr('callWorker')}</h2>
    {!person || !w ? <><p>{tr('chooseWorkerCard')}</p><div className="call-cards">{staff.map(c => { const worker = g.workers[c.id]; return <button key={c.id} onClick={() => setSelectedId(c.id)}><Portrait person={c} lang={g.lang}/><span><strong>{displayName(c, g.lang, worker.nickname)}</strong><small>{tr('health')}: {worker.health}% · {tr('respect')}: {worker.respect}</small><small>{tr('friendship')}: {worker.friendship} · {tr('fear')}: {worker.fear}</small></span></button> })}</div>{!staff.length && <p>{tr('noWorkerForOffice')}</p>}</> : <>
      <button className="call-back" onClick={() => setSelectedId(null)}>← {tr('allWorkers')}</button>
      <div className="called-worker"><Portrait person={person} lang={g.lang}/><div><h3>{displayName(person, g.lang, w.nickname)}</h3><p>{tr('calledToOffice')}</p></div></div>
      <p className="action-budget">{tr('actionBudget')}: {g.actionDay === g.day && g.actionPhaseUsed === g.phase ? '0' : '1'} · {tr('actionMaxThree')}</p><div className="relation-grid"><span>{tr('respect')}: {w.respect}</span><span>{tr('fear')}: {w.fear}</span><span>{tr('friendship')}: {w.friendship}</span><span>{tr('love')}: {w.love}</span><span>{tr('debauchery')}: {w.debauchery}</span><span>{tr('submission')}: {w.submission}</span></div>
      {g.officePlaced.dogCrate > 0 && <div className="interaction-group"><h3>{tr('dogCrate')}</h3><div className="interaction-choice"><button disabled={cagedId ? cagedId !== person.id : !w.active || !g.canUseAction('officeCage')} onClick={() => g.officeCageAction(person.id, cagedId === person.id ? 'release' : 'cage')}>{tr(cagedId === person.id ? 'releaseFromCrate' : 'putInCrate')}</button><small>{cagedId && cagedId !== person.id ? tr('crateOccupied') : tr('officeCrateHint')}</small></div></div>}
      {Object.entries(interactionGroups).map(([group, actions]) => <div className="interaction-group" key={group}><h3>{tr(group)}</h3><div>{actions.map(action => { const a = action as InteractionAction, requirement = interactionRequirement(w, a, g.money, g.stocks.bread), noCageSpace = a === 'punishCage' && w.housing !== 'cage' && Object.entries(g.workers).filter(([id, worker]) => id !== person.id && worker.alive && worker.active && worker.housing === 'cage').length >= g.cages; return <div className="interaction-choice" key={a}><button disabled={!!requirement || noCageSpace || !g.canUseAction(a) || (!w.active && group !== 'talk')} onClick={() => g.interact(person.id, a)}><span aria-hidden="true">{actionMarkers[a]}</span> {tr(a)}</button><small>{thresholdHints[a] ? tr(thresholdHints[a]) : tr('availableAction')}{requirement && <> · {tr(requirement)}</>}{noCageSpace && <> · {tr('noCageSpace')}</>}</small></div> })}</div></div>)}
      <div className="interaction-group"><h3>{tr('officeIntimacy')}</h3><p>{tr('officeIntimacyHint')}</p><div>{(['officeTender','officePassionate','officeQuiet','oralSex','analSex'] as const).map(action => <div className="interaction-choice" key={action}><button disabled={!canChooseOfficeIntimacy(w, person.age) || !g.canUseAction(action)} onClick={() => g.officeIntimacy(person.id, action)}>{tr(action)}</button><small>{tr('intimacyRelationshipHint')}</small></div>)}</div></div>
      <p className="marker-legend">{tr('markerLegend')}</p>
    </>}
  </section>
}
