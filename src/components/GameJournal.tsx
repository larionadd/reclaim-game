import { candidates } from '../data/candidates'
import { displayName } from '../mechanics/npcIdentity'
import { useGame, type GameEvent } from '../store/game'
import { t } from '../i18n'
import { eventMarker } from '../mechanics/interactions'
import procedures from '../data/medical/procedures.json'
import { Portrait } from './Portrait'
import { workplaceImages, type WorkplaceAction } from '../mechanics/workplace'

function EventBody({ event }: { event: GameEvent }) {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  const person = candidates.find(c => c.id === event.workerId)
  const name = person ? displayName(person, g.lang, g.workers[event.workerId]?.nickname) : event.workerId
  const procedure = procedures.find(p => p.id === event.detail)
  const scene = workplaceImages[event.action as WorkplaceAction]
  return <><span className="event-meta">{tr('dayLabel')} {event.day} · {tr(event.phase)} · {name}</span><h3><span aria-hidden="true">{eventMarker(event.action)}</span> {tr(event.action)}{event.action === 'useAdultToy' && event.detail ? ` · ${tr(event.detail)}` : ''}</h3>{person && <div className="event-visual">{scene && <img className="event-scene" src={`${import.meta.env.BASE_URL}${scene.replace(/^\//, '')}`} alt=""/>}<div className="event-person"><Portrait person={person} lang={g.lang}/><strong>{name}</strong></div></div>}{procedure && <strong>{procedure.name[g.lang]}</strong>}<p>{tr(event.storyKey)}</p><div className="event-deltas">{Object.entries(event.changes).length ? Object.entries(event.changes).map(([key, value]) => <span className={value < 0 ? 'negative' : 'positive'} key={key}>{tr(key)} {value > 0 ? '+' : ''}{value}{['money','savings'].includes(key) ? ' ₴' : ''}</span>) : <span>{tr('noStatChange')}</span>}</div></>
}

export function GameJournal() {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  return <section className="game-journal"><h2>{tr('journal')}</h2><p>{tr('journalIntro')}</p>{g.journal.length ? <div className="journal-list">{[...g.journal].reverse().map(event => <article key={event.id}><EventBody event={event}/></article>)}</div> : <p>{tr('journalEmpty')}</p>}</section>
}

export function GameEventDialog() {
  const g = useGame(), event = g.activeEvent, tr = (key: string) => t(g.lang, key)
  if (!event) return null
  return <div className="event-overlay" role="presentation" onClick={g.dismissEvent}><section className="event-dialog" role="dialog" aria-modal="true" aria-label={tr('eventOutcome')} onClick={e => e.stopPropagation()}><EventBody event={event}/><button autoFocus onClick={g.dismissEvent}>{tr('continue')}</button></section></div>
}
