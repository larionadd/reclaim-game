import { useState } from 'react'
import { BedDouble, BookOpen, BriefcaseBusiness, Home, Warehouse, Users } from 'lucide-react'
import { useGame } from '../store/game'
import { t } from '../i18n'
import { candidates } from '../data/candidates'
import { displayName } from '../mechanics/npcIdentity'
import { OfficeInteraction } from './OfficeInteraction'
import { GameJournal } from './GameJournal'
import { BedroomInteraction } from './BedroomInteraction'
import { OfficeInventory } from './OfficeInventory'

type Room = 'estate' | 'bedroom' | 'office' | 'call' | 'cages' | 'journal'

export function ManorScreen({ openFarm, openPeople }: { openFarm: () => void; openPeople: () => void }) {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  const [room, setRoom] = useState<Room>('estate')
  const living = g.hired.filter(id => g.workers[id]?.alive && g.workers[id]?.active).length
  return <div className="manor-page">
    <section className="manor-hero"><div><span>{tr('estateKicker')}</span><h1>{tr('manor')}</h1><p>{tr('estateIntro')}</p></div></section>
    <div className="manor-tabs">{(['estate','bedroom','office','call','cages','journal'] as Room[]).map(id => <button key={id} className={room === id ? 'active' : ''} onClick={() => setRoom(id)}>{id === 'estate' ? <Home/> : id === 'bedroom' ? <BedDouble/> : id === 'office' ? <BriefcaseBusiness/> : id === 'call' ? <Users/> : id === 'cages' ? <Warehouse/> : <BookOpen/>}{tr(id)}</button>)}</div>
    {room === 'journal' && <GameJournal/>}
    {room === 'estate' && <div className="manor-grid"><RoomCard image="/art/manor-bedroom.webp" title={tr('bedroom')} text={tr('bedroomHint')} action={() => setRoom('bedroom')}/><RoomCard image="/art/manor-office.webp" title={tr('office')} text={tr('officeHint')} action={() => setRoom('office')}/><RoomCard image="/art/farm-hero.webp" title={tr('farmName')} text={tr('farmDesc')} action={openFarm}/><RoomCard image="/art/housing-cage-v2.webp" title={tr('settlement')} text={`${tr('cage')}: ${g.cages}/5 · ${tr('barrack')}: ${g.barracks} · ${tr('hut')}: ${g.huts} · ${living}/${g.staffCapacity}`} action={() => setRoom('cages')}/></div>}
    {room === 'cages' && <div className="manor-grid">{(['cage','barrack','hut'] as const).map(kind => { const count = kind === 'cage' ? g.cages : kind === 'barrack' ? g.barracks : g.huts, capacity = kind === 'cage' ? 1 : kind === 'barrack' ? 4 : 2, price = kind === 'cage' ? 90 : kind === 'barrack' ? 300 : 180; return <section className="manor-panel" key={kind}><img className="housing-photo" src={`${import.meta.env.BASE_URL}art/${kind === 'barrack' ? 'housing-barrack.webp' : `housing-${kind}-v2.webp`}`} alt={tr(kind)}/><h2>{tr(kind)} · {count} · {count * capacity} {tr('places')}</h2><p>{tr(kind === 'cage' ? 'cageEffect' : kind === 'barrack' ? 'barrackEffect' : 'hutEffect')}</p>{Object.entries(g.workers).filter(([,w]) => w.alive && w.active && w.housing === kind).map(([id,w]) => { const person = candidates.find(c => c.id === id); return <div className="build-row" key={id}><strong>{person ? displayName(person, g.lang, w.nickname) : id} · {tr('health')}: {w.health}%</strong><button onClick={openPeople}>{tr('openPersonnel')}</button></div> })}<button disabled={kind === 'cage' ? g.cages >= 5 || g.money < price : g.money < price} onClick={kind === 'cage' ? g.buildCage : kind === 'barrack' ? g.buildBarrack : g.buildHut}>{tr('construction')} · {price} ₴</button></section> })}</div>}
    {room === 'bedroom' && <><div className="manor-panel"><img className="room-scene" src={`${import.meta.env.BASE_URL}art/manor-bedroom.webp`} alt={tr('bedroom')}/><BedDouble size={40}/><h2>{tr('bedroom')}</h2><p>{tr('sleepHint')}</p><p>{tr('dayLabel')} {g.day} · {tr(g.phase)}</p><button className="primary-action" onClick={g.sleep}>{tr('sleepUntilMorning')}</button></div><BedroomInteraction/></>}
    {room === 'bedroom' && <OfficeInventory room="bedroom"/>}
    {room === 'call' && <OfficeInteraction/>}
    {room === 'office' && <div className="office-shortcuts"><button onClick={() => setRoom('call')}><Users size={16}/>{tr('callWorker')}</button><button onClick={() => setRoom('journal')}><BookOpen size={16}/>{tr('journal')} · {g.journal.length}</button></div>}
    {room === 'office' && <img className="room-scene office-scene" src={`${import.meta.env.BASE_URL}art/manor-office.webp`} alt={tr('office')}/>}
    {room === 'office' && <section className="manor-panel office-summary"><h2>{tr('assets')}</h2><div className="office-summary-grid"><span>{tr('money')}<b>{g.money} ₴</b></span><span>{tr('staff')}<b>{living}/{g.staffCapacity}</b></span><span>{tr('animalFeed')}<b>{g.feedStock.chickens + g.feedStock.pigs + g.feedStock.cattle} {tr('units')}</b></span><span>{tr('totalSales')}<b>{g.totalSales} ₴</b></span></div><div className="office-shortcuts"><button onClick={() => setRoom('cages')}><Warehouse size={16}/>{tr('housing')}</button><button onClick={openFarm}><Home size={16}/>{tr('farmName')}</button></div></section>}
    {room === 'office' && <OfficeInventory/>}

  </div>
}
function RoomCard({ image, title, text, action }: { image: string; title: string; text: string; action: () => void }) { return <article className="manor-card"><img className="room-photo" src={`${import.meta.env.BASE_URL}${image.replace(/^\//,'')}`} alt=""/><h2>{title}</h2><p>{text}</p><button onClick={action}>{'→'}</button></article> }
