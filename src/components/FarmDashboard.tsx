import { ArrowRight, Beef, Bird, Clock3, Sun, Sunrise, Sunset, Moon, Wheat } from 'lucide-react'
import { candidates } from '../data/candidates'
import { sellableGoods } from '../data/goods'
import { useGame } from '../store/game'
import { t } from '../i18n'
import { displayName } from '../mechanics/npcIdentity'
import { Portrait } from './Portrait'
import { hasUnfittedLimb } from '../mechanics/mobility'
import { WorkplaceVisit } from './WorkplaceVisit'
import type { Phase } from '../types'
import { AssignmentSelect } from './AssignmentSelect'

const phases: Phase[] = ['morning', 'day', 'evening', 'night']

export function FarmDashboard({ openSmartphone, openPeople, workplaceWorkerId, closeWorkplace }: { openSmartphone: (tab?: 'inbox' | 'shop' | 'market') => void; openPeople: () => void; workplaceWorkerId?: string | null; closeWorkplace?: () => void }) {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  const staff = candidates.filter(c => g.workers[c.id]?.alive && g.workers[c.id]?.active && g.vetDoctorId !== c.id && g.officeCagedNpcId !== c.id && ['production','layEggs','milking'].includes(g.assignments[c.id]))
  const farmWorkerPresent = staff.some(c => g.assignments[c.id] === 'production')
  const producedGoods = sellableGoods.filter(good => good === 'girlEggs' ? staff.some(c => g.assignments[c.id] === 'layEggs' && g.workers[c.id].medicalEffects?.oviposition) : good === 'girlMilk' ? staff.some(c => g.assignments[c.id] === 'milking' && g.workers[c.id].medicalEffects?.lactation) : good === 'eggs' ? farmWorkerPresent && g.livestock.chickens > 0 && g.feedStock.chickens > 0 : good === 'meat' ? farmWorkerPresent && g.livestock.pigs > 0 && g.feedStock.pigs > 0 : farmWorkerPresent && g.livestock.cattle > 0 && g.feedStock.cattle > 0)
  return <div className="farm-page">
    <section className="farm-hero" aria-label={tr('farmName')}><div className="farm-hero-content"><div className="hero-kicker">{tr('myEnterprise')}</div><h1>{tr('farmName')}</h1><p>{producedGoods.length ? producedGoods.map(good => tr(good)).join(' · ') : tr('farmNoProduction')}</p></div></section>
    <div className="operation-band"><div className="herd-stats">
      <Stat icon={<Bird/>} label={tr('chickens')} value={g.livestock.chickens} unit={tr('heads')}/>
      <Stat icon={<Beef/>} label={tr('pigs')} value={g.livestock.pigs} unit={tr('heads')}/>
      <Stat icon={<Beef/>} label={tr('cattle')} value={g.livestock.cattle} unit={tr('heads')}/>
      <Stat icon={<Wheat/>} label={tr('chickenFeed')} value={g.feedStock.chickens} unit={tr('units')}/>
      <Stat icon={<Wheat/>} label={tr('pigFeed')} value={g.feedStock.pigs} unit={tr('units')}/>
      <Stat icon={<Wheat/>} label={tr('cowFeed')} value={g.feedStock.cattle} unit={tr('units')}/>
    </div><div className="cycle-box"><div className="band-title">{tr('dailyCycle')}</div><div className="cycle-steps">{phases.map(phase => <div className={`cycle-step ${g.phase === phase ? 'active' : ''}`} key={phase}><span>{phase === 'morning' ? <Sunrise/> : phase === 'day' ? <Sun/> : phase === 'evening' ? <Sunset/> : <Moon/>}</span><strong>{tr(phase)}</strong><small>{tr(`${phase}Desc`)}</small></div>)}</div></div></div>
    <div className="farm-focus-grid"><section className="farm-panel"><header><h2>{tr('farmWorkers')}</h2><span>{staff.length}</span></header>{!staff.length && <div className="farm-empty"><p>{tr('farmNeedWorker')}</p><button onClick={() => openSmartphone('inbox')}>{tr('goToComputer')} <ArrowRight size={15}/></button></div>}{staff.map(c => { const w = g.workers[c.id]; return <div className="farm-worker-row" key={c.id}><button className="farm-worker-person" onClick={openPeople}><div className="farm-worker-portrait"><Portrait person={c} lang={g.lang}/></div><span><strong>{displayName(c,g.lang,w.nickname)}</strong><small>{tr('health')}: {w.health}% · {tr('traits')}: {w.traits.length}</small>{hasUnfittedLimb(w) && <small className="farm-special-role">{tr('unfittedCannotWork')}</small>}{(g.assignments[c.id] === 'layEggs' || g.assignments[c.id] === 'milking') && <small className="farm-special-role">{tr(g.assignments[c.id])} · 2 {tr('units')} / {tr('shift')}</small>}</span></button><label>{tr('farmAssignment')}<AssignmentSelect id={c.id}/></label></div> })}</section>
    <section className="farm-panel"><header><h2>{tr('farmWarehouse')}</h2><span>{tr('farmProduceHint')}</span></header><div className="farm-produce-grid">{producedGoods.map(good => <article key={good}><img src={`${import.meta.env.BASE_URL}art/goods/${good}.webp`} alt=""/><div><strong>{tr(good)}</strong><span>{g.stocks[good]} {tr('units')}</span></div></article>)}</div>{!producedGoods.length && <p>{tr('farmNoProduction')}</p>}<button className="farm-market-link" onClick={() => openSmartphone('market')}>{tr('sellViaComputer')} <ArrowRight size={16}/></button></section></div>
    <div className="farm-bottom"><div><Wheat size={20}/><span>{tr('feedNeeded')}: <b>{g.feedStock.chickens + g.feedStock.pigs + g.feedStock.cattle} {tr('units')}</b></span><button onClick={() => openSmartphone('shop')}>{tr('buyFeed')}</button></div><div><Clock3 size={20}/><span>{tr(g.message)}</span><button onClick={g.advance}>{tr('nextPhase')} <ArrowRight size={15}/></button></div></div>
    {workplaceWorkerId && closeWorkplace && <WorkplaceVisit workerId={workplaceWorkerId} onClose={closeWorkplace}/>}
  </div>
}
function Stat({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: number; unit: string }) { return <div className="herd-stat"><div>{icon}</div><span>{label}</span><strong>{value} <small>{unit}</small></strong></div> }
