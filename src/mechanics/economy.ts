import type { Job } from '../types'
export function resolveDay(assignments:Record<string,Job>, wellbeing:number, reputation:number){
 const jobs=Object.values(assignments), prod=jobs.filter(x=>x==='production').length, rest=jobs.filter(x=>x==='rest').length
 return {output:prod*8, wellbeing:Math.max(0,Math.min(100,wellbeing-prod+rest*2)), reputation:Math.max(0,Math.min(100,reputation+rest-Math.max(0,prod-1)))}
}
