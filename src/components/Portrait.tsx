import type { Candidate, Lang } from '../types'

export function Portrait({ person, lang, outfit = 'work', season = 'autumn', status = 'active' }: {
  person: Candidate; lang: Lang; outfit?: 'work' | 'civilian'; season?: 'autumn' | 'winter'; status?: 'active' | 'rest'
}) {
  return <div className={`portrait-stack season-${season} status-${status}`} role="img" aria-label={person.name[lang]}>
    <img className="portrait-base" src={`${import.meta.env.BASE_URL}${person.image.replace(/^\//, '')}`} alt="" />
    {outfit === 'work' && person.image.endsWith('.svg') && <img className="portrait-outfit" src={`${import.meta.env.BASE_URL}portraits/workwear.svg`} alt="" />}
    {season === 'winter' && <span className="portrait-weather" aria-hidden="true">❄</span>}
    <span className="portrait-status" aria-hidden="true" />
  </div>
}
