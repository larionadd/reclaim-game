import { candidates } from '../data/candidates'
import { displayName } from '../mechanics/npcIdentity'
import { useGame, type GameEvent } from '../store/game'
import { t } from '../i18n'
import { eventMarker } from '../mechanics/interactions'

function EventBody({ event }: { event: GameEvent }) {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  const person = candidates.find(c => c.id === event.workerId)
  const name = person ? displayName(person, g.lang, g.workers[event.workerId]?.nickname) : event.workerId
  return <><span className="event-meta">{tr('dayLabel')} {event.day} · {tr(event.phase)} · {name}</span><h3><span aria-hidden="true">{eventMarker(event.action)}</span> {tr(event.action)}</h3><p>{tr(event.storyKey)}</p><div className="event-deltas">{Object.entries(event.changes).length ? Object.entries(event.changes).map(([key, value]) => <span className={value < 0 ? 'negative' : 'positive'} key={key}>{tr(key)} {value > 0 ? '+' : ''}{value}{['money','savings'].includes(key) ? ' ₴' : ''}</span>) : <span>{tr('noStatChange')}</span>}</div></>
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
