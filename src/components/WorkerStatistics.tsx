import type { Candidate, Lang } from '../types'
import type { Worker } from '../store/game'
import { useGame } from '../store/game'
import { t } from '../i18n'

export function WorkerStatistics({ candidate, worker, day, lang }: { candidate: Candidate; worker: Worker; day: number; lang: Lang }) {
  const setNickname = useGame(s => s.setNickname)
  const tr = (key: string) => t(lang, key)
  const days = Math.max(0, Math.min(day, worker.lastDayOnSite ?? day, worker.contractEndsDay ?? day) - worker.hiredOnDay + 1)
  const rows = [
    ['height', `${worker.body.heightCm} ${tr('cm')}`],
    ['weight', `${worker.body.weightKg.toFixed(2)} ${tr('kg')}`],
    ['chest', `${worker.body.chestCm.toFixed(2)} ${tr('cm')}`],
    ['waist', `${worker.body.waistCm.toFixed(2)} ${tr('cm')}`],
    ['hips', `${worker.body.hipsCm.toFixed(2)} ${tr('cm')}`]
  ]
  return <div className="worker-statistics">
    <section className="worker-stat-card"><h3>{tr('nickname')}</h3><label>{tr('nicknameHint')}<input maxLength={24} value={worker.nickname} placeholder={candidate.name[lang]} onChange={e => setNickname(candidate.id, e.target.value)}/></label><small>{tr('legalName')}: {candidate.name[lang]}</small></section>
    <section className="worker-stat-card"><h3>{tr('bodyParameters')}</h3><div className="worker-stat-rows">{rows.map(([key, value]) => <div key={key}><span>{tr(key)}</span><strong>{value}</strong></div>)}</div><small>{tr('measurementsHint')}</small></section>
    <section className="worker-stat-card"><h3>{tr('sexStatistics')}</h3><div className="worker-stat-rows"><div><span>{tr('conventionalSex')}</span><strong>{worker.sexCounts?.conventional ?? 0}</strong></div><div><span>{tr('oralSex')}</span><strong>{worker.sexCounts?.oral ?? 0}</strong></div><div><span>{tr('analSex')}</span><strong>{worker.sexCounts?.anal ?? 0}</strong></div></div></section>
    <section className="worker-stat-card"><h3>{tr('npcStates')}</h3><div className="worker-stat-rows"><div><span>{tr('clothingState')}</span><strong>{tr(worker.clothing === 'unclothed' ? 'unclothed' : 'clothed')}</strong></div><div><span>{tr('analItemState')}</span><strong>{worker.analItem ? tr(worker.analItem) : tr('none')}</strong></div><div><span>{tr('handcuffsState')}</span><strong>{tr(worker.handcuffed ? 'handcuffed' : 'notHandcuffed')}</strong></div></div></section>
    <section className="worker-stat-card"><h3>{tr('intimacyInjury')}</h3><div className="worker-stat-rows"><div><span>{tr('oralInjury')}</span><strong>{worker.intimacyInjury?.oral ?? 0}%</strong></div><div><span>{tr('analInjury')}</span><strong>{worker.intimacyInjury?.anal ?? 0}%</strong></div><div><span>{tr('vaginalInjury')}</span><strong>{worker.intimacyInjury?.vaginal ?? 0}%</strong></div></div></section>
    <section className="worker-stat-card"><h3>{tr('financialHistory')}</h3><div className="worker-stat-rows"><div><span>{tr('earnedForPlayer')}</span><strong>{worker.totalEarnedForPlayer} ₴</strong></div><div><span>{tr('receivedFromPlayer')}</span><strong>{worker.totalReceivedFromPlayer} ₴</strong></div><div><span>{tr('savings')}</span><strong>{worker.savings} ₴</strong></div></div></section>
    <section className="worker-stat-card"><h3>{tr('contractHistory')}</h3><div className="worker-stat-rows"><div><span>{tr('daysHere')}</span><strong>{days}</strong></div><div><span>{tr('contractTerm')}</span><strong>{worker.contractTerm === 'lifetime' ? tr('lifetime') : `${worker.contractTerm} ${tr('days')}`}</strong></div><div><span>{tr('contractEnd')}</span><strong>{worker.contractEndsDay === null ? tr('noEndDate') : `${tr('dayLabel')} ${worker.contractEndsDay}`}</strong></div><div><span>{tr('contractStatus')}</span><strong>{worker.active ? tr('contractActive') : tr('contractCompleted')}</strong></div></div></section>
  </div>
}
