import { useState } from 'react'
import { candidates } from '../data/candidates'
import { displayName } from '../mechanics/npcIdentity'
import { useGame } from '../store/game'
import { t } from '../i18n'

const groups = { reward: ['bonus','dayOff','extraFood'], punish: ['fine','hit','dismiss'], talk: ['joke','walk','hug','kiss','sex'] }

export function OfficeInteraction() {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  const [selected, setSelected] = useState('')
  const ids = g.hired.filter(id => g.workers[id]?.active && g.workers[id]?.alive)
  const id = ids.includes(selected) ? selected : ids[0]
  const w = id ? g.workers[id] : undefined
  const allowed = (action: string) => !!w && ({ bonus: g.money >= 5 && w.contract === 'paid', dayOff: true, extraFood: w.contract === 'foodOnly' && g.stocks.bread > 0, fine: w.contract === 'paid' && w.savings > 0, hit: true, dismiss: true, joke: true, walk: w.friendship >= 35 || w.respect >= 50, hug: w.friendship >= 55 && w.fear < 35, kiss: w.friendship >= 70 && w.love >= 55 && w.fear < 20, sex: w.love >= 80 && w.friendship >= 75 && w.fear < 10 } as Record<string, boolean>)[action]
  return <section className="manor-panel office-interaction"><h2>{tr('callWorker')}</h2>{!w ? <p>{tr('noWorkerForOffice')}</p> : <><select value={id} onChange={e => setSelected(e.target.value)}>{ids.map(workerId => { const c = candidates.find(x => x.id === workerId); return <option key={workerId} value={workerId}>{c ? displayName(c,g.lang,g.workers[workerId].nickname) : workerId}</option> })}</select><div className="relation-grid"><span>{tr('respect')}: {w.respect}</span><span>{tr('fear')}: {w.fear}</span><span>{tr('friendship')}: {w.friendship}</span><span>{tr('love')}: {w.love}</span></div>{Object.entries(groups).map(([group, actions]) => <div className="interaction-group" key={group}><h3>{tr(group)}</h3><div>{actions.map(action => <button disabled={!allowed(action)} key={action} onClick={() => g.interact(id, action)}>{tr(action)}</button>)}</div></div>)}<small>{tr('interactionHint')}</small></>}</section>
}
