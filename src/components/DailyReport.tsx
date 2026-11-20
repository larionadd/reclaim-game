import { candidates } from '../data/candidates'
import { displayName } from '../mechanics/npcIdentity'
import { useGame } from '../store/game'
import { t } from '../i18n'

export function DailyReport() {
  const g = useGame(), report = g.lastReport, tr = (key: string) => t(g.lang, key)
  if (!report) return null
  return <section className="daily-report"><h2>{tr('dailyReport')} · {tr('dayLabel')} {report.day}</h2><p>{tr('reportProduction')}: {report.produced} · {tr('reportSales')}: {report.sales} ₴</p><div className="report-workers">{report.workers.map(row => { const person = candidates.find(c => c.id === row.id); return <article key={row.id}><strong>{person ? displayName(person, g.lang, g.workers[row.id]?.nickname) : row.id}</strong><span className={row.healthAfter < row.healthBefore ? 'report-loss' : ''}>{tr('health')}: {row.healthBefore}% → {row.healthAfter}%</span><small>{row.paid ? `${tr('paid')}: ${row.paid} ₴` : `${tr('foodOnly')}: ${row.eaten}`}</small><ul>{row.reasons.map(reason => <li key={reason}>{tr(reason)}</li>)}</ul></article> })}</div></section>
}
