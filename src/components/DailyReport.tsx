import { candidates } from '../data/candidates'
import { sellableGoods } from '../data/goods'
import { displayName } from '../mechanics/npcIdentity'
import { useGame } from '../store/game'
import { t } from '../i18n'

export function DailyReport() {
  const g = useGame(), report = g.lastReport, tr = (key: string) => t(g.lang, key)
  if (!report || !g.reportPending) return null
  const goods = sellableGoods.filter(good => (report.producedGoods?.[good] ?? 0) > 0)
  return <div className="daily-report-overlay"><section className="daily-report" role="dialog" aria-modal="true" aria-labelledby="daily-report-title">
    <header><span>{tr('endOfDay')}</span><h2 id="daily-report-title">{tr('dailyReport')} · {tr('dayLabel')} {report.day}</h2></header>
    <div className="report-overview">
      <div><span>{tr('reportProduction')}</span><strong>{report.produced}</strong></div>
      <div><span>{tr('reportSales')}</span><strong>{report.sales} ₴</strong></div>
      <div><span>{tr('animalFeed')}</span><strong>{report.feedBefore} → {report.feedAfter} {tr('feedUnits')}</strong></div>
      <div><span>{tr('money')}</span><strong>{report.moneyBefore} → {report.moneyAfter} ₴</strong></div>
    </div>
    <section className="report-section"><h3>{tr('reportGoodsProduced')}</h3>{goods.length ? <div className="report-goods">{goods.map(good => <span key={good}>{tr(good)} <b>+{report.producedGoods[good]}</b></span>)}</div> : <p>{tr('reportNoGoods')}</p>}{report.dronesProduced > 0 && <p>{tr('drones')}: +{report.dronesProduced}</p>}{report.feedByTypeBefore && report.feedByTypeAfter && <p>{tr('chickenFeed')}: {report.feedByTypeBefore.chickens} → {report.feedByTypeAfter.chickens} · {tr('pigFeed')}: {report.feedByTypeBefore.pigs} → {report.feedByTypeAfter.pigs} · {tr('cowFeed')}: {report.feedByTypeBefore.cattle} → {report.feedByTypeAfter.cattle}</p>}<p>{tr('foodRemaining')}: {tr('bread')} {report.foodAfter.bread} · {tr('lard')} {report.foodAfter.lard}{report.vetIncome ? ` · ${tr('vetIncome')}: ${report.vetIncome} ₴` : ''}</p></section>
    <section className="report-section"><h3>{tr('people')}</h3>{report.workers.length ? <div className="report-workers">{report.workers.map(row => { const person = candidates.find(c => c.id === row.id); return <article key={row.id}><strong>{person ? displayName(person, g.lang, g.workers[row.id]?.nickname) : row.id}</strong><span className={row.healthAfter < row.healthBefore ? 'report-loss' : ''}>{tr('health')}: {row.healthBefore}% → {row.healthAfter}%</span>{row.debaucheryAfter !== row.debaucheryBefore && <span>{tr('debauchery')}: {row.debaucheryBefore} → {row.debaucheryAfter}</span>}<small>{row.paid ? `${tr('paid')}: ${row.paid} ₴` : `${tr('foodOnly')}: ${row.calories ?? 0}/${row.calorieNeed ?? 0} ${tr('kcal')}`}</small>{row.statuses?.length > 0 && <div className="report-statuses">{row.statuses.map(status => <span key={status}>{tr(status)}</span>)}</div>}<ul>{row.reasons.map(reason => <li key={reason}>{tr(reason)}</li>)}</ul></article> })}</div> : <p>{tr('reportNoWorkers')}</p>}</section>
    <button className="report-continue" autoFocus onClick={g.dismissReport}>{tr('continue')}</button>
  </section></div>
}
