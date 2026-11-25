import { useState } from 'react'
import { candidates } from '../data/candidates'
import { displayName } from '../mechanics/npcIdentity'
import { canCallBedroom, canChooseIntimacy, canPunishInBedroom, type BedroomAction } from '../mechanics/bedroom'
import { useGame } from '../store/game'
import { t } from '../i18n'
import { Portrait } from './Portrait'
import { AdultToyActions } from './AdultToyActions'
import { NpcStateActions } from './NpcStateActions'

const intimacy: BedroomAction[] = ['vaginalSex', 'oralSex', 'analSex']
const punishment: BedroomAction[] = ['reprimand', 'extraDuty']

export function BedroomInteraction() {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  const [open, setOpen] = useState(false), [selectedId, setSelectedId] = useState<string | null>(null)
  const people = candidates.filter(c => g.workers[c.id] && canCallBedroom(g.workers[c.id]))
  const person = people.find(c => c.id === selectedId)
  const w = person ? g.workers[person.id] : undefined

  if (!open) return <section className="manor-panel bedroom-call"><h2>{tr('bedroomCall')}</h2><p>{tr('bedroomCallHint')}</p><button onClick={() => setOpen(true)}>{tr('bedroomCall')}</button></section>
  return <section className="manor-panel bedroom-call"><div className="call-heading"><h2>{tr('bedroomCall')}</h2><button onClick={() => { setOpen(false); setSelectedId(null) }}>← {tr('bedroom')}</button></div>
    {!person || !w ? <><p>{tr('chooseBedroomGuest')}</p><div className="call-cards">{people.map(c => { const worker = g.workers[c.id]; return <button key={c.id} onClick={() => setSelectedId(c.id)}><Portrait person={c} lang={g.lang} outfit="sleepwear"/><span><strong>{displayName(c, g.lang, worker.nickname)}</strong><small>{tr('love')}: {worker.love} · {tr('submission')}: {worker.submission}</small><small>{worker.active ? tr('contractActive') : tr('formerWorker')}</small></span></button> })}</div>{!people.length && <p>{tr('noBedroomGuests')}</p>}</> : <>
      <button className="call-back" onClick={() => setSelectedId(null)}>← {tr('allWorkers')}</button><div className="called-worker"><Portrait person={person} lang={g.lang} outfit="sleepwear" zoomable/><div><h3>{displayName(person, g.lang, w.nickname)}</h3><p>{w.active ? tr('contractActive') : tr('formerWorker')}</p></div></div>
      <div className="relation-grid"><span>{tr('trustLevel')}: {w.trust}</span><span>{tr('love')}: {w.love}</span><span>{tr('debauchery')}: {w.debauchery}</span><span>{tr('submission')}: {w.submission}</span></div>
      <div className="interaction-group"><h3>{tr('bedroomIntimacy')}</h3><p>{tr('bedroomConsentRule')}</p><div>{intimacy.map(action => <div className="interaction-choice" key={action}><button disabled={!canChooseIntimacy(w, person.age) || !g.canUseAction(action)} onClick={() => g.bedroomAction(person.id, action)}>{tr(action)}</button><small>{tr('intimacyRelationshipHint')} · {tr('intimacyActionEffect')}</small></div>)}</div></div><NpcStateActions id={person.id} room="bedroom"/><AdultToyActions id={person.id} age={person.age} room="bedroom"/>
      <div className="interaction-group"><h3>{tr('bedroomPunishment')}</h3><div>{punishment.map(action => <div className="interaction-choice" key={action}><button disabled={!canPunishInBedroom(w) || !g.canUseAction(action)} onClick={() => g.bedroomAction(person.id, action)}>{tr(action)}</button></div>)}</div></div>
    </>}
  </section>
}
