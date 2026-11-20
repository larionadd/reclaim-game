import { personalFor, type RelativeRecord } from '../data/npcPersonal'
import { t } from '../i18n'
import type { Lang } from '../types'

export function NpcPersonalDetails({ id, age, lang, consentAtSigning }: { id: string; age: number; lang: Lang; consentAtSigning: boolean }) {
  const data = personalFor(id), tr = (key: string) => t(lang, key)
  if (!data) return null
  const relative = (record: RelativeRecord) => record.state === 'none' ? tr('relativeNone') : record.state === 'unknown' ? tr('relativeUnknown') : record.people.map(p => `${p.name[lang]} · ${p.age} ${tr('yearsOld')}`).join(', ')
  return <section className="npc-personal"><h3>{tr('personalDetails')}</h3><div className="personal-rows"><div><span>{tr('age')}</span><strong>{age} {tr('yearsOld')}</strong></div><div><span>{tr('orientation')}</span><strong>{tr(`orientation_${data.orientation}`)}</strong></div><div><span>{tr('maritalStatus')}</span><strong>{tr(`marital_${data.maritalStatus}`)}</strong></div><div><span>{tr('mother')}</span><strong>{relative(data.relatives.mother)}</strong></div><div><span>{tr('father')}</span><strong>{relative(data.relatives.father)}</strong></div><div><span>{tr('children')}</span><strong>{relative(data.relatives.children)}</strong></div><div><span>{tr('modificationAtSigning')}</span><strong>{tr(consentAtSigning ? 'consentYes' : 'consentNo')}</strong></div></div></section>
}
