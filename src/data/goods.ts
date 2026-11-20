export const farmGoods = ['meat', 'milk', 'cheese', 'eggs'] as const
export type FarmGood = typeof farmGoods[number]
export const salePrices: Record<FarmGood, number> = { meat: 15, milk: 6, cheese: 12, eggs: 3 }
export const shopGoods = ['bread', 'lard', 'grain', 'vodka'] as const
export type ShopGood = typeof shopGoods[number]
export const purchasePrices: Record<ShopGood, number> = { bread: 6, lard: 12, grain: 18, vodka: 25 }
export const humanFoods = ['bread', 'lard', 'meat', 'milk', 'cheese', 'eggs'] as const
export type HumanFood = typeof humanFoods[number]
export type FoodStocks = Record<HumanFood, number>
export type FarmStocks = Record<FarmGood, number>
export const emptyFarmStocks = (): FarmStocks => ({ meat: 0, milk: 0, cheese: 0, eggs: 0 })
export const emptyFoodStocks = (): FoodStocks => ({ bread: 0, lard: 0, meat: 0, milk: 0, cheese: 0, eggs: 0 })
