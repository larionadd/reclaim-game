import type { Candidate, Lang } from '../types'
import { useGame } from '../store/game'
import { yuliaPortrait } from '../mechanics/yuliaPortrait'

const portraitVariants: Record<string, { dirty: string; sleepwear: string; dirtyUnderwear: string }> = {
  sofia: { dirty: '/art/portraits/sofia-dirty-work.webp', sleepwear: '/art/portraits/sofia-sleepwear.webp', dirtyUnderwear: '/art/portraits/sofia-dirty-underwear.webp' },
  vira: { dirty: '/art/portraits/vira-dirty-work.webp', sleepwear: '/art/portraits/vira-sleepwear.webp', dirtyUnderwear: '/art/portraits/vira-dirty-underwear.webp' },
}

export function Portrait({ person, lang, outfit = 'work', season = 'autumn', status = 'active' }: {
  person: Candidate; lang: Lang; outfit?: 'work' | 'civilian' | 'sleepwear'; season?: 'autumn' | 'winter'; status?: 'active' | 'rest'
}) {
  const phase = useGame(state => state.phase)
  const job = useGame(state => state.assignments[person.id])
  const working = useGame(state => !!state.workers[person.id]?.active)
  const clothing = useGame(state => state.workers[person.id]?.clothing)
  const firstArrivalDay = useGame(state => state.workers[person.id]?.firstArrivalDay)
  const currentDay = useGame(state => state.day)
  const operations = useGame(state => state.workers[person.id]?.operations)
  const variants = portraitVariants[person.id]
  const dariaOperationImage = person.id === 'daria'
    ? operations?.some(op => op.id === 'breast_enlargement' && op.outcome === 'success')
      ? '/art/portraits/daria-enlargement.jpg'
      : operations?.some(op => op.id === 'lactation_hormones' && op.outcome === 'success')
        ? '/art/portraits/daria-lactation.jpg'
        : null
    : null
  const image = (person.id === 'yulia' ? yuliaPortrait(currentDay, firstArrivalDay, clothing, operations) : null) ?? dariaOperationImage ?? (variants && outfit === 'sleepwear'
    ? working && job && job !== 'rest' && (phase === 'evening' || phase === 'night') ? variants.dirtyUnderwear : variants.sleepwear
    : variants && outfit === 'work' && working && job && job !== 'rest' && (phase === 'day' || phase === 'evening') ? variants.dirty
      : person.image)
  return <div className={`portrait-stack season-${season} status-${status}`} role="img" aria-label={person.name[lang]}>
    <img className="portrait-base" src={`${import.meta.env.BASE_URL}${image.replace(/^\//, '')}`} alt="" />
    {outfit === 'work' && person.image.endsWith('.svg') && <img className="portrait-outfit" src={`${import.meta.env.BASE_URL}portraits/workwear.svg`} alt="" />}
    {season === 'winter' && <span className="portrait-weather" aria-hidden="true">❄</span>}
    <span className="portrait-status" aria-hidden="true" />
  </div>
}
