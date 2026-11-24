import { useEffect, useRef, useState } from 'react'
import { Download, RotateCcw, Save, Upload } from 'lucide-react'
import { useGame } from '../store/game'
import { t } from '../i18n'

const saveKey = 'reclaim-save-v1'

declare global {
  interface Window {
    ReclaimAndroid?: { exportSave: (json: string) => void; importSave: () => void }
    reclaimImportSave?: (json: string) => void
  }
}

export function SettingsScreen({ onNewGame }: { onNewGame: () => void }) {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')

  const importText = async (text: string) => {
    try {
      const parsed: unknown = JSON.parse(text)
      if (!parsed || typeof parsed !== 'object' || !('state' in parsed) || !parsed.state || typeof parsed.state !== 'object') throw new Error('invalid')
      const state = parsed.state as Record<string, unknown>
      if (typeof state.day !== 'number' || !Array.isArray(state.hired) || !state.workers || typeof state.workers !== 'object') throw new Error('invalid')
      if (!window.confirm(tr('saveImportConfirm'))) return
      localStorage.setItem(saveKey, text)
      await useGame.persist.rehydrate()
      setMessage(tr('saveImported'))
    } catch { setMessage(tr('saveInvalid')) }
  }

  useEffect(() => {
    window.reclaimImportSave = (json: string) => { void importText(json) }
    return () => { delete window.reclaimImportSave }
  })

  const saveNow = () => { useGame.setState({ ...useGame.getState() }); setMessage(tr('saveWritten')) }
  const exportSave = () => {
    saveNow()
    const text = localStorage.getItem(saveKey)
    if (!text) { setMessage(tr('saveInvalid')); return }
    if (window.ReclaimAndroid) { window.ReclaimAndroid.exportSave(text); return }
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url; link.download = `reclaim-save-day-${g.day}.json`; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const requestImport = () => window.ReclaimAndroid ? window.ReclaimAndroid.importSave() : fileRef.current?.click()
  const resetGame = () => { if (window.confirm(tr('resetConfirm'))) { const lang = g.lang; g.reset(); g.setLang(lang); setMessage(tr('saveReset')); onNewGame() } }

  return <div className="settings-page"><header><h1>{tr('settings')}</h1><p>{tr('settingsIntro')}</p></header><section className="manor-panel"><h2>{tr('saveManagement')}</h2><p>{tr('autosaveHint')}</p><div className="settings-actions"><button onClick={saveNow}><Save size={18}/>{tr('saveNow')}</button><button onClick={exportSave}><Download size={18}/>{tr('saveExport')}</button><button onClick={requestImport}><Upload size={18}/>{tr('saveImport')}</button></div><input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={async event => { const file = event.target.files?.[0]; if (file) await importText(await file.text()); event.target.value = '' }}/>{message && <p role="status" className="settings-message">{message}</p>}</section><section className="manor-panel"><h2>{tr('newGame')}</h2><p>{tr('newGameHint')}</p><button className="settings-reset" onClick={resetGame}><RotateCcw size={18}/>{tr('reset')}</button></section></div>
}
