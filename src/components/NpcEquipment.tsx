import { limbSlots, prostheticName, prosthetics } from '../data/prosthetics'
import type { Lang } from '../types'
import { useGame, type Worker } from '../store/game'
import { t } from '../i18n'

const modificationNames: Record<string, Record<Lang, string>> = {
  replacement_eyes: { uk: 'Штучні очі', ru: 'Искусственные глаза', en: 'Artificial eyes' },
  synthetic_lung: { uk: 'Синтетичні легені', ru: 'Синтетические лёгкие', en: 'Synthetic lungs' },
  synthetic_heart: { uk: 'Синтетичне серце', ru: 'Синтетическое сердце', en: 'Synthetic heart' },
  breast_replacement: { uk: 'Грудні імпланти', ru: 'Грудные импланты', en: 'Breast implants' },
  breast_enlargement: { uk: 'Грудні імпланти', ru: 'Грудные импланты', en: 'Breast implants' },
  oviposition_uterus: { uk: 'Яйценародження', ru: 'Яйцерождение', en: 'Egg laying' },
  lactation_hormones: { uk: 'Лактація', ru: 'Лактация', en: 'Lactation' },
  diagnostic_neural_interface: { uk: 'Нейроінтерфейс', ru: 'Нейроинтерфейс', en: 'Neural interface' },
  functional_prosthesis: { uk: 'Функціональний протез', ru: 'Функциональный протез', en: 'Functional prosthesis' },
  powered_arm: { uk: 'Силовий протез руки', ru: 'Силовой протез руки', en: 'Powered arm prosthesis' },
  support_brace: { uk: 'Підтримувальний ортез', ru: 'Поддерживающий ортез', en: 'Support brace' },
  hair_growth_hormones: { uk: 'Посилений ріст волосся', ru: 'Усиленный рост волос', en: 'Increased hair growth' },
  hair_loss_hormones: { uk: 'Випадіння волосся', ru: 'Выпадение волос', en: 'Hair loss' },
  weight_gain_hormones: { uk: 'Набрана вага', ru: 'Набранный вес', en: 'Weight gain' },
}
const amputationNames: Record<(typeof limbSlots)[number], Record<Lang, string>> = {
  left_arm: { uk: 'Ампутована ліва рука', ru: 'Ампутирована левая рука', en: 'Left arm amputated' },
  right_arm: { uk: 'Ампутована права рука', ru: 'Ампутирована правая рука', en: 'Right arm amputated' },
  left_leg: { uk: 'Ампутована ліва нога', ru: 'Ампутирована левая нога', en: 'Left leg amputated' },
  right_leg: { uk: 'Ампутована права нога', ru: 'Ампутирована правая нога', en: 'Right leg amputated' },
}

export function NpcEquipment({ id, worker, lang }: { id: string; worker: Worker; lang: Lang }) {
  const stock = useGame(s => s.prostheticStock), issue = useGame(s => s.issueProsthetic), equip = useGame(s => s.equipProsthetic), fit = useGame(s => s.fitProstheticFromStock), remove = useGame(s => s.removeProsthetic)
  const tr = (key: string) => t(lang, key)
  const modifications = [...new Set(worker.operations.filter(op => !op.outcome || op.outcome === 'success').map(op => op.id).filter(id => !id.startsWith('replacement_')))].filter(id => id !== 'hair_growth_hormones' && id !== 'hair_loss_hormones')
  if (worker.medicalEffects?.hair === 'growth') modifications.push('hair_growth_hormones')
  if (worker.medicalEffects?.hair === 'loss') modifications.push('hair_loss_hormones')
  const fitted = limbSlots.map(slot => ({ slot, itemId: worker.equippedProsthetics?.[slot] })).filter(row => row.itemId)
  const amputated = limbSlots.filter(slot => worker.operations.some(op => op.id === `replacement_${slot}` && (!op.outcome || op.outcome === 'success')) && !worker.equippedProsthetics?.[slot])
  const visibleModifications = [...modifications.map(key => modificationNames[key]?.[lang] ?? key), ...fitted.map(row => prostheticName(row.itemId!, lang)), ...amputated.map(slot => amputationNames[slot][lang])]
  const spare = worker.prostheticInventory ?? []
  return <section className="npc-equipment"><h3>{tr('npcModifications')}</h3><div className="trait-chips">{visibleModifications.length ? visibleModifications.map((name, i) => <span key={`${name}-${i}`}>{name}</span>) : <p>{tr('noModifications')}</p>}</div>
    <h3>{tr('prostheticInventory')}</h3><strong>{tr('equippedProsthetics')}</strong>{fitted.length ? fitted.map(row => <div className="equipment-row" key={row.slot}><span>{prostheticName(row.itemId!, lang)}</span><button disabled={!worker.alive || !worker.active} onClick={() => remove(id, row.slot)}>{tr('removeProsthetic')}</button></div>) : <p>{tr('noProsthetics')}</p>}
    <strong>{tr('spareProsthetics')}</strong>{spare.length ? spare.map((itemId, i) => { const item = prosthetics.find(p => p.id === itemId)!; const eligible = worker.operations.some(op => op.id === `replacement_${item.slot}` && (!op.outcome || op.outcome === 'success')); return <div className="equipment-row" key={`${itemId}-${i}`}><span>{item.name[lang]}</span><button disabled={!worker.alive || !worker.active || !eligible} onClick={() => equip(id, itemId)}>{tr('equipProsthetic')}</button></div> }) : <p>{tr('noProsthetics')}</p>}
    <strong>{tr('warehouseProsthetics')}</strong>{prosthetics.filter(item => (stock[item.id] ?? 0) > 0).map(item => { const ready = worker.operations.some(op => op.id === `replacement_${item.slot}` && (!op.outcome || op.outcome === 'success')); return <div className="equipment-row" key={item.id}><span>{item.name[lang]} × {stock[item.id]}</span><div className="equipment-actions"><button disabled={!worker.alive || !worker.active || !ready} onClick={() => fit(id, item.id)}>{tr('equipProsthetic')}</button><button disabled={!worker.alive || !worker.active} onClick={() => issue(id, item.id)}>{tr('issueProsthetic')}</button></div></div> })}
  </section>
}
