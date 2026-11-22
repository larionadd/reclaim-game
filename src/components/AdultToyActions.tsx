import { adultToys } from '../data/goods'
import { canChooseIntimacy } from '../mechanics/bedroom'
import { useGame } from '../store/game'
import { t } from '../i18n'

export function AdultToyActions({ id, age, room }: { id: string; age: number; room: 'bedroom' | 'office' }) {
  const g = useGame(), worker = g.workers[id], tr = (key: string) => t(g.lang, key)
  if (!worker || worker.punishedInCage || worker.punishedKneeling || (room === 'office' && g.officeCagedNpcId === id)) return null
  const owned = adultToys.filter(item => (g.officeStock[item] ?? 0) + (g.officePlaced[item] ?? 0) > 0)
  if (!owned.length) return null
  return <div className="interaction-group"><h3>{tr('adultToyActions')}</h3><div>{owned.map(item => <div className="interaction-choice" key={item}><button disabled={!canChooseIntimacy(worker, age) || !g.canUseAction('useAdultToy')} onClick={() => g.useAdultToy(id, item, room)}>{tr('useToy')} {tr(item)}</button><small>{tr('intimacyRelationshipHint')}</small></div>)}</div></div>
}
