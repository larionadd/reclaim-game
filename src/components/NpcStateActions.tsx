import { useGame } from '../store/game'
import { t } from '../i18n'

export function NpcStateActions({ id, room }: { id: string; room: 'bedroom' | 'office' }) {
  const g = useGame(), worker = g.workers[id], tr = (key: string) => t(g.lang, key)
  if (!worker || !worker.alive || !worker.active || (room === 'office' && g.officeCagedNpcId === id)) return null
  const placed = room === 'bedroom' ? g.bedroomPlaced : g.officePlaced
  return <div className="interaction-group"><h3>{tr('npcStates')}</h3><p>{tr('npcStateHint')}</p><div>
    <div className="interaction-choice"><button onClick={() => g.setNpcClothing(id, worker.clothing === 'unclothed' ? 'clothed' : 'unclothed', room)}>{tr(worker.clothing === 'unclothed' ? 'dressNpc' : 'undressNpc')}</button></div>
    {worker.analItem ? <div className="interaction-choice"><button onClick={() => g.setNpcAnalItem(id, null, room)}>{tr('removeAnalItem')}</button></div> : (['analPlug', 'analVibrator'] as const).map(item => <div className="interaction-choice" key={item}><button disabled={!placed[item]} onClick={() => g.setNpcAnalItem(id, item, room)}>{tr(item === 'analPlug' ? 'insertAnalPlug' : 'insertAnalVibrator')}</button></div>)}
    <div className="interaction-choice"><button disabled={!worker.handcuffed && !placed.handcuffs} onClick={() => g.setNpcHandcuffed(id, !worker.handcuffed, room)}>{tr(worker.handcuffed ? 'removeHandcuffs' : 'putOnHandcuffs')}</button></div>
  </div></div>
}
