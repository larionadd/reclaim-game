import { officeGoods } from '../data/goods'
import { t } from '../i18n'
import { useGame } from '../store/game'

export function OfficeInventory() {
  const g = useGame(), tr = (key: string) => t(g.lang, key)
  return <section className="manor-panel office-inventory"><h2>{tr('officeInventory')}</h2><div className="office-items">{officeGoods.map(item => <article key={item}><img src={`${import.meta.env.BASE_URL}art/goods/${item}.svg`} alt=""/><div><strong>{tr(item)}</strong><small>{tr('inStorage')}: {g.officeStock[item] ?? 0} · {tr('inOffice')}: {g.officePlaced[item] ?? 0}</small></div><div className="office-item-actions"><button disabled={!g.officeStock[item]} onClick={() => g.placeOfficeItem(item)}>{tr('placeInOffice')}</button><button disabled={!g.officePlaced[item]} onClick={() => g.removeOfficeItem(item)}>{tr('removeFromOffice')}</button></div></article>)}</div></section>
}
