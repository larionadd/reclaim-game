import { AlertTriangle, ArrowRight, BadgeCheck, Banknote, BedDouble, Beef, Bird, CalendarDays, Clock3, Coins, HeartPulse, Minus, Moon, PawPrint, Plus, ShieldCheck, Sun, Sunrise, Sunset, Target, Utensils, Wheat } from 'lucide-react'
import { candidates } from '../data/candidates'
import goals from '../data/npcGoals.json'
import { useGame } from '../store/game'
import { t } from '../i18n'
import type { Phase } from '../types'
import { Portrait } from './Portrait'

const phases: Phase[] = ['morning', 'day', 'evening', 'night']

export function FarmDashboard({ openDistribution, openPeople }: { openDistribution: () => void; openPeople: () => void }) {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  const featured = candidates.find(c => g.hired.includes(c.id) && g.workers[c.id]?.alive) ?? candidates[0]
  const worker = g.workers[featured.id]
  const daysUntilIntake = 30 - ((g.day - 1) % 30)
  const productive = Object.values(g.assignments).filter(job => job === 'production').length
  const risk = productive >= 2 ? 0.12 : productive === 1 ? 0.04 : 0.01
  const personGoals = goals.find(row => row.npcId === featured.id)?.goals ?? []

  return <>
    <section className="farm-hero" aria-label={tr('farmName')}>
      <div className="farm-hero-content"><div className="hero-kicker">{tr('myEnterprise')}</div><h1>{tr('farmName')}</h1><p>{tr('farmSubline')}</p><div className="hero-badges"><span><BadgeCheck size={15}/>{tr('firstEnterprise')}</span><span><ShieldCheck size={15}/>{tr('program')}</span></div></div>
    </section>

    <div className="operation-band">
      <div className="herd-stats">
        <Stat icon={<Beef size={26}/>} label={tr('cattle')} value={`${g.livestock.cattle}`} unit={tr('heads')} />
        <Stat icon={<PawPrint size={26}/>} label={tr('sheep')} value={`${g.livestock.sheep}`} unit={tr('heads')} />
        <Stat icon={<Bird size={26}/>} label={tr('chickens')} value={`${g.livestock.chickens}`} unit={tr('heads')} />
        <Stat icon={<Wheat size={26}/>} label={tr('animalFeed')} value={`${g.feedDays}`} unit={tr('daysReserve')} />
      </div>
      <div className="cycle-box"><div className="band-title">{tr('dailyCycle')}</div><div className="cycle-steps">{phases.map(phase => <div className={`cycle-step ${g.phase === phase ? 'active' : ''}`} key={phase}><span>{phase === 'morning' ? <Sunrise/> : phase === 'day' ? <Sun/> : phase === 'evening' ? <Sunset/> : <Moon/>}</span><strong>{tr(phase)}</strong><small>{tr(`${phase}Desc`)}</small></div>)}</div></div>
    </div>

    <div className="command-grid">
      <section className="command-card person-card">
        <Header icon={<Target size={21}/>} title={worker ? tr('worker') : tr('featuredCandidate')} action={<button className="icon-action" onClick={openPeople} aria-label={tr('people')}>›</button>}/>
        <div className="person-content"><div className="person-art"><Portrait person={featured} lang={g.lang} outfit="work" status={worker ? 'active' : 'rest'}/></div><div className="person-details"><h2>{featured.name[g.lang]}</h2><span>{featured.role[g.lang]} · {featured.age}</span><div className="person-rule"/><div className="person-metric"><HeartPulse size={15}/>{tr('health')} <strong>{worker ? worker.health : 76}%</strong></div><div className="person-metric"><BadgeCheck size={15}/>{tr('status')} <strong>{worker ? tr('onStaff') : tr('candidateStatus')}</strong></div><div className="person-metric"><Coins size={15}/>{tr('savings')} <strong>{worker ? worker.savings : 0} {tr('credits')}</strong></div><div className="person-metric"><Target size={15}/>{tr('personalGoals')} <strong>{personGoals.length}</strong></div></div></div>
        {worker ? <button className="card-cta" onClick={openPeople}>{tr('openPersonnel')} <ArrowRight size={16}/></button> : <button className="card-cta" onClick={openDistribution}>{tr('offer')} <ArrowRight size={16}/></button>}
      </section>

      <section className="command-card conditions-card">
        <Header icon={<Utensils size={21}/>} title={tr('rationAndPay')}/>
        <div className="condition-group"><label>{tr('food')}</label><div className="stepper"><button disabled={!worker} onClick={() => g.setRation(featured.id, (worker?.ration ?? 3) - 1)} aria-label={`${tr('decrease')} ${tr('food')}`}><Minus size={15}/></button><strong>{worker?.ration ?? 3} {tr('portions')}</strong><button disabled={!worker} onClick={() => g.setRation(featured.id, (worker?.ration ?? 3) + 1)} aria-label={`${tr('increase')} ${tr('food')}`}><Plus size={15}/></button></div><small>{tr('foodHint')}</small><div className="ration-items"><span><BadgeCheck size={13}/>{tr('rationGrain')}</span><span><BadgeCheck size={13}/>{tr('rationProtein')}</span><span><BadgeCheck size={13}/>{tr('rationVegetables')}</span></div></div>
        <div className="condition-group"><label>{tr('pay')}</label><div className="stepper"><button disabled={!worker || worker.contract === 'foodOnly'} onClick={() => g.setWage(featured.id, (worker?.wage ?? 12) - 1)} aria-label={`${tr('decrease')} ${tr('pay')}`}><Minus size={15}/></button><strong>{worker?.wage ?? 12} {tr('credits')}</strong><button disabled={!worker || worker.contract === 'foodOnly'} onClick={() => g.setWage(featured.id, (worker?.wage ?? 12) + 1)} aria-label={`${tr('increase')} ${tr('pay')}`}><Plus size={15}/></button></div><small>{tr('perShift')}</small></div>
        <div className="condition-summary"><Banknote size={17}/><span>{worker ? tr(worker.contract) : tr('contractPending')}</span></div>
      </section>

      <section className="command-card housing-card">
        <Header icon={<BedDouble size={21}/>} title={tr('housing')}/>
        <div className="housing-option"><div className="housing-icon"><img src={`${import.meta.env.BASE_URL}art/housing-room.webp`} alt=""/></div><div><strong>{tr('cage')}</strong><small>{tr('cageEffect')}</small></div><span>{Object.values(g.workers).filter(w => w.alive && w.housing === 'cage').length} / {g.cages}</span></div>
        <div className="housing-option"><div className="housing-icon"><img src={`${import.meta.env.BASE_URL}art/housing-bunk.webp`} alt=""/></div><div><strong>{tr('hut')}</strong><small>{tr('hutEffect')}</small></div><span>{Object.values(g.workers).filter(w => w.alive && w.housing === 'hut').length} / {g.huts * 2}</span></div>
        <div className="housing-capacity"><span>{tr('freePlaces')}</span><strong>{Math.max(0, g.staffCapacity - Object.values(g.workers).filter(w => w.alive).length )} / {g.staffCapacity}</strong></div>
        <p>{tr('housingRule')}</p>
        <button className="expand-housing" disabled={g.money < 180} onClick={g.expandHousing}>{tr('expandHousing')}</button>
      </section>

      <section className="command-card safety-card">
        <Header icon={<ShieldCheck size={21}/>} title={tr('workSafety')}/>
        <div className="checkline"><BadgeCheck size={19}/>{tr('protectiveGear')}<strong>{tr('issued')}</strong></div>
        <div className="checkline"><BadgeCheck size={19}/>{tr('equipmentCondition')}<strong>{tr('working')}</strong></div>
        <div className="checkline"><BadgeCheck size={19}/>{tr('veterinaryControl')}<strong>{tr('active')}</strong></div>
        <div className="checkline"><BadgeCheck size={19}/>{tr('biosecurity')}<strong>{tr('active')}</strong></div>
        <div className="risk-alert"><AlertTriangle size={21}/><div><strong>{tr('riskLevel')}: {risk < .05 ? tr('low') : tr('elevated')}</strong><small>{tr('incidentRisk')}: {(risk * 100).toFixed(1)}% · {tr('fatalRisk')}: {productive ? '0.1' : '0'}%</small></div></div>
      </section>
    </div>

    <div className="secondary-grid"><section className="secondary-card"><div className="secondary-title"><CalendarDays size={19}/>{tr('monthly')}</div><strong>{daysUntilIntake} {tr('days')}</strong><p>{tr('monthlyNote')}</p></section><section className="secondary-card"><div className="secondary-title"><Coins size={19}/>{tr('economy')}</div><div className="mini-stats"><span>{tr('output')}: <b>{g.output}</b></span><span>{tr('money')}: <b>{g.money} {tr('credits')}</b></span><span>{tr('foodStock')}: <b>{g.food}</b></span></div></section><section className="secondary-card"><div className="secondary-title"><Clock3 size={19}/>{tr('journal')}</div><p>{tr(g.message)}</p><button onClick={g.advance}>{tr('continue')} <ArrowRight size={16}/></button></section></div>
  </>
}

function Header({ icon, title, action }: { icon: React.ReactNode; title: string; action?: React.ReactNode }) { return <div className="card-header"><span>{icon}</span><strong>{title}</strong>{action}</div> }
function Stat({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string; unit: string }) { return <div className="herd-stat"><div>{icon}</div><span>{label}</span><strong>{value} <small>{unit}</small></strong></div> }
