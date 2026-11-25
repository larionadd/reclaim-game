import type { Candidate, Lang } from '../types'
import { currentLocation, useGame } from '../store/game'
import { yuliaPortrait } from '../mechanics/yuliaPortrait'
import { dianaPortrait } from '../mechanics/dianaPortrait'
import { polinaPortrait } from '../mechanics/polinaPortrait'
import { t } from '../i18n'

const portraitVariants: Record<string, { dirty: string; sleepwear: string; dirtyUnderwear: string }> = {
  sofia: { dirty: '/art/portraits/sofia-dirty-work.webp', sleepwear: '/art/portraits/sofia-sleepwear.webp', dirtyUnderwear: '/art/portraits/sofia-dirty-underwear.webp' },
  vira: { dirty: '/art/portraits/vira-dirty-work.webp', sleepwear: '/art/portraits/vira-sleepwear.webp', dirtyUnderwear: '/art/portraits/vira-dirty-underwear.webp' },
}

export function Portrait({ person, lang, outfit = 'work', season = 'autumn', status = 'active', profile = false, zoomable = false }: {
  person: Candidate; lang: Lang; outfit?: 'work' | 'civilian' | 'sleepwear'; season?: 'autumn' | 'winter'; status?: 'active' | 'rest'; profile?: boolean; zoomable?: boolean
}) {
  const [zoomed, setZoomed] = useState(false)
  const phase = useGame(state => state.phase)
  const job = useGame(state => state.assignments[person.id])
  const worker = useGame(state => state.workers[person.id])
  const vet = useGame(state => state.vetDoctorId === person.id)
  const inDogCrate = useGame(state => state.officeCagedNpcId === person.id)
  const working = useGame(state => !!state.workers[person.id]?.active)
  const clothing = useGame(state => state.workers[person.id]?.clothing)
  const housing = useGame(state => state.workers[person.id]?.housing)
  const firstArrivalDay = useGame(state => state.workers[person.id]?.firstArrivalDay)
  const currentDay = useGame(state => state.day)
  const operations = useGame(state => state.workers[person.id]?.operations)
  const inOwnCage = profile && !!worker?.active && worker.arrivalDay === undefined && worker.housing === 'cage' && !worker.punishedInCage && !worker.punishedKneeling && !inDogCrate && currentLocation(worker, phase, job, currentDay, vet, inDogCrate) === 'cage'
  const variants = portraitVariants[person.id]
  const dariaOperationImage = person.id === 'daria'
    ? operations?.some(op => op.id === 'breast_enlargement' && op.outcome === 'success')
      ? '/art/portraits/daria-enlargement.jpg'
      : operations?.some(op => op.id === 'lactation_hormones' && op.outcome === 'success')
        ? '/art/portraits/daria-lactation.jpg'
        : null
    : null
  const image = (person.id === 'yulia' ? inOwnCage ? phase === 'morning' ? '/art/portraits/yulia-cage-morning.png' : '/art/portraits/yulia-cage.png' : yuliaPortrait(currentDay, firstArrivalDay, clothing, operations) : person.id === 'diana' ? dianaPortrait(currentDay, firstArrivalDay, working, housing, operations, inOwnCage) : person.id === 'polina' ? inOwnCage ? '/art/portraits/polina-cage.png' : polinaPortrait(currentDay, operations) : null) ?? dariaOperationImage ?? (variants && outfit === 'sleepwear'
    ? working && job && job !== 'rest' && (phase === 'evening' || phase === 'night') ? variants.dirtyUnderwear : variants.sleepwear
    : variants && outfit === 'work' && working && job && job !== 'rest' && (phase === 'day' || phase === 'evening') ? variants.dirty
      : person.image)
  const imageUrl = `${import.meta.env.BASE_URL}${image.replace(/^\//, '')}`
  return <><div className={`portrait-stack season-${season} status-${status}${zoomable ? ' portrait-zoomable' : ''}`} role={zoomable ? 'button' : 'img'} tabIndex={zoomable ? 0 : undefined} aria-label={person.name[lang]} onClick={zoomable ? () => setZoomed(true) : undefined} onKeyDown={zoomable ? event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setZoomed(true) } } : undefined}>
    <img className="portrait-base" src={imageUrl} alt="" />
    {outfit === 'work' && person.image.endsWith('.svg') && <img className="portrait-outfit" src={`${import.meta.env.BASE_URL}portraits/workwear.svg`} alt="" />}
    {season === 'winter' && <span className="portrait-weather" aria-hidden="true">❄</span>}
    <span className="portrait-status" aria-hidden="true" />
  </div>{zoomed && createPortal(<div className="portrait-lightbox" role="dialog" aria-modal="true" aria-label={person.name[lang]} onClick={() => setZoomed(false)}><button className="portrait-lightbox-close" autoFocus aria-label={t(lang, 'close')} onClick={() => setZoomed(false)}>×</button><img src={imageUrl} alt={person.name[lang]} onClick={event => event.stopPropagation()}/></div>, document.body)}</>
}
import { useState } from 'react'
import { createPortal } from 'react-dom'
