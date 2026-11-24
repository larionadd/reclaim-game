import type { Lang } from '../types'

export const prologue: Record<Lang, { title: string; paragraphs: string[]; begin: string }> = {
  uk: {
    title: 'Пролог: Ферма на краю',
    paragraphs: [
      'Війна закінчилася. Україна перемогла, але перемога залишила по собі руїни: розбиті дороги, порожні заводи, згаслі міста. Економіка лежала в руїнах, і тоді був запущений особливий проєкт — «контрактне відродження». За його умовами громадяни агресора прибували в Україну як робітники за контрактом. Юридично — добровольці, фактично — ті, хто мав піднімати інфраструктуру та підприємства з колін.',
      'Ти — Alpha, господар тваринницької ферми. Твоя земля — це корівник, курник і свинарник, старі будівлі, які ще тримаються, але потребують рук. Ти береш участь у державній програмі реновації, і щотижня комітет надсилає тобі на телефон анкети новоприбулих контрактників. Сортувальний пункт — неподалік від ферми, там вони чекають на свою долю.',
      'Ти можеш відібрати потрібних людей. Оплата за контрактом — мінімальна сума або денний пайок, усе за законом. Ніхто не питає, що було раніше. Важливо лише, хто впорається з роботою.',
      'Твій телефон знову вібрує. На екрані — повідомлення: «Новоприбулі. Доступні для відбору».'
    ],
    begin: 'Почати гру'
  },
  ru: {
    title: 'Пролог: Ферма на краю',
    paragraphs: [
      'Война закончилась. Украина победила, но победа оставила после себя руины: разбитые дороги, пустые заводы, погасшие города. Экономика лежала в руинах, и тогда был запущен особый проект — «контрактное возрождение». По его условиям граждане агрессора прибывали в Украину как рабочие по контракту. Юридически — добровольцы, фактически — те, кто должен был поднимать инфраструктуру и предприятия с колен.',
      'Ты — Alpha, хозяин животноводческой фермы. Твоя земля — это коровник, курятник и свинарник, старые постройки, которые ещё держатся, но требуют рук. Ты участвуешь в государственной программе реновации, и каждую неделю комитет присылает тебе на телефон анкеты новоприбывших контрактников. Сортировочный пункт — недалеко от фермы, там они ждут своей участи.',
      'Ты можешь отобрать нужных людей. Оплата по контракту — минимальная сумма или дневной паёк, всё по закону. Никто не спрашивает, что было раньше. Важно лишь, кто справится с работой.',
      'Твой телефон снова вибрирует. На экране — уведомление: «Новоприбывшие. Доступны для отбора».'
    ],
    begin: 'Начать игру'
  },
  en: {
    title: 'Prologue: A Farm on the Edge',
    paragraphs: [
      'The war is over. Ukraine won, but victory left ruins behind: broken roads, empty factories, darkened cities. The economy lay in ruins, and so a special project was launched — "contractual rebirth." Under its terms, citizens of the aggressor arrived in Ukraine as contract workers. Legally — volunteers, in fact — those who were to raise infrastructure and enterprises from their knees.',
      'You are Alpha, the owner of a livestock farm. Your land is the cowshed, the chicken coop, and the pigsty — old buildings that still hold up but need hands. You participate in the state renovation program, and every week the committee sends applications of newly arrived contract workers to your phone. The sorting point is near the farm, where they wait for their fate.',
      'You can select the people you need. Payment under the contract is a minimal sum or a daily ration, all according to the law. No one asks what came before. What matters is who can handle the work.',
      'Your phone vibrates again. On the screen — a notification: "New arrivals. Available for selection."'
    ],
    begin: 'Begin game'
  }
}
