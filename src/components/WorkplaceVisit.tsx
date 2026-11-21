import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { candidates } from '../data/candidates'
import { displayName } from '../mechanics/npcIdentity'
import { canVisitWorkplace, workplaceActions, workplaceImages, workplaceLocation } from '../mechanics/workplace'
import { useGame } from '../store/game'
import { t } from '../i18n'
import { Portrait } from './Portrait'

export function WorkplaceVisit({ workerId, onClose }: { workerId: string; onClose: () => void }) {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  const person = candidates.find(c => c.id === workerId), worker = g.workers[workerId], job = g.assignments[workerId]
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  if (!person || !canVisitWorkplace(worker, job, g.day, g.phase, g.vetDoctorId === workerId) || !job || job === 'rest') return null
  const location = workplaceLocation[job]
  return <div className="workplace-overlay" role="presentation" onClick={onClose}><section className="workplace-dialog" role="dialog" aria-modal="true" aria-label={tr('workplaceVisit')} onClick={event => event.stopPropagation()}>
    <header><div><span>{tr('workplaceVisit')}</span><h2>{location.name[g.lang]}</h2></div><button ref={closeRef} onClick={onClose} aria-label={tr('closeWorkplace')}><X size={21}/></button></header>
    <div className="workplace-scene"><img src={`${import.meta.env.BASE_URL}${location.image.replace(/^\//, '')}`} alt=""/><div className="workplace-person"><Portrait person={person} lang={g.lang}/><span><strong>{displayName(person, g.lang, worker.nickname)}</strong><small>{tr(job)}</small></span></div></div>
    <p>{tr('workplaceSceneIntro')}</p>
    <div className="workplace-action-grid">{workplaceActions.map(action => { const used = action === 'inspectWork' ? worker.workplaceInspectedDay === g.day : worker.workplaceResponseDay === g.day; return <button key={action} disabled={used} onClick={() => { g.workplaceAction(workerId, action); if (action === 'giveDayOff') onClose() }}><img src={`${import.meta.env.BASE_URL}${workplaceImages[action].replace(/^\//, '')}`} alt=""/><span>{tr(action)}</span></button> })}</div>
  </section></div>
}
