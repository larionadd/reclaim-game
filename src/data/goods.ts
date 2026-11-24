export const farmGoods = ['meat', 'milk', 'cheese', 'eggs'] as const
export const premiumGoods = ['girlEggs', 'girlMilk'] as const
export const sellableGoods = [...farmGoods, ...premiumGoods] as const
export type FarmGood = typeof farmGoods[number]
export type PremiumGood = typeof premiumGoods[number]
export type SaleGood = FarmGood | PremiumGood
export const salePrices: Record<SaleGood, number> = { meat: 15, milk: 6, cheese: 12, eggs: 3, girlEggs: 45, girlMilk: 36 }
export const shopGoods = ['bread', 'lard', 'grain', 'pigFeed', 'cowFeed', 'chicken', 'pig', 'cow', 'vodka'] as const
export type ShopGood = typeof shopGoods[number]
export const purchasePrices: Record<ShopGood, number> = { bread: 6, lard: 12, grain: 20, pigFeed: 25, cowFeed: 40, chicken: 24, pig: 65, cow: 160, vodka: 25 }
export const droneParts = ['droneFrame', 'droneBattery', 'droneMotors', 'dronePropellers', 'droneController', 'droneCamera', 'droneRadio'] as const
export type DronePart = typeof droneParts[number]
export const dronePartPrices: Record<DronePart, number> = { droneFrame: 36, droneBattery: 38, droneMotors: 42, dronePropellers: 14, droneController: 32, droneCamera: 24, droneRadio: 18 }
export const officeGoods = ['dogCrate', 'dogBed', 'leash', 'muzzle', 'internalVibrator', 'externalVibrator', 'analVibrator', 'dildo', 'analPlug', 'gag', 'handcuffs'] as const
export type OfficeGood = typeof officeGoods[number]
export const bedroomGoods = ['dogCrate', 'dogBed', 'analPlug', 'analVibrator', 'handcuffs'] as const
export type BedroomGood = typeof bedroomGoods[number]
export const adultToys = ['internalVibrator', 'externalVibrator', 'analVibrator', 'dildo', 'analPlug', 'gag', 'handcuffs'] as const
export type AdultToy = typeof adultToys[number]
export const officeGoodPrices: Record<OfficeGood, number> = { dogCrate: 90, dogBed: 45, leash: 18, muzzle: 22, internalVibrator: 65, externalVibrator: 58, analVibrator: 72, dildo: 48, analPlug: 36, gag: 24, handcuffs: 32 }
export const atbibGoods = [...shopGoods, ...droneParts, ...officeGoods] as const
export type AtbibGood = typeof atbibGoods[number]
export const atbibPrices: Record<AtbibGood, number> = { ...purchasePrices, ...dronePartPrices, ...officeGoodPrices }
export const droneSalePrice = 300
export const humanFoods = ['bread', 'lard', 'meat', 'milk', 'cheese', 'eggs'] as const
export type HumanFood = typeof humanFoods[number]
export type FoodStocks = Record<HumanFood | PremiumGood, number>
export type FarmStocks = Record<FarmGood, number>
export const emptyFarmStocks = (): FarmStocks => ({ meat: 0, milk: 0, cheese: 0, eggs: 0 })
export const emptyFoodStocks = (): FoodStocks => ({ bread: 0, lard: 0, meat: 0, milk: 0, cheese: 0, eggs: 0, girlEggs: 0, girlMilk: 0 })

export const foodCalories: Record<HumanFood | PremiumGood, number> = { bread: 250, lard: 450, meat: 300, milk: 150, cheese: 350, eggs: 140, girlEggs: 140, girlMilk: 150 }
export const goodsCalories: Record<HumanFood | PremiumGood | 'grain' | 'vodka', number> = { ...foodCalories, grain: 340, vodka: 230 }
