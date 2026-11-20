import { useState } from 'react'
import { AlertTriangle, Banknote, BedDouble, CalendarDays, Droplets, Factory, HeartPulse, ShieldAlert, Target, Utensils } from 'lucide-react'
import { candidates } from '../data/candidates'
import goals from '../data/npcGoals.json'
import { farm, repairDepot, reconstructionPlant } from '../data/enterprises'
import { Portrait } from './Portrait'
import { useGame } from '../store/game'
import { t } from '../i18n'
import '../ConceptScreen.css'

export function ConceptScreen() {
  const g = useGame()
  const tr = (key: string) => t(g.lang, key)
  const [food, setFood] = useState(3)
  const [pay, setPay] = useState(12)
  const [contract, setContract] = useState<'paid' | 'foodOnly'>('paid')
  const person = candidates[0]
  const nextOffer = 30 - ((g.day - 1) % 30)

  return <div className="concept-screen">
    <div className="concept-intro"><div><div className="eyebrow">{tr('concept')} / {tr('enterprise')}</div><h2>{farm.name[g.lang]}</h2><p>{farm.description[g.lang]} {tr('moreEnterprises')}.</p></div><span className="concept-badge"><Factory size={16}/>{farm.kind[g.lang]}</span></div>
    <div className="concept-layout">
      <div className="concept-column">
        <section className="concept-panel enterprise-panel"><div className="panel-title"><Factory size={18}/><strong>{tr('management')}</strong></div><div className="enterprise-scene"/><div className="enterprise-list">{[farm, repairDepot, reconstructionPlant].map((e,i)=><div className={`enterprise-row ${i===0?'available':''}`} key={e.id}><span>{e.name[g.lang]}</span><small>{i===0?tr('active'):tr('future')}</small></div>)}</div></section>
        <section className="concept-panel"><div className="panel-title"><CalendarDays size={18}/><strong>{tr('monthly')}</strong></div><div className="monthly-number">{nextOffer} <span>{g.lang==='en'?'days':g.lang==='uk'?'днів':'дней'}</span></div><p>{tr('nextOffer')}: {tr('candidates')}. {tr('monthlyNote')}</p></section>
      </div>
      <div className="concept-column">
        <section className="concept-panel personnel-panel"><div className="panel-title"><span className="portrait-label-dot"/><strong>{tr('candidates')}</strong><small>01 / 04</small></div><div className="concept-person"><Portrait person={person} lang={g.lang}/><div className="concept-person-copy"><div className="eyebrow">{tr('portraitLayers')}</div><h3>{person.name[g.lang]}</h3><span>{person.role[g.lang]} · {person.age}</span><p>{person.bio[g.lang]}</p><div className="tags"><span>{tr('language')}: {person.language}</span><span>{tr('motivation')}: {person.motivation}</span></div></div></div><div className="layer-note">{tr('season')} · {tr('status')} · {tr('portraitLayers')}</div></section>
        <section className="concept-panel"><div className="panel-title"><Target size={18}/><strong>{tr('personalGoals')}</strong></div><div className="wallet-line"><span>{tr('personalSavings')}</span><strong>32 {tr('credits')}</strong></div>{goals[0].goals.map((goal, index)=><div className="goal-row" key={goal.id}><span>{goal.name[g.lang]}</span><small>{index===0?'24':'8'} / {goal.targetCredits} {tr('credits')}</small><div className="goal-meter"><i style={{width:`${Math.round((index===0?24:8)/goal.targetCredits*100)}%`}}/></div></div>)}<div className="medical-note"><HeartPulse size={15}/>{tr('medicalGrant')} · {tr('medicalGrantPreview')}</div></section>
        <section className="concept-panel"><div className="panel-title"><Utensils size={18}/><strong>{tr('conditions')}</strong></div><div className="setting-row"><div><Droplets size={17}/><span>{tr('food')}</span></div><strong>{food}</strong></div><input aria-label={tr('food')} type="range" min="0" max="5" value={food} onChange={e=>setFood(Number(e.target.value))}/><p className="setting-note">{tr('foodNote')}</p><div className="setting-row"><div><Banknote size={17}/><span>{tr('pay')}</span></div><strong>{contract==='paid'?pay:'—'}</strong></div><input aria-label={tr('pay')} type="range" min="0" max="30" value={pay} disabled={contract==='foodOnly'} onChange={e=>setPay(Number(e.target.value))}/><div className="choice-row"><button className={contract==='paid'?'chosen':''} onClick={()=>setContract('paid')}>{tr('paid')}</button><button className={contract==='foodOnly'?'chosen':''} onClick={()=>setContract('foodOnly')}>{tr('foodOnly')}</button></div></section>
      </div>
      <div className="concept-column">
        <section className="concept-panel"><div className="panel-title"><BedDouble size={18}/><strong>{tr('housing')}</strong></div><div className="housing-grid"><div className="housing-tile good"><b>01</b><span>{tr('room')}</span></div><div className="housing-tile good"><b>02</b><span>{tr('bunk')}</span></div><div className="housing-tile warning"><b>00</b><span>{tr('cell')}</span></div><div className="housing-tile warning"><b>00</b><span>{tr('cage')}</span></div></div><p className="setting-note warning-text"><AlertTriangle size={14}/>{tr('housingNote')}</p></section>
        <section className="concept-panel"><div className="panel-title"><ShieldAlert size={18}/><strong>{tr('safety')}</strong></div><div className="risk-row"><span>{tr('incidentRisk')}</span><strong>2.0%</strong></div><div className="risk-meter"><i style={{width:'20%'}}/></div><div className="risk-row"><span>{tr('fatalRisk')}</span><strong>0.05%</strong></div><div className="risk-meter danger"><i style={{width:'5%'}}/></div><p>{tr('preview')}</p></section>
      </div>
    </div>
  </div>
}
