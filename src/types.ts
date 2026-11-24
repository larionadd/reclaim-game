export type Lang = 'uk' | 'ru' | 'en'
export type Phase = 'morning' | 'day' | 'evening' | 'night'
export type Job = 'production' | 'rest' | 'layEggs' | 'milking' | 'droneAssembly' | 'storeSales' | 'training'
export type Localized = Record<Lang, string>
export interface BodyMeasurements { heightCm: number; weightKg: number; chestCm: number; waistCm: number; hipsCm: number }
export interface Candidate { id:string; age:number; name:Localized; role:Localized; bio:Localized; image:string; availableFromDay:number; traits:string[]; body:BodyMeasurements }
