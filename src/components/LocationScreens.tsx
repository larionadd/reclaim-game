import { useState } from 'react'
import { ArrowRight, Banknote, Coins, HeartPulse, ShieldAlert, Stethoscope, Target, Users } from 'lucide-react'
import { candidates } from '../data/candidates'
import procedures from '../data/medical/procedures.json'
import goals from '../data/npcGoals.json'
import { traits } from '../data/traits'
import { currentStatus, currentLocation, defaultRoutine, useGame, type Contract, type ContractTerm, type Housing, type RoutineActivity } from '../store/game'
import { displayName } from '../mechanics/npcIdentity'
import { WorkerStatistics } from './WorkerStatistics'
import { InjuryBanner } from './InjuryBanner'
import { FoodPlan } from './FoodPlan'
import { NpcPersonalDetails } from './NpcPersonalDetails'
import { NpcModificationPanel } from './NpcModificationPanel'
import { NpcEquipment } from './NpcEquipment'
import { letterFor } from '../data/candidateLetters'
import { ContractSettings } from './ContractSettings'
import { t } from '../i18n'
import type { Phase } from '../types'
import { AssignmentSelect } from './AssignmentSelect'
import { Portrait } from './Portrait'
import { canWorkAtFarm, hasUnfittedLimb } from '../mechanics/mobility'
import { operationSuccessChance } from '../mechanics/medicalOperations'
import { canVisitWorkplace } from '../mechanics/workplace'

export function DistributionScreen() {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = candidates.find(c => c.id === selectedId)
  return <div className="location-page"><div className="location-heading"><div><span>{tr('stateIntake')}</span><h1>{tr('desk')}</h1></div><div className="location-counter"><Users size={22}/>{g.hired.filter(id => g.workers[id]?.alive && (g.workers[id]?.active || g.workers[id]?.arrivalDay !== undefined)).length} / {g.staffCapacity}</div></div>
    <div className="candidate-list">{candidates.filter(c => c.availableFromDay <= g.day && !g.hired.includes(c.id)).map(c => { const hired = g.hired.includes(c.id), pending = g.workers[c.id]?.arrivalDay !== undefined, full = g.hired.filter(id => g.workers[id]?.alive && (g.workers[id]?.active || g.workers[id]?.arrivalDay !== undefined)).length >= g.staffCapacity; return <article className="candidate-row" key={c.id}><Portrait person={c} lang={g.lang}/><div className="candidate-row-copy"><div className="candidate-row-head"><div><h2>{displayName(c, g.lang, g.workers[c.id]?.nickname)}</h2><span>{c.age} {tr('yearsOld')}</span></div></div><p>{c.bio[g.lang]}</p><div className="candidate-row-tags"><span>{tr('height')}: {c.body.heightCm} {tr('cm')}</span><span>{tr('weight')}: {c.body.weightKg} {tr('kg')}</span><span>{tr('chest')}: {c.body.chestCm} {tr('cm')}</span><span>{tr('waist')}: {c.body.waistCm} {tr('cm')}</span><span>{tr('hips')}: {c.body.hipsCm} {tr('cm')}</span>{c.traits.map(id => <span key={id}>{traits[id]?.name[g.lang] ?? id}</span>)}</div>{letterFor(c.id) && <div className="candidate-letter"><strong>{tr('welcomeLetter')}</strong><p>{letterFor(c.id)?.letter[g.lang]}</p><small>{tr('desiredWage')}: {letterFor(c.id)?.requestedWage} ₴ / {tr('shift')}</small></div>}<div className="candidate-row-bottom"><button disabled={hired || full} onClick={() => setSelectedId(c.id)}>{hired ? tr(pending ? 'awaitingArrival' : 'onStaff') : full ? tr('full') : tr('offer')} <ArrowRight size={15}/></button></div></div></article> })}</div>
    {selected && <ContractOfferDialog key={selected.id} id={selected.id} onClose={() => setSelectedId(null)}/>} 
  </div>
}

function ContractOfferDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const g = useGame(), tr = (key: string) => t(g.lang, key), letter = letterFor(id)
  const [contract, setContract] = useState<Contract>('paid')
  const [term, setTerm] = useState<ContractTerm>(30)
  const [offer, setOffer] = useState(letter?.requestedWage ?? 12)
  const [modifications, setModifications] = useState(false)
  const [rejected, setRejected] = useState(false)
  const person = candidates.find(c => c.id === id)
  const submit = () => {
    if (contract === 'paid' && offer < (letter?.minimumWage ?? 8)) { setRejected(true); return }
    g.hire(id, contract, term, offer, modifications)
    if (useGame.getState().hired.includes(id)) onClose()
  }
  return <div className="contract-dialog-backdrop" onClick={onClose}><section className="contract-dialog" role="dialog" aria-modal="true" aria-label={tr('contractTerms')} onClick={e => e.stopPropagation()}><div className="contract-dialog-heading"><div><small>{tr('contractTerms')}</small><h2>{person ? displayName(person, g.lang) : id}</h2></div><button type="button" onClick={onClose} aria-label={tr('close')}>×</button></div><div className="contract-choice"><div><strong>{tr('contract')}</strong></div><button className={contract === 'paid' ? 'active' : ''} onClick={() => setContract('paid')}>{tr('paid')}</button><button className={contract === 'foodOnly' ? 'active' : ''} onClick={() => setContract('foodOnly')}>{tr('foodOnly')}</button></div><label className="contract-dialog-field">{tr('contractTerm')}<select value={term} onChange={e => setTerm(e.target.value === 'lifetime' ? 'lifetime' : Number(e.target.value) as 30 | 90)}><option value={30}>30 {tr('days')}</option><option value={90}>90 {tr('days')}</option><option value="lifetime">{tr('lifetime')}</option></select></label>{contract === 'paid' && <label className="contract-dialog-field">{tr('counterOffer')}<input type="number" min="0" max="30" value={offer} onChange={e => { setOffer(Math.max(0, Math.min(30, Math.floor(Number(e.target.value) || 0)))); setRejected(false) }}/></label>}<label className="contract-dialog-check"><input type="checkbox" checked={modifications} onChange={e => setModifications(e.target.checked)}/>{tr('contractModifications')}</label>{rejected && <p className="offer-rejected">{tr('offerRefused')}</p>}<div className="contract-dialog-actions"><button type="button" onClick={onClose}>{tr('cancel')}</button><button type="button" className="primary-action" onClick={submit}>{tr('confirmOffer')}</button></div></section></div>
}

export function PeopleScreen({ onCheckWorkplace }: { onCheckWorkplace: (id: string) => void }) {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [fineReason, setFineReason] = useState('')
  const staff = candidates.filter(c => g.hired.includes(c.id) && !!g.workers[c.id])
  const selected = staff.find(c => c.id === selectedId) ?? staff[0]
  const w = selected ? g.workers[selected.id] : undefined
  return <div className="location-page"><div className="location-heading"><div><span>{tr('personnel')}</span><h1>{tr('people')}</h1><p>{tr('peopleIntro')}</p></div><div className="location-counter"><Users size={22}/>{staff.filter(c => g.workers[c.id]?.alive && (g.workers[c.id]?.active || g.workers[c.id]?.arrivalDay !== undefined)).length} / {g.staffCapacity}</div></div>
    {!staff.length ? <div className="empty-location">{tr('hireFirst')}</div> : <div className="people-layout"><div className="people-list">{staff.map(c => <button key={c.id} className={selected?.id === c.id ? 'selected' : ''} onClick={() => setSelectedId(c.id)}><Portrait person={c} lang={g.lang}/><span><strong>{displayName(c, g.lang, g.workers[c.id]?.nickname)}</strong><small>{c.age} {tr('yearsOld')}</small></span><b>{!g.workers[c.id]?.alive ? tr('deceased') : g.workers[c.id].arrivalDay !== undefined ? tr('awaitingArrival') : !g.workers[c.id]?.active ? tr('contractCompleted') : g.workers[c.id].punishedInCage ? tr('statusInCage') : g.workers[c.id].punishedKneeling ? tr('statusKneeling') : g.officeCagedNpcId === c.id ? tr('statusInDogCrate') : (g.workers[c.id].injuredUntilDay ?? 0) > g.day ? tr('injured') : tr('onStaff')}</b></button>)}</div>{selected && w && <div className="person-sheet"><InjuryBanner worker={w} day={g.day} lang={g.lang}/><div className="person-sheet-top"><Portrait person={selected} lang={g.lang} profile zoomable/><div><span className="sheet-kicker">{tr('personnelFile')}</span><h2>{displayName(selected, g.lang, w.nickname)}</h2><p>{selected.bio[g.lang]}</p><div className="sheet-chips"><span><HeartPulse size={15}/>{w.health}%</span><span><Coins size={15}/>{w.savings} {tr('credits')}</span><span><Target size={15}/>{goals.find(row => row.npcId === selected.id)?.goals.length ?? 0} {tr('personalGoals')}</span>{(g.assignments[selected.id] === 'layEggs' || g.assignments[selected.id] === 'milking') && <span>{tr(g.assignments[selected.id])}</span>}</div></div></div><section className="npc-daily-settings"><label>{tr('assignment')}<AssignmentSelect id={selected.id}/></label>{w.contract === 'foodOnly' && <FoodPlan id={selected.id} worker={w} lang={g.lang}/>}</section><section className="routine-editor"><h3>{tr('npcSchedule')}</h3><p>{tr('currentLocation')}: {tr(currentLocation(w, g.phase, g.assignments[selected.id], g.day, g.vetDoctorId === selected.id, g.officeCagedNpcId === selected.id))} · {tr(currentStatus(w, g.phase, g.assignments[selected.id], g.day, g.officeCagedNpcId === selected.id))}</p><div className="routine-grid">{(['morning','day','evening','night'] as Phase[]).map(phase => <label key={phase}>{tr(phase)}<select value={w.routine?.[phase] ?? defaultRoutine[phase]} disabled={!w.alive || !w.active} onChange={e => g.setRoutine(selected.id, phase, e.target.value as RoutineActivity)}><option value="work">{tr('activity_work')}</option><option value="rest">{tr('activity_rest')}</option><option value="sleep">{tr('activity_sleep')}</option></select></label>)}</div></section><WorkerStatistics candidate={selected} worker={w} day={g.day} lang={g.lang}/><NpcPersonalDetails id={selected.id} age={selected.age} lang={g.lang} consentAtSigning={w.modificationConsentAtSigning}/>{hasUnfittedLimb(w) && <p className="mobility-warning">{tr('unfittedCannotMove')}</p>}<button className="check-workplace" disabled={g.officeCagedNpcId === selected.id || !canVisitWorkplace(w, g.assignments[selected.id], g.day, g.phase, g.vetDoctorId === selected.id)} onClick={() => onCheckWorkplace(selected.id)}>{tr('checkAtWorkplace')}</button><NpcEquipment id={selected.id} worker={w} lang={g.lang}/><div className="npc-profile-grid"><section><h3>{tr('backstory')}</h3><p>{selected.bio[g.lang]}</p></section><section><h3>{tr('traits')}</h3><div className="trait-chips">{w.traits.map(id => <span key={id}>{traits[id]?.name[g.lang] ?? id}</span>)}</div></section><section><h3>{tr('personalGoals')}</h3>{(goals.find(row => row.npcId === selected.id)?.goals ?? []).map(goal => <div className="goal-row" key={goal.id}><strong>{goal.name[g.lang]}</strong><span>{tr('goalProgress')}: {Math.min(w.savings, goal.targetCredits)} / {goal.targetCredits} ₴</span><progress max={goal.targetCredits} value={Math.min(w.savings, goal.targetCredits)}/></div>)}</section><section><h3>{tr('relations')}</h3><p>{tr('trustLevel')}: {w.trust}/100</p><progress max="100" value={w.trust}/><p>{tr('love')}: {w.love} · {tr('submission')}: {w.submission}</p><p>{tr('debauchery')}: {w.debauchery}</p><p>{tr('absenceCount')}: {w.absenceCount}</p></section><section><h3>{tr('operations')}</h3>{w.disabled && <p>{tr('permanentDisability')}</p>}{w.medicalEffects?.lactation && <p>{tr('effectLactation')}</p>}{w.medicalEffects?.oviposition && <p>{tr('effectOviposition')}</p>}{w.medicalEffects?.hair && w.medicalEffects.hair !== 'normal' && <p>{tr(w.medicalEffects.hair === 'growth' ? 'effectHairGrowth' : 'effectHairLoss')}</p>}{w.operations.length ? w.operations.map((op,i) => <p key={`${op.id}-${i}`}>{procedures.find(p => p.id === op.id)?.name[g.lang] ?? op.id} · {tr('daysSince')} {op.day} · {tr(`outcome_${op.outcome ?? 'success'}`)}</p>) : <p>{tr('noOperations')}</p>}</section><section><h3>{tr('savings')}</h3><p>{w.savings} ₴</p></section></div><div className="sheet-grid"><label>{tr('housing')}<select value={w.housing} disabled={!w.alive || !w.active || hasUnfittedLimb(w)} onChange={e => g.setHousing(selected.id, e.target.value as Housing)}><option value="cage">{tr('cage')}</option><option value="barrack">{tr('barrack')}</option><option value="hut">{tr('hut')}</option></select></label></div><div className="finance-actions"><button disabled={!w.alive || !w.active || g.money < 5} onClick={() => g.reward(selected.id, 5)}><Banknote size={16}/>{tr('bonusFive')}</button><button disabled={!w.alive || !w.active || w.savings < 1 || w.wage < 5 || fineReason.trim().length < 8} onClick={() => { g.fine(selected.id, 1, fineReason); setFineReason('') }}><ShieldAlert size={16}/>{tr('fineOne')}</button></div><label className="fine-reason">{tr('fineEvidence')}<input value={fineReason} onChange={e => setFineReason(e.target.value)} placeholder={tr('fineReasonPlaceholder')}/></label><p className="sheet-note">{tr('agreementDebt')}: {w.wageDebt} {tr('credits')}. {tr('fineRule')}</p><ContractSettings key={selected.id} id={selected.id} worker={w} lang={g.lang}/></div>}</div>}
  </div>
}

export function MedicalScreen() {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  const doctor = candidates.find(c => c.id === g.vetDoctorId && g.officeCagedNpcId !== c.id && g.workers[c.id] && canWorkAtFarm(g.workers[c.id], g.day))
  const [selectedId, setSelectedId] = useState('')
  const staff = candidates.filter(c => g.hired.includes(c.id) && g.workers[c.id]?.alive && g.workers[c.id]?.active)
  const selected = staff.find(c => c.id === selectedId) ?? staff[0]
  return <div className="location-page vet-page"><div className="location-heading"><div><span>{tr('farmName')}</span><h1>{tr('vetPost')}</h1><p>{tr('vetIntro')}</p></div><div className="location-counter"><Stethoscope size={22}/>{doctor ? displayName(doctor,g.lang,g.workers[doctor.id]?.nickname) : tr('noDoctor')}</div></div><ClinicStaffControls/><div className="vet-status"><img src={`${import.meta.env.BASE_URL}art/cattle.webp`} alt=""/><div><h2>{doctor ? tr('vetOperating') : tr('vetNoDoctor')}</h2><p>{doctor ? tr('vetBenefit') : tr('vetAssignHint')}</p><div className="mini-stats"><span>{tr('cattle')}: {g.livestock.cattle}</span><span>{tr('pigs')}: {g.livestock.pigs}</span><span>{tr('chickens')}: {g.livestock.chickens}</span></div></div></div>{doctor && selected && <><div className="vet-patient-list">{staff.map(person => <button key={person.id} className={selected.id === person.id ? 'selected' : ''} onClick={() => setSelectedId(person.id)}>{displayName(person,g.lang,g.workers[person.id]?.nickname)}</button>)}</div><NpcModificationPanel id={selected.id} worker={g.workers[selected.id]} lang={g.lang}/></>}</div>
}

function ClinicStaffControls() {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  const medics = candidates.filter(c => g.officeCagedNpcId !== c.id && g.workers[c.id] && canWorkAtFarm(g.workers[c.id], g.day))
  return <section className="clinic-staff-controls">
    {!g.vetBuilt && <><p>{tr('clinicBuildPrompt')}</p><button disabled={g.money < 200} onClick={g.buildVet}>{tr('buildVetPost')} · 200 ₴</button></>}
    {g.vetBuilt && <><label>{tr('appointDoctor')}<select value={g.vetDoctorId ?? ''} onChange={e => g.appointVet(e.target.value)} disabled={!medics.length}><option value="">{tr('chooseDoctor')}</option>{medics.map(c => <option key={c.id} value={c.id}>{displayName(c, g.lang, g.workers[c.id].nickname)} · {Math.round(operationSuccessChance(g.workers[c.id].bimbofication) * 100)}%</option>)}</select></label>{!medics.length && <p>{tr('clinicHireMedic')}</p>}</>}
  </section>
}
