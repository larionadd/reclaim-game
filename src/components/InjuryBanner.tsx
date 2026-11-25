import type { Lang } from '../types'
import type { Worker } from '../store/game'
import { t } from '../i18n'

export function InjuryBanner({ worker, day, lang }: { worker: Worker; day: number; lang: Lang }) {
  const until = worker.injuredUntilDay ?? 0
  if (until <= day) return null
  const tr = (key: string) => t(lang, key)
  const remaining = until - day
  return <section className="injury-alert" role="status" aria-live="polite">
    <strong>{tr('injuryStatus')}: {worker.injury ? tr(`injury_${worker.injury.kind}`) : tr('injured')}</strong>
    <span>{worker.injury ? tr(`injurySource_${worker.injury.source}`) : tr('injuryUnknown')}</span>
    <span>{worker.injury ? `${tr('injuryEffect')}: −${worker.injury.healthLoss}% · ` : ''}{tr('injuryCannotWork')}</span>
    <b>{tr('injuryDaysRemaining')}: {remaining} · {tr('injuryRestUntil')} {until}</b>
  </section>
}
