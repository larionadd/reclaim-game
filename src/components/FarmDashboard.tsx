import { ArrowRight, Beef, Bird, Clock3, PawPrint, Sun, Sunrise, Sunset, Moon, Wheat } from 'lucide-react'
import { candidates } from '../data/candidates'
import { sellableGoods } from '../data/goods'
import { useGame } from '../store/game'
import { t } from '../i18n'
import { displayName } from '../mechanics/npcIdentity'
import { Portrait } from './Portrait'
import type { Job, Phase } from '../types'

const phases: Phase[] = ['morning', 'day', 'evening', 'night']

export function FarmDashboard({ openManor, openPeople }: { openManor: () => void; openPeople: () => void }) {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  const staff = candidates.filter(c => g.workers[c.id]?.alive && g.workers[c.id]?.active && g.vetDoctorId !== c.id)
  return <div className="farm-page">
    <section className="farm-hero" aria-label={tr('farmName')}><div className="farm-hero-content"><div className="hero-kicker">{tr('myEnterprise')}</div><h1>{tr('farmName')}</h1><p>{tr('farmSubline')}</p></div></section>
    <div className="operation-band"><div className="herd-stats">
      <Stat icon={<Beef/>} label={tr('cattle')} value={g.livestock.cattle} unit={tr('heads')}/>
      <Stat icon={<PawPrint/>} label={tr('sheep')} value={g.livestock.sheep} unit={tr('heads')}/>
      <Stat icon={<Bird/>} label={tr('chickens')} value={g.livestock.chickens} unit={tr('heads')}/>
      <Stat icon={<Wheat/>} label={tr('animalFeed')} value={g.feedDays} unit={tr('daysReserve')}/>
    </div><div className="cycle-box"><div className="band-title">{tr('dailyCycle')}</div><div className="cycle-steps">{phases.map(phase => <div className={`cycle-step ${g.phase === phase ? 'active' : ''}`} key={phase}><span>{phase === 'morning' ? <Sunrise/> : phase === 'day' ? <Sun/> : phase === 'evening' ? <Sunset/> : <Moon/>}</span><strong>{tr(phase)}</strong><small>{tr(`${phase}Desc`)}</small></div>)}</div></div></div>
    <div className="farm-focus-grid"><section className="farm-panel"><header><h2>{tr('farmWorkers')}</h2><span>{staff.length}</span></header>{!staff.length && <div className="farm-empty"><p>{tr('farmNeedWorker')}</p><button onClick={openManor}>{tr('goToComputer')} <ArrowRight size={15}/></button></div>}{staff.map(c => { const w = g.workers[c.id]; return <div className="farm-worker-row" key={c.id}><button className="farm-worker-person" onClick={openPeople}><div className="farm-worker-portrait"><Portrait person={c} lang={g.lang}/></div><span><strong>{displayName(c,g.lang,w.nickname)}</strong><small>{tr('health')}: {w.health}% · {tr('traits')}: {w.traits.length}</small></span></button><label>{tr('farmAssignment')}<select value={g.assignments[c.id] ?? 'rest'} disabled={g.phase !== 'morning' || (w.injuredUntilDay ?? 0) > g.day} onChange={e => g.assign(c.id,e.target.value as Job)}><option value="production">{tr('farmWork')}</option><option value="maintenance">{tr('maintenance')}</option><option value="rest">{tr('rest')}</option>{w.medicalEffects?.oviposition && <option value="layEggs">{tr('layEggs')}</option>}{w.medicalEffects?.lactation && <option value="milking">{tr('milking')}</option>}</select></label></div> })}</section>
    <section className="farm-panel"><header><h2>{tr('farmWarehouse')}</h2><span>{tr('farmProduceHint')}</span></header><div className="farm-produce-grid">{sellableGoods.map(good => <article key={good}><img src={`${import.meta.env.BASE_URL}art/goods/${good}.webp`} alt=""/><div><strong>{tr(good)}</strong><span>{g.stocks[good]} {tr('units')}</span></div></article>)}</div><button className="farm-market-link" onClick={openManor}>{tr('sellViaComputer')} <ArrowRight size={16}/></button></section></div>
    <div className="farm-bottom"><div><Wheat size={20}/><span>{tr('feedNeeded')}: <b>{g.feedDays} {tr('daysReserve')}</b></span><button onClick={openManor}>{tr('buyFeed')}</button></div><div><Clock3 size={20}/><span>{tr(g.message)}</span><button onClick={g.advance}>{tr('nextPhase')} <ArrowRight size={15}/></button></div></div>
  </div>
}
function Stat({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: number; unit: string }) { return <div className="herd-stat"><div>{icon}</div><span>{label}</span><strong>{value} <small>{unit}</small></strong></div> }
