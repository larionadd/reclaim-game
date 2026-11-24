import { useState } from 'react'
import { BookOpen, CalendarDays, ClipboardList, Coins, Globe2, HeartPulse, History, Home, MapPin, Menu, Moon, Settings2, ShieldCheck, Smartphone, Stethoscope, Sun, Sunrise, Sunset, Users, Wheat } from 'lucide-react'
import { EnterprisesScreen } from './components/EnterprisesScreen'
import { ManorScreen } from './components/ManorScreen'
import { SmartphoneScreen } from './components/SmartphoneScreen'
import { MedicalScreen, PeopleScreen } from './components/LocationScreens'
import { useGame } from './store/game'
import { t } from './i18n'
import { DailyReport } from './components/DailyReport'
import { GameEventDialog } from './components/GameJournal'
import { NpcRequestDialog } from './components/NpcRequestDialog'
import { SettingsScreen } from './components/SettingsScreen'
import { ChangelogScreen } from './components/ChangelogScreen'
import { PrologueDialog } from './components/PrologueDialog'
import { TitleScreen } from './components/TitleScreen'
import './App.css'
import './new-ui.css'

type View = 'manor' | 'enterprises' | 'people' | 'medical' | 'smartphone' | 'settings' | 'changelog'
const menu: { id: View; icon: React.ReactNode; key: string }[] = [
  { id: 'manor', icon: <Home size={20}/>, key: 'home' },
  { id: 'enterprises', icon: <Wheat size={20}/>, key: 'enterprises' },
  { id: 'people', icon: <Users size={20}/>, key: 'people' },
  { id: 'medical', icon: <Stethoscope size={20}/>, key: 'vetPost' },
  { id: 'smartphone', icon: <Smartphone size={20}/>, key: 'smartphone' }
]

export default function App() {
  const g = useGame()
  const [screen, setScreen] = useState<'title' | 'prologue' | 'game'>('title')
  const [view, setView] = useState<View>('manor')
  const [workplaceWorkerId, setWorkplaceWorkerId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [smartphoneTab, setSmartphoneTab] = useState<'inbox' | 'shop' | 'market'>('inbox')
  const tr = (key: string) => t(g.lang, key)
  const open = (next: View) => { setView(next); setWorkplaceWorkerId(null); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const openSmartphone = (tab: 'inbox' | 'shop' | 'market' = 'inbox') => { setSmartphoneTab(tab); open('smartphone') }
  const openWorkplace = (workerId: string) => { setView('enterprises'); setWorkplaceWorkerId(workerId); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const living = g.hired.filter(id => g.workers[id]?.alive && g.workers[id]?.active).length
  const visibleMenu = menu

  const canContinue = (g.prologueSeen || g.day > 1 || g.hired.length > 0) && !!localStorage.getItem('reclaim-save-v1')
  const newGame = () => {
    if (canContinue && !window.confirm(tr('resetConfirm'))) return
    const lang = g.lang
    g.reset()
    g.setLang(lang)
    setScreen('prologue')
  }
  if (screen === 'title') return <TitleScreen canContinue={canContinue} onNewGame={newGame} onContinue={() => { g.finishPrologue(); setScreen('game') }} onLoaded={() => setScreen('game')}/>
  if (screen === 'prologue') return <PrologueDialog onBegin={() => { g.finishPrologue(); setScreen('game') }}/>

  return <div className="game-shell">
    <aside className={`game-sidebar ${menuOpen ? 'open' : ''}`}>
      <div className="game-logo"><div className="logo-mark"><Wheat size={29}/></div><div><img className="game-logo-wordmark" src={`${import.meta.env.BASE_URL}art/reclaim-logo.png`} alt="RECLAIM"/><small>{tr('rebuildingUkraine')}</small></div></div>
      <nav className="side-nav" aria-label={tr('nav')}>{visibleMenu.map(item => <button key={item.id} className={view === item.id ? 'selected' : ''} onClick={() => open(item.id)}>{item.icon}<span>{tr(item.key)}</span></button>)}</nav>
      <div className="side-rule"/><div className="nav-section-title">{tr('management')}</div>
      <nav className="side-nav secondary" aria-label={tr('management')}><button onClick={() => open('manor')}><ClipboardList size={20}/><span>{tr('office')}</span></button><button onClick={() => open('enterprises')}><MapPin size={20}/><span>{tr('enterprises')}</span></button>{g.vetBuilt && <button onClick={() => open('medical')}><HeartPulse size={20}/><span>{tr('vetPost')}</span></button>}<button className={view === 'settings' ? 'selected' : ''} onClick={() => open('settings')}><Settings2 size={20}/><span>{tr('settings')}</span></button><button className={view === 'changelog' ? 'selected' : ''} onClick={() => open('changelog')}><History size={20}/><span>{tr('changelog')}</span></button></nav>
      <div className="sidebar-footer"><span>{tr('sandbox')}</span><p>{tr('sideMotto')}</p><button onClick={g.toggleLang}><Globe2 size={17}/>{g.lang.toUpperCase()} ↔ {g.lang === 'uk' ? 'RU' : g.lang === 'ru' ? 'EN' : 'UK'}</button></div>
    </aside>

    <div className="game-main">
      <header className="game-topbar"><div className="top-location"><button className="mobile-menu" onClick={() => setMenuOpen(x => !x)} aria-label={tr('nav')}><Menu size={22}/></button><span className="top-era">{tr('rebuildingUkraine')}</span><i/><span>{tr('season')}</span><i/><span><CalendarDays size={17}/>{tr('dayLabel')} {g.day}</span></div><div className="top-values"><span><ShieldCheck size={18}/>{tr('reputation')}: <b>{g.reputation}</b></span><span><Users size={18}/>{living}/{g.staffCapacity}</span><span><Coins size={18}/>{g.money}</span><button className="top-language" onClick={g.toggleLang} aria-label={tr('language')}><Globe2 size={18}/>{g.lang.toUpperCase()}</button></div></header>
      <div className="time-track"><div className="time-phases">{(['morning','day','evening','night'] as const).map((phase, index) => <span key={phase} className={g.phase === phase ? 'current' : ''}>{index === 0 ? <Sunrise/> : index === 1 ? <Sun/> : index === 2 ? <Sunset/> : <Moon/>}{tr(phase)}</span>)}</div><button className="quarter-top" onClick={g.advance}>{tr('nextPhase')} →</button></div>
      <main className="game-content">
        {g.phase === 'morning' && <DailyReport/>}
        {view === 'manor' && <ManorScreen openFarm={() => open('enterprises')} openPeople={() => open('people')}/>}
        {view === 'enterprises' && <EnterprisesScreen openSmartphone={openSmartphone} openPeople={() => open('people')} workplaceWorkerId={workplaceWorkerId} closeWorkplace={() => setWorkplaceWorkerId(null)}/>}
        {view === 'people' && <PeopleScreen onCheckWorkplace={openWorkplace}/>}
        {view === 'medical' && <MedicalScreen/>}
        {view === 'smartphone' && <SmartphoneScreen initialTab={smartphoneTab}/>}
        {view === 'settings' && <SettingsScreen onNewGame={() => setScreen('prologue')}/>}
        {view === 'changelog' && <ChangelogScreen/>}
      </main>
      <footer className="game-footer"><span><BookOpen size={15}/>{tr('program')}</span><span>{tr('dayLabel')} {g.day} · {tr(g.phase)}</span></footer>
    </div>
    <nav className="bottom-nav" aria-label={tr('nav')}>{visibleMenu.map(item => <button key={item.id} className={view === item.id ? 'selected' : ''} onClick={() => open(item.id)} aria-label={tr(item.key)}>{item.icon}<span>{tr(item.key)}</span></button>)}</nav>
    <GameEventDialog/>
    <NpcRequestDialog/>
  </div>
}
