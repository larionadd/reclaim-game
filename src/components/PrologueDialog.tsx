import { useEffect } from 'react'
import { prologue } from '../data/prologue'
import { useGame } from '../store/game'
import './PrologueDialog.css'

export function PrologueDialog({ onBegin }: { onBegin: () => void }) {
  const lang = useGame(s => s.lang)
  const toggleLang = useGame(s => s.toggleLang)

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [])

  const content = prologue[lang]
  return <div className="prologue-overlay" role="dialog" aria-modal="true" aria-labelledby="prologue-title">
    <section className="prologue-card">
      <div className="prologue-art" style={{ backgroundImage: `linear-gradient(0deg,#20271d 0%,transparent 45%),url('${import.meta.env.BASE_URL}art/menu-background.webp')` }}><img src={`${import.meta.env.BASE_URL}art/reclaim-logo.png`} alt="RECLAIM"/></div>
      <div className="prologue-copy">
        <div className="prologue-top"><span>RECLAIM</span><button type="button" onClick={toggleLang} aria-label="Change language">{lang.toUpperCase()} ↔ {lang === 'uk' ? 'RU' : lang === 'ru' ? 'EN' : 'UK'}</button></div>
        <h1 id="prologue-title">{content.title}</h1>
        <div className="prologue-text">{content.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
        <button className="prologue-begin" type="button" onClick={onBegin}>{content.begin} →</button>
      </div>
    </section>
  </div>
}
