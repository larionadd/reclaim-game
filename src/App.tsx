import { useState } from 'react'
import { BookOpen, Boxes, BriefcaseBusiness, CalendarDays, ClipboardList, Coins, Globe2, HeartPulse, Home, MapPin, Menu, Settings2, ShieldCheck, Stethoscope, Users, Wheat } from 'lucide-react'
import { FarmDashboard } from './components/FarmDashboard'
import { ManorScreen } from './components/ManorScreen'
import { DistributionScreen, MedicalScreen, PeopleScreen, SuppliesScreen } from './components/LocationScreens'
import { useGame } from './store/game'
import { t } from './i18n'
import './App.css'

type View = 'manor' | 'overview' | 'distribution' | 'people' | 'supplies' | 'medical'
const menu: { id: View; icon: React.ReactNode; key: string }[] = [
  { id: 'manor', icon: <Home size={20}/>, key: 'home' },
  { id: 'overview', icon: <Wheat size={20}/>, key: 'farmType' },
  { id: 'distribution', icon: <BriefcaseBusiness size={20}/>, key: 'desk' },
  { id: 'people', icon: <Users size={20}/>, key: 'people' },
  { id: 'supplies', icon: <Boxes size={20}/>, key: 'resources' },
  { id: 'medical', icon: <Stethoscope size={20}/>, key: 'clinic' }
]

export default function App() {
  const g = useGame()
  const [view, setView] = useState<View>('manor')
  const [menuOpen, setMenuOpen] = useState(false)
  const tr = (key: string) => t(g.lang, key)
  const open = (next: View) => { setView(next); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const living = g.hired.filter(id => g.workers[id]?.alive).length

  return <div className="game-shell">
    <aside className={`game-sidebar ${menuOpen ? 'open' : ''}`}>
      <div className="game-logo"><div className="logo-mark"><Wheat size={29}/></div><div><strong>RECLAIM</strong><small>{tr('rebuildingUkraine')}</small></div></div>
      <nav className="side-nav" aria-label={tr('nav')}>{menu.map(item => <button key={item.id} className={view === item.id ? 'selected' : ''} onClick={() => open(item.id)}>{item.icon}<span>{tr(item.key)}</span></button>)}</nav>
      <div className="side-rule"/><div className="nav-section-title">{tr('management')}</div>
      <nav className="side-nav secondary" aria-label={tr('management')}><button onClick={() => open('manor')}><ClipboardList size={20}/><span>{tr('office')}</span></button><button onClick={() => open('overview')}><MapPin size={20}/><span>{tr('farmMap')}</span></button><button onClick={() => open('medical')}><HeartPulse size={20}/><span>{tr('medicalProgram')}</span></button></nav>
      <div className="sidebar-footer"><span>{tr('sandbox')}</span><p>{tr('sideMotto')}</p><button onClick={g.toggleLang}><Globe2 size={17}/>{g.lang.toUpperCase()} ↔ {g.lang === 'uk' ? 'RU' : g.lang === 'ru' ? 'EN' : 'UK'}</button></div>
    </aside>

    <div className="game-main">
      <header className="game-topbar"><div className="top-location"><button className="mobile-menu" onClick={() => setMenuOpen(x => !x)} aria-label={tr('nav')}><Menu size={22}/></button><span className="top-era">{tr('rebuildingUkraine')}</span><i/><span>{tr('season')}</span><i/><span><CalendarDays size={17}/>{tr('dayLabel')} {g.day}</span></div><div className="top-values"><span><ShieldCheck size={18}/>{tr('reputation')}: <b>{g.reputation}</b></span><span><Users size={18}/>{living}/{g.staffCapacity}</span><span><Coins size={18}/>{g.money}</span><button className="top-language" onClick={g.toggleLang} aria-label={tr('language')}><Globe2 size={18}/>{g.lang.toUpperCase()}</button><button className="top-settings" onClick={() => { if (window.confirm(`${tr('reset')}?`)) g.reset() }} aria-label={tr('reset')}><Settings2 size={20}/></button></div></header>
      <main className="game-content">
        {view === 'manor' && <ManorScreen openFarm={() => open('overview')} openPeople={() => open('people')}/>}
        {view === 'overview' && <FarmDashboard openDistribution={() => open('distribution')} openPeople={() => open('people')}/>}
        {view === 'distribution' && <DistributionScreen/>}
        {view === 'people' && <PeopleScreen/>}
        {view === 'supplies' && <SuppliesScreen/>}
        {view === 'medical' && <MedicalScreen/>}
      </main>
      <footer className="game-footer"><span><BookOpen size={15}/>{tr('program')}</span><span>{tr('dayLabel')} {g.day} · {tr(g.phase)}</span></footer>
    </div>
    <nav className="bottom-nav" aria-label={tr('nav')}>{menu.map(item => <button key={item.id} className={view === item.id ? 'selected' : ''} onClick={() => open(item.id)} aria-label={tr(item.key)}>{item.icon}<span>{tr(item.key)}</span></button>)}</nav>
  </div>
}
