import { officeGoods } from '../data/goods'
import { t } from '../i18n'
import { useGame } from '../store/game'

export function OfficeInventory({ room = 'office' }: { room?: 'office' | 'bedroom' }) {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  const items = room === 'bedroom' ? officeGoods.filter(item => item === 'dogCrate' || item === 'dogBed') : officeGoods
  return <section className="manor-panel office-inventory"><h2>{tr(room === 'bedroom' ? 'bedroomInventory' : 'officeInventory')}</h2><div className="office-items">{items.map(item => { const placed = room === 'bedroom' ? g.bedroomPlaced[item as 'dogCrate' | 'dogBed'] : g.officePlaced[item]; return <article key={item}><img src={`${import.meta.env.BASE_URL}art/goods/${item}.webp`} alt=""/><div><strong>{tr(item)}</strong><small>{tr('inStorage')}: {g.officeStock[item] ?? 0} · {tr(room === 'bedroom' ? 'inBedroom' : 'inOffice')}: {placed ?? 0}</small></div><div className="office-item-actions"><button disabled={!g.officeStock[item]} onClick={() => g.placeOfficeItem(item, room)}>{tr('placeInOffice')}</button><button disabled={!placed} onClick={() => g.removeOfficeItem(item, room)}>{tr('removeFromOffice')}</button></div></article> })}</div></section>
}
