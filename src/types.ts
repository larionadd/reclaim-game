export type Lang = 'uk' | 'ru' | 'en'
export type Phase = 'morning' | 'day' | 'evening' | 'night'
export type Job = 'production' | 'maintenance' | 'rest'
export type Localized = Record<Lang, string>
export interface Candidate { id:string; age:number; name:Localized; role:Localized; bio:Localized; image:string; skill:number; language:number; motivation:number; availableFromDay:number; traits:string[] }
