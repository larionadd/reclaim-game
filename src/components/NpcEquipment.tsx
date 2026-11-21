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

export function NpcEquipment({ id, worker, lang }: { id: string; worker: Worker; lang: Lang }) {
  const stock = useGame(s => s.prostheticStock), issue = useGame(s => s.issueProsthetic), equip = useGame(s => s.equipProsthetic), remove = useGame(s => s.removeProsthetic)
  const tr = (key: string) => t(lang, key)
  const modifications = [...new Set(worker.operations.filter(op => !op.outcome || op.outcome === 'success').map(op => op.id).filter(id => !id.startsWith('replacement_')))].filter(id => id !== 'hair_growth_hormones' && id !== 'hair_loss_hormones')
  if (worker.medicalEffects?.hair === 'growth') modifications.push('hair_growth_hormones')
  if (worker.medicalEffects?.hair === 'loss') modifications.push('hair_loss_hormones')
  const fitted = limbSlots.map(slot => ({ slot, itemId: worker.equippedProsthetics?.[slot] })).filter(row => row.itemId)
  const spare = worker.prostheticInventory ?? []
  return <section className="npc-equipment"><h3>{tr('npcModifications')}</h3><div className="trait-chips">{[...modifications.map(key => modificationNames[key]?.[lang] ?? key), ...fitted.map(row => prostheticName(row.itemId!, lang))].length ? [...modifications.map(key => modificationNames[key]?.[lang] ?? key), ...fitted.map(row => prostheticName(row.itemId!, lang))].map((name, i) => <span key={`${name}-${i}`}>{name}</span>) : <p>{tr('noModifications')}</p>}</div>
    <h3>{tr('prostheticInventory')}</h3><strong>{tr('equippedProsthetics')}</strong>{fitted.length ? fitted.map(row => <div className="equipment-row" key={row.slot}><span>{prostheticName(row.itemId!, lang)}</span><button disabled={!worker.alive || !worker.active} onClick={() => remove(id, row.slot)}>{tr('removeProsthetic')}</button></div>) : <p>{tr('noProsthetics')}</p>}
    <strong>{tr('spareProsthetics')}</strong>{spare.length ? spare.map((itemId, i) => { const item = prosthetics.find(p => p.id === itemId)!; const eligible = worker.operations.some(op => op.id === `replacement_${item.slot}` && (!op.outcome || op.outcome === 'success')); return <div className="equipment-row" key={`${itemId}-${i}`}><span>{item.name[lang]}</span><button disabled={!worker.alive || !worker.active || !eligible} onClick={() => equip(id, itemId)}>{tr('equipProsthetic')}</button></div> }) : <p>{tr('noProsthetics')}</p>}
    <strong>{tr('warehouseProsthetics')}</strong>{prosthetics.filter(item => (stock[item.id] ?? 0) > 0).map(item => <div className="equipment-row" key={item.id}><span>{item.name[lang]} × {stock[item.id]}</span><button disabled={!worker.alive || !worker.active} onClick={() => issue(id, item.id)}>{tr('issueProsthetic')}</button></div>)}
  </section>
}
