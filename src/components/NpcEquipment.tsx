import { limbSlots, prostheticBonuses, prosthetics, type LimbSlot } from '../data/prosthetics'
import type { Lang } from '../types'
import { useGame, type Worker } from '../store/game'
import { t } from '../i18n'
import { candidates } from '../data/candidates'
import { Portrait } from './Portrait'

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
  const person = candidates.find(candidate => candidate.id === id)
  const bonuses = prostheticBonuses(worker.equippedProsthetics)
  const breast = worker.operations.some(op => op.id === 'breast_enlargement' && (!op.outcome || op.outcome === 'success'))
  const modifications = [...new Set(worker.operations.filter(op => !op.outcome || op.outcome === 'success').map(op => op.id).filter(key => !key.startsWith('replacement_') && key !== 'breast_enlargement' && key !== 'hair_growth_hormones' && key !== 'hair_loss_hormones'))]
  if (worker.medicalEffects?.hair === 'growth') modifications.push('hair_growth_hormones')
  if (worker.medicalEffects?.hair === 'loss') modifications.push('hair_loss_hormones')
  const spare = worker.prostheticInventory ?? []
  const slotCard = (slot: LimbSlot) => {
    const item = prosthetics.find(p => p.id === worker.equippedProsthetics?.[slot])
    const amputated = worker.operations.some(op => op.id === `replacement_${slot}` && (!op.outcome || op.outcome === 'success'))
    return <article className={`implant-slot ${item ? 'fitted' : ''}`} key={slot}>
      <span className="implant-slot-label">{tr(`slot_${slot}`)}</span>
      {item ? <><img src={`${import.meta.env.BASE_URL}${item.image.replace(/^\//, '')}`} alt=""/><strong>{item.name[lang]}</strong><div className="implant-perks">{item.strength > 0 && <span>{tr('implantStrength')} +{item.strength}</span>}{item.extraGoods > 0 && <span>{tr('implantGoods')} +{item.extraGoods}</span>}{item.speed > 0 && <span>{tr('implantSpeed')} +{item.speed}</span>}{item.hauling > 0 && <span>{tr('implantHauling')} +{item.hauling}</span>}{item.combatGrip > 0 && <span>{tr('implantCombatGrip')} +{item.combatGrip}</span>}</div><button disabled={!worker.alive || !worker.active} onClick={() => remove(id, slot)}>{tr('removeProsthetic')}</button></> : <><div className="empty-implant">+</div><strong>{amputated ? amputationNames[slot][lang] : tr('emptyImplantSlot')}</strong></>}
    </article>
  }
  return <section className="npc-equipment"><h3>{tr('implantLoadout')}</h3><div className="implant-loadout">
    <div className="implant-column">{limbSlots.filter(slot => slot.startsWith('left')).map(slotCard)}</div>
    <div className="implant-center">{person && <Portrait person={person} lang={lang}/>}<article className="implant-breast"><span>{tr('breastImplantSlot')}</span><img src={`${import.meta.env.BASE_URL}art/procedures/breast_enlargement.webp`} alt=""/><strong>{breast ? tr('breastImplantEquipped') : tr('emptyImplantSlot')}</strong>{breast && <small>{tr('implantMilk')} +1 / {tr('shift')}</small>}</article></div>
    <div className="implant-column">{limbSlots.filter(slot => slot.startsWith('right')).map(slotCard)}</div>
  </div><div className="implant-totals"><span>{tr('implantStrength')} <b>+{bonuses.strength}</b></span><span>{tr('implantGoods')} <b>+{bonuses.extraGoods}</b></span><span>{tr('implantSpeed')} <b>+{bonuses.speed}</b></span><span>{tr('implantHauling')} <b>+{bonuses.hauling}</b></span><span>{tr('implantCombatGrip')} <b>+{bonuses.combatGrip}</b></span><span>{tr('implantMilk')} <b>+{Number(breast)}</b></span></div>
    <h3>{tr('npcModifications')}</h3><div className="trait-chips">{modifications.length ? modifications.map(key => <span key={key}>{modificationNames[key]?.[lang] ?? key}</span>) : <p>{tr('noModifications')}</p>}</div>
    <h3>{tr('spareProsthetics')}</h3>{spare.length ? spare.map((itemId, i) => { const item = prosthetics.find(p => p.id === itemId)!; const eligible = worker.operations.some(op => op.id === `replacement_${item.slot}` && (!op.outcome || op.outcome === 'success')); return <div className="equipment-row" key={`${itemId}-${i}`}><img className="equipment-thumb" src={`${import.meta.env.BASE_URL}${item.image.replace(/^\//, '')}`} alt=""/><span>{item.name[lang]}</span><button disabled={!worker.alive || !worker.active || !eligible} onClick={() => equip(id, itemId)}>{tr('equipProsthetic')}</button></div> }) : <p>{tr('noProsthetics')}</p>}
    <h3>{tr('warehouseProsthetics')}</h3>{prosthetics.filter(item => (stock[item.id] ?? 0) > 0).map(item => { const ready = worker.operations.some(op => op.id === `replacement_${item.slot}` && (!op.outcome || op.outcome === 'success')); return <div className="equipment-row" key={item.id}><img className="equipment-thumb" src={`${import.meta.env.BASE_URL}${item.image.replace(/^\//, '')}`} alt=""/><span>{item.name[lang]} × {stock[item.id]}</span><div className="equipment-actions"><button disabled={!worker.alive || !worker.active || !ready} onClick={() => fit(id, item.id)}>{tr('equipProsthetic')}</button><button disabled={!worker.alive || !worker.active} onClick={() => issue(id, item.id)}>{tr('issueProsthetic')}</button></div></div> })}
  </section>
}
