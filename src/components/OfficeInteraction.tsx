import { useState } from 'react'
import { candidates } from '../data/candidates'
import { displayName } from '../mechanics/npcIdentity'
import { actionMarkers, interactionGroups, interactionRequirement, thresholdHints, type InteractionAction } from '../mechanics/interactions'
import { useGame } from '../store/game'
import { t } from '../i18n'

export function OfficeInteraction() {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  const [selected, setSelected] = useState('')
  const ids = g.hired.filter(id => g.workers[id]?.active && g.workers[id]?.alive)
  const id = ids.includes(selected) ? selected : ids[0]
  const w = id ? g.workers[id] : undefined
  return <section className="manor-panel office-interaction"><h2>{tr('callWorker')}</h2>{!w ? <p>{tr('noWorkerForOffice')}</p> : <><select value={id} onChange={e => setSelected(e.target.value)}>{ids.map(workerId => { const c = candidates.find(x => x.id === workerId); return <option key={workerId} value={workerId}>{c ? displayName(c,g.lang,g.workers[workerId].nickname) : workerId}</option> })}</select><div className="relation-grid"><span>{tr('respect')}: {w.respect}</span><span>{tr('fear')}: {w.fear}</span><span>{tr('friendship')}: {w.friendship}</span><span>{tr('love')}: {w.love}</span><span>{tr('debauchery')}: {w.debauchery}</span><span>{tr('submission')}: {w.submission}</span></div>{Object.entries(interactionGroups).map(([group, actions]) => <div className="interaction-group" key={group}><h3>{tr(group)}</h3><div>{actions.map(action => { const a = action as InteractionAction, requirement = interactionRequirement(w, a, g.money, g.stocks.bread); return <div className="interaction-choice" key={a}><button disabled={!!requirement} onClick={() => g.interact(id, a)}><span aria-hidden="true">{actionMarkers[a]}</span> {tr(a)}</button><small>{requirement ? tr(requirement) : thresholdHints[a] ? tr(thresholdHints[a]) : tr('availableAction')}</small></div> })}</div></div>)}<p className="marker-legend">{tr('markerLegend')}</p><small>{tr('interactionHint')}</small></>}</section>
}
