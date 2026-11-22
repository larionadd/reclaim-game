import { useState } from 'react'
import { Boxes, Dumbbell, ShoppingBag, Wheat } from 'lucide-react'
import { droneParts, droneSalePrice, salePrices, sellableGoods } from '../data/goods'
import { candidates } from '../data/candidates'
import { t } from '../i18n'
import { displayName } from '../mechanics/npcIdentity'
import { useGame, type StoreGood, type TrainingKind } from '../store/game'
import type { Lang } from '../types'
import { FarmDashboard } from './FarmDashboard'
import { WorkplaceVisit } from './WorkplaceVisit'
import { canWorkAtFarm } from '../mechanics/mobility'

const enterpriseOptions = [
  { id: 'droneAssembly', cost: 450, icon: <Boxes size={22}/> },
  { id: 'store', cost: 300, icon: <ShoppingBag size={22}/> },
  { id: 'trainingCamp', cost: 400, icon: <Dumbbell size={22}/> },
] as const

export function EnterprisesScreen({ openSmartphone, openPeople, workplaceWorkerId, closeWorkplace }: { openSmartphone: (tab?: 'inbox' | 'shop' | 'market') => void; openPeople: () => void; workplaceWorkerId?: string | null; closeWorkplace: () => void }) {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  const [selected, setSelected] = useState(() => workplaceWorkerId ? ({ droneAssembly: 'droneAssembly', storeSales: 'store', training: 'trainingCamp' } as Record<string, string>)[g.assignments[workplaceWorkerId]] ?? 'farm' : 'farm')
  const [names, setNames] = useState<Record<string, string>>({})
  const [good, setGood] = useState<StoreGood>('meat')
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState(15)
  const [droneQty, setDroneQty] = useState(1)
  const staff = candidates.filter(c => g.workers[c.id]?.alive && g.workers[c.id]?.active)
  const assigned = (job: string) => staff.filter(c => g.assignments[c.id] === job)
  const available = good === 'drone' ? g.drones : g.stocks[good]
  const nameOf = (id: string, lang: Lang) => id === 'farm' ? t(lang, 'farmName') : g.enterpriseNames[id] ?? t(lang, id)
  return <div className="enterprises-page">
    <header className="enterprise-heading"><span>{tr('myEnterprise')}</span><h1>{tr('enterprises')}</h1><p>{tr('enterpriseIntro')}</p></header>
    <div className="enterprise-cards">
      <button className={selected === 'farm' ? 'active' : ''} onClick={() => setSelected('farm')}><Wheat size={22}/><strong>{tr('farmName')}</strong><small>{tr('owned')}</small></button>
      {g.vetBuilt ? <button className={selected === 'vetPost' ? 'active' : ''} onClick={() => setSelected('vetPost')}><Boxes size={22}/><strong>{tr('vetPost')}</strong><small>{tr('owned')}</small></button> : <div className="enterprise-locked"><Boxes size={22}/><strong>{tr('vetPost')}</strong><small>200 ₴</small><button disabled={g.money < 200} onClick={() => { g.buildVet(); setSelected('vetPost') }}>{tr('openEnterprise')}</button></div>}
      {enterpriseOptions.map(option => g.enterprises.includes(option.id)
        ? <button key={option.id} className={selected === option.id ? 'active' : ''} onClick={() => setSelected(option.id)}>{option.icon}<strong>{nameOf(option.id, g.lang)}</strong><small>{tr('owned')}</small></button>
        : <div className="enterprise-locked" key={option.id}>{option.icon}<strong>{tr(option.id)}</strong><small>{option.cost} ₴</small>{option.id === 'store' && <input value={names.store ?? ''} onChange={e => setNames(x => ({ ...x, store: e.target.value }))} placeholder={tr('nameStore')} aria-label={tr('nameStore')} maxLength={32}/>}<button disabled={g.money < option.cost || (option.id === 'store' && (names.store ?? '').trim().length < 3)} onClick={() => { g.createEnterprise(option.id, names[option.id] ?? ''); setSelected(option.id) }}>{tr('openEnterprise')}</button></div>)}
    </div>
    {selected === 'vetPost' && g.vetBuilt && <section className="enterprise-panel"><h2>{tr('vetPost')}</h2><p>{tr('vetBuildHint')}</p><label>{tr('appointDoctor')}<select value={g.vetDoctorId ?? ''} onChange={e => g.appointVet(e.target.value)}><option value="">{tr('chooseDoctor')}</option>{candidates.filter(c => c.role.en === 'Medic' && g.workers[c.id] && canWorkAtFarm(g.workers[c.id], g.day)).map(c => <option value={c.id} key={c.id}>{displayName(c,g.lang,g.workers[c.id].nickname)}</option>)}</select></label></section>}
    {selected === 'farm' && <FarmDashboard openSmartphone={openSmartphone} openPeople={openPeople}/>}
    {selected === 'droneAssembly' && g.enterprises.includes('droneAssembly') && <section className="enterprise-panel"><h2>{nameOf('droneAssembly', g.lang)}</h2><p>{tr('droneAssemblyHint')}</p><div className="enterprise-stats"><span>{tr('droneWorkers')}: {assigned('droneAssembly').length}</span><span>{tr('dronesInStock')}: {g.drones}</span><span>{tr('droneSalePrice')}: {droneSalePrice} ₴</span></div><div className="enterprise-parts">{droneParts.map(part => <div key={part}><img src={`${import.meta.env.BASE_URL}art/goods/${part}.svg`} alt=""/><span>{tr(part)}</span><b>{g.partStock[part] ?? 0}</b></div>)}</div><p>{tr('droneKitHint')}</p><div className="enterprise-actions"><button onClick={() => openSmartphone('shop')}>{tr('buyParts')}</button><label>{tr('saleQuantity')}<input type="number" min="1" max={g.drones} value={droneQty} onChange={e => setDroneQty(Math.max(1, Math.floor(Number(e.target.value) || 1)))}/></label><button disabled={g.drones < droneQty} onClick={() => g.sellDrones(droneQty)}>{tr('sellDrones')} · {droneQty * droneSalePrice} ₴</button></div></section>}
    {selected === 'store' && g.enterprises.includes('store') && <section className="enterprise-panel"><h2>{nameOf('store', g.lang)}</h2><p>{tr('playerStoreHint')}</p><p>{tr('storeSellers')}: {assigned('storeSales').map(c => displayName(c, g.lang, g.workers[c.id].nickname)).join(', ') || tr('noSeller')}</p><div className="store-list-form"><label>{tr('product')}<select value={good} onChange={e => { const next = e.target.value as StoreGood; setGood(next); setPrice(next === 'drone' ? droneSalePrice : salePrices[next]) }}>{[...sellableGoods, 'drone' as const].map(item => <option value={item} key={item}>{tr(item)} · {item === 'drone' ? g.drones : g.stocks[item]}</option>)}</select></label><label>{tr('saleQuantity')}<input type="number" min="1" max={available} value={quantity} onChange={e => setQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))}/></label><label>{tr('salePrice')}<input type="number" min="1" max="9999" value={price} onChange={e => setPrice(Math.max(1, Math.floor(Number(e.target.value) || 1)))}/></label><button disabled={quantity > available || quantity < 1 || price < 1} onClick={() => g.listInStore(good, quantity, price)}>{tr('listForSale')}</button></div><div className="store-listings">{g.storeListings.map((item, index) => <div key={index}><span>{tr(item.good)} × {item.quantity} · {item.price} ₴ / {tr('unit')}</span><button onClick={() => g.removeStoreListing(index)}>{tr('removeListing')}</button></div>)}</div></section>}
    {selected === 'trainingCamp' && g.enterprises.includes('trainingCamp') && <section className="enterprise-panel"><h2>{nameOf('trainingCamp', g.lang)}</h2><p>{tr('trainingHint')}</p><p>{tr('sparPairHint')}</p><div className="training-roster">{assigned('training').map(c => { const w = g.workers[c.id]; return <label key={c.id}><strong>{displayName(c, g.lang, w.nickname)}</strong><select value={g.trainingPlans[c.id] ?? 'run'} onChange={e => g.setTraining(c.id, e.target.value as TrainingKind)}><option value="run">{tr('trainingRun')}</option><option value="bag">{tr('trainingBag')}</option><option value="spar">{tr('trainingSpar')}</option></select><small>{tr('trainingSpeed')} {w.training.speed} · {tr('trainingStrength')} {w.training.strength} · {tr('trainingCombat')} {w.training.combat}</small></label> })}</div>{!assigned('training').length && <p>{tr('assignTrainingHint')}</p>}</section>}
    {workplaceWorkerId && <WorkplaceVisit workerId={workplaceWorkerId} onClose={closeWorkplace}/>}
  </div>
}
