import type { Job } from '../types'
export function resolveDay(assignments:Record<string,Job>, wellbeing:number, reputation:number){
 const jobs=Object.values(assignments), prod=jobs.filter(x=>x==='production').length, maint=jobs.filter(x=>x==='maintenance').length, rest=jobs.filter(x=>x==='rest').length
 return {output:prod*8+maint*3, wellbeing:Math.max(0,Math.min(100,wellbeing-prod*5+maint+rest*6)), reputation:Math.max(0,Math.min(100,reputation+maint*2+rest-Math.max(0,prod-maint)*2))}
}
