import { useGame, type Contract, type Worker } from '../store/game'
import { t } from '../i18n'
import type { Lang } from '../types'

export function ContractSettings({ id, worker, lang }: { id: string; worker: Worker; lang: Lang }) {
  const setContract = useGame(s => s.setContract), tr = (key: string) => t(lang, key)
  return <section className="contract-settings"><h3>{tr('paymentType')}</h3><select aria-label={tr('paymentType')} value={worker.contract} disabled={!worker.active} onChange={e => setContract(id, e.target.value as Contract)}><option value="paid">{tr('paid')}</option><option value="foodOnly">{tr('foodOnly')}</option></select><p>{worker.contract === 'paid' ? tr('paidContractHint') : tr('foodContractHint')}</p></section>
}
