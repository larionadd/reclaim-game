import { useEffect, useRef, useState } from 'react'
import type { Lang } from '../types'
import { useGame } from '../store/game'
import { t } from '../i18n'
import './TitleScreen.css'

const saveKey = 'reclaim-save-v1'
const languages: { id: Lang; label: string }[] = [
  { id: 'uk', label: 'Українська' },
  { id: 'ru', label: 'Русский' },
  { id: 'en', label: 'English' }
]

export function TitleScreen({ canContinue, onNewGame, onContinue, onLoaded }: { canContinue: boolean; onNewGame: (name: string) => void; onContinue: () => void; onLoaded: () => void }) {
  const lang = useGame(s => s.lang)
  const setLang = useGame(s => s.setLang)
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [naming, setNaming] = useState(false)
  const [playerName, setPlayerName] = useState('Альфа')
  const tr = (key: string) => t(lang, key)

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [])

  const importText = async (text: string) => {
    try {
      const parsed: unknown = JSON.parse(text)
      if (!parsed || typeof parsed !== 'object' || !('state' in parsed) || !parsed.state || typeof parsed.state !== 'object') throw new Error('invalid')
      const state = parsed.state as Record<string, unknown>
      if (typeof state.day !== 'number' || !Array.isArray(state.hired) || !state.workers || typeof state.workers !== 'object') throw new Error('invalid')
      if (canContinue && !window.confirm(tr('saveImportConfirm'))) return
      const previous = localStorage.getItem(saveKey)
      try {
        localStorage.setItem(saveKey, text)
        await useGame.persist.rehydrate()
        useGame.getState().finishPrologue()
        onLoaded()
      } catch (cause) {
        if (previous === null) localStorage.removeItem(saveKey)
        else localStorage.setItem(saveKey, previous)
        throw cause
      }
    } catch { setError(tr('saveInvalid')) }
  }

  useEffect(() => {
    window.reclaimImportSave = (json: string) => { void importText(json) }
    return () => { delete window.reclaimImportSave }
  })

  const requestImport = () => window.ReclaimAndroid ? window.ReclaimAndroid.importSave() : fileRef.current?.click()

  return <main className="title-screen" style={{ backgroundImage: `linear-gradient(90deg,#0c130edd,#0c130e78 56%,#0c130e55),url('${import.meta.env.BASE_URL}art/menu-background.webp')` }}>
    <div className="title-screen-inner">
      <img className="title-screen-logo" src={`${import.meta.env.BASE_URL}art/reclaim-logo.png`} alt="RECLAIM"/>
      <div className="title-screen-rule"/>
      <div className="title-screen-languages" role="group" aria-label={tr('splashLanguage')}>
        <span>{tr('splashLanguage')}</span>
        <div>{languages.map(language => <button type="button" key={language.id} className={lang === language.id ? 'selected' : ''} aria-pressed={lang === language.id} onClick={() => setLang(language.id)}>{language.label}</button>)}</div>
      </div>
      {naming && <form className="player-name-form" onSubmit={event => { event.preventDefault(); onNewGame(playerName) }}><label htmlFor="player-name">{tr('playerName')}</label><input id="player-name" maxLength={32} value={playerName} onChange={event => setPlayerName(event.target.value)} autoFocus/><button type="submit" className="primary">{tr('beginGame')}</button></form>}
      <nav className="title-screen-actions" aria-label={tr('splashMenu')}>
        {!naming && <button type="button" className="primary" onClick={() => setNaming(true)}>{tr('newGame')}</button>}
        <button type="button" disabled={!canContinue} onClick={onContinue}>{tr('continueGame')}</button>
        <button type="button" onClick={requestImport}>{tr('loadGame')}</button>
      </nav>
      {!canContinue && <p className="title-screen-note">{tr('noSavedGame')}</p>}
      {error && <p className="title-screen-error" role="alert">{error}</p>}
      <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={async event => { const file = event.target.files?.[0]; if (file) await importText(await file.text()); event.target.value = '' }}/>
    </div>
  </main>
}
