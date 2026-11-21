import type { Lang, Localized } from '../types'

export const limbSlots = ['left_arm', 'right_arm', 'left_leg', 'right_leg'] as const
export type LimbSlot = typeof limbSlots[number]

export interface Prosthetic { id: string; slot: LimbSlot; name: Localized; price: number; description: Localized }
export const prosthetics: Prosthetic[] = [
  { id: 'arm_left_standard', slot: 'left_arm', price: 75, name: { uk: 'Механічна ліва рука', ru: 'Механическая левая рука', en: 'Mechanical left arm' }, description: { uk: 'Універсальний протез для щоденних справ.', ru: 'Универсальный протез для повседневных дел.', en: 'General purpose prosthesis for daily tasks.' } },
  { id: 'arm_right_standard', slot: 'right_arm', price: 75, name: { uk: 'Механічна права рука', ru: 'Механическая правая рука', en: 'Mechanical right arm' }, description: { uk: 'Універсальний протез для щоденних справ.', ru: 'Универсальный протез для повседневных дел.', en: 'General purpose prosthesis for daily tasks.' } },
  { id: 'arm_left_grip', slot: 'left_arm', price: 120, name: { uk: 'Ліва рука з посиленим захватом', ru: 'Левая рука с усиленным захватом', en: 'Left arm with reinforced grip' }, description: { uk: 'Для роботи з інструментами.', ru: 'Для работы с инструментами.', en: 'For tool handling.' } },
  { id: 'arm_right_grip', slot: 'right_arm', price: 120, name: { uk: 'Права рука з посиленим захватом', ru: 'Правая рука с усиленным захватом', en: 'Right arm with reinforced grip' }, description: { uk: 'Для роботи з інструментами.', ru: 'Для работы с инструментами.', en: 'For tool handling.' } },
  { id: 'leg_left_standard', slot: 'left_leg', price: 85, name: { uk: 'Механічна ліва нога', ru: 'Механическая левая нога', en: 'Mechanical left leg' }, description: { uk: 'Збалансована опора для ходьби.', ru: 'Сбалансированная опора для ходьбы.', en: 'Balanced support for walking.' } },
  { id: 'leg_right_standard', slot: 'right_leg', price: 85, name: { uk: 'Механічна права нога', ru: 'Механическая правая нога', en: 'Mechanical right leg' }, description: { uk: 'Збалансована опора для ходьби.', ru: 'Сбалансированная опора для ходьбы.', en: 'Balanced support for walking.' } },
  { id: 'hoof_left', slot: 'left_leg', price: 145, name: { uk: 'Кінське копито, ліва нога', ru: 'Конское копыто, левая нога', en: 'Horse hoof, left leg' }, description: { uk: 'Спеціальна опора для пересування.', ru: 'Специальная опора для передвижения.', en: 'Specialized mobility support.' } },
  { id: 'hoof_right', slot: 'right_leg', price: 145, name: { uk: 'Кінське копито, права нога', ru: 'Конское копыто, правая нога', en: 'Horse hoof, right leg' }, description: { uk: 'Спеціальна опора для пересування.', ru: 'Специальная опора для передвижения.', en: 'Specialized mobility support.' } },
]
export const prostheticFor = (id: string) => prosthetics.find(item => item.id === id)
export const prostheticName = (id: string, lang: Lang) => prostheticFor(id)?.name[lang] ?? id
