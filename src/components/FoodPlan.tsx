import { Minus, Plus } from 'lucide-react'
import { humanFoods, foodCalories } from '../data/goods'
import { calorieNeed, plannedCalories, useGame, type Worker } from '../store/game'
import { t } from '../i18n'
import type { Lang } from '../types'

export function FoodPlan({ id, worker, lang }: { id: string; worker: Worker; lang: Lang }) {
  const stocks = useGame(s => s.stocks)
  const setFoodPlan = useGame(s => s.setFoodPlan)
  const tr = (key: string) => t(lang, key)
  const total = plannedCalories(worker), need = calorieNeed(worker)
  return <section className="food-plan"><h3>{tr('dailyMenu')}</h3><p>{tr('foodFromStocks')}: {total} / {need} {tr('kcal')}</p><div className="food-plan-grid">{humanFoods.map(food => <div className="food-plan-item" key={food}><img src={`${import.meta.env.BASE_URL}art/goods/${food}.webp`} alt=""/><div><strong>{tr(food)}</strong><small>{foodCalories[food]} {tr('kcal')} / {tr('unit')} · {tr('available')}: {stocks[food]}</small></div><div className="food-plan-buttons"><button disabled={!worker.active || worker.diet[food] < 1} onClick={() => setFoodPlan(id, food, worker.diet[food] - 1)} aria-label={`${tr('decrease')} ${tr(food)}`}><Minus size={15}/></button><span>{worker.diet[food]}</span><button disabled={!worker.active || worker.diet[food] >= 99} onClick={() => setFoodPlan(id, food, worker.diet[food] + 1)} aria-label={`${tr('increase')} ${tr(food)}`}><Plus size={15}/></button></div></div>)}</div><small>{tr('foodPlanHint')}</small></section>
}
