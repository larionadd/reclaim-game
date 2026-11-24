import { useGame } from '../store/game'
import { t } from '../i18n'

const features = [
  'changelogContracts',
  'changelogPeople',
  'changelogWork',
  'changelogEconomy',
  'changelogClinic',
  'changelogRelationships',
  'changelogEvents',
  'changelogSave',
] as const

export function ChangelogScreen() {
  const lang = useGame(state => state.lang)
  const tr = (key: string) => t(lang, key)

  return <div className="changelog-page">
    <header><span className="changelog-version">{tr('version')} 1.1</span><h1>{tr('changelog')}</h1></header>
    <article className="manor-panel changelog-entry"><h2>{tr('changelogUpdate11')}</h2><ul><li>{tr('changelogTitleScreen')}</li><li>{tr('changelogPrologue')}</li><li>{tr('changelogNpcActions')}</li></ul></article>
    <article className="manor-panel changelog-entry">
      <h2>{tr('changelogFirstRelease')}</h2>
      <p>{tr('changelogIntro')}</p>
      <h3>{tr('changelogPlayable')}</h3>
      <ul>{features.map(key => <li key={key}>{tr(key)}</li>)}</ul>
    </article>
  </div>
}
