import { useGame } from '../store/game'
import { t } from '../i18n'
import { hasUnfittedLimb } from '../mechanics/mobility'
import type { Job } from '../types'

export function AssignmentSelect({ id }: { id: string }) {
  const g = useGame(), worker = g.workers[id], tr = (key: string) => t(g.lang, key)
  if (!worker) return null
  const disabled = g.phase !== 'morning' || !worker.alive || !worker.active || !!worker.punishedInCage || !!worker.punishedKneeling || g.officeCagedNpcId === id || (worker.injuredUntilDay ?? 0) > g.day || hasUnfittedLimb(worker)
  return <select value={g.assignments[id] ?? 'rest'} disabled={disabled} onChange={e => g.assign(id, e.target.value as Job)}>
    <option value="rest">{tr('rest')}</option>
    <optgroup label={tr('farmName')}>
      <option value="production">{tr('farmName')}</option>
      {worker.medicalEffects?.oviposition && <option value="layEggs">{tr('layEggs')}</option>}
      {worker.medicalEffects?.lactation && <option value="milking">{tr('milking')}</option>}
    </optgroup>
    {(g.enterprises.includes('droneAssembly') || g.enterprises.includes('store') || g.enterprises.includes('trainingCamp')) && <optgroup label={tr('otherEnterprises')}>
      {g.enterprises.includes('droneAssembly') && <option value="droneAssembly">{tr('droneAssembly')}</option>}
      {g.enterprises.includes('store') && <option value="storeSales">{tr('storeSales')}</option>}
      {g.enterprises.includes('trainingCamp') && <option value="training">{tr('trainingCamp')}</option>}
    </optgroup>}
  </select>
}
