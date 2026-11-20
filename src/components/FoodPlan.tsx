import { Minus, Plus } from 'lucide-react'
import { humanFoods } from '../data/goods'
import { useGame, type Worker } from '../store/game'
import { t } from '../i18n'
import type { Lang } from '../types'

export function FoodPlan({ id, worker, lang }: { id: string; worker: Worker; lang: Lang }) {
  const stocks = useGame(s => s.stocks)
  const setFoodPlan = useGame(s => s.setFoodPlan)
  const tr = (key: string) => t(lang, key)
  const total = humanFoods.reduce((sum, food) => sum + worker.diet[food], 0)
  return <section className="food-plan"><h3>{tr('dailyMenu')}</h3><p>{tr('foodFromStocks')}: {total}/5 {tr('portions')}</p><div className="food-plan-grid">{humanFoods.map(food => <div className="food-plan-item" key={food}><img src={`${import.meta.env.BASE_URL}art/goods/${food}.webp`} alt=""/><div><strong>{tr(food)}</strong><small>{tr('available')}: {stocks[food]}</small></div><div className="food-plan-buttons"><button disabled={!worker.active || worker.diet[food] < 1} onClick={() => setFoodPlan(id, food, worker.diet[food] - 1)} aria-label={`${tr('decrease')} ${tr(food)}`}><Minus size={15}/></button><span>{worker.diet[food]}</span><button disabled={!worker.active || total >= 5} onClick={() => setFoodPlan(id, food, worker.diet[food] + 1)} aria-label={`${tr('increase')} ${tr(food)}`}><Plus size={15}/></button></div></div>)}</div><small>{tr('foodPlanHint')}</small></section>
}
