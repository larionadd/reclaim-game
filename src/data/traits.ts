import type { Localized } from '../types'

export const traits: Record<string, { name: Localized; effect: string }> = {
  cautious: { name: { uk: 'Обережна', ru: 'Осторожная', en: 'Cautious' }, effect: 'safety' },
  compassionate: { name: { uk: 'Турботлива', ru: 'Заботливая', en: 'Compassionate' }, effect: 'care' },
  inventive: { name: { uk: 'Винахідливий', ru: 'Изобретательный', en: 'Inventive' }, effect: 'repair' },
  stubborn: { name: { uk: 'Впертий', ru: 'Упрямый', en: 'Stubborn' }, effect: 'negotiation' },
  methodical: { name: { uk: 'Методична', ru: 'Методичная', en: 'Methodical' }, effect: 'records' },
  protective: { name: { uk: 'Захисниця', ru: 'Защитница', en: 'Protective' }, effect: 'team' },
  principled: { name: { uk: 'Принциповий', ru: 'Принципиальный', en: 'Principled' }, effect: 'fairness' },
  resilient: { name: { uk: 'Стійкий', ru: 'Стойкий', en: 'Resilient' }, effect: 'recovery' },
  sociable: { name: { uk: 'Товариський', ru: 'Общительный', en: 'Sociable' }, effect: 'relations' },
  observant: { name: { uk: 'Спостережливий', ru: 'Наблюдательный', en: 'Observant' }, effect: 'events' },
  ambitious: { name: { uk: 'Амбітний', ru: 'Амбициозный', en: 'Ambitious' }, effect: 'goals' },
  patient: { name: { uk: 'Терплячий', ru: 'Терпеливый', en: 'Patient' }, effect: 'training' },
  frugal: { name: { uk: 'Ощадливий', ru: 'Бережливый', en: 'Frugal' }, effect: 'savings' },
  curious: { name: { uk: 'Допитливий', ru: 'Любознательный', en: 'Curious' }, effect: 'learning' },
  leader: { name: { uk: 'Лідерський', ru: 'Лидерский', en: 'Leader' }, effect: 'team' },
  strong_legs: { name: { uk: 'Сильні ноги', ru: 'Сильные ноги', en: 'Strong legs' }, effect: 'prosthesis' },
  strong_arms: { name: { uk: 'Сильні руки', ru: 'Сильные руки', en: 'Strong arms' }, effect: 'prosthesis' },
  skilled_mechanic: { name: { uk: 'Майстер ремонту', ru: 'Мастер ремонта', en: 'Repair master' }, effect: 'learned' }
}
