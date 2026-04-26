import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import { messages } from './i18n'

export const ProjectOverview = () => {
  const locale = useLocale()
  const pillars = [
    messages.pillars.headlessWordpress,
    messages.pillars.storybookFirstUi,
    messages.pillars.roleBasedStyling,
  ]
  const directoryGuide = [
    messages.directoryGuide.ui,
    messages.directoryGuide.features,
    messages.directoryGuide.layout,
    messages.directoryGuide.templates,
    messages.directoryGuide.docs,
  ]
  const sectionEntries = [
    messages.sections.purpose,
    messages.sections.reading,
    messages.sections.rules,
  ]
  const flowSteps = [
    messages.flow.steps.first,
    messages.flow.steps.second,
    messages.flow.steps.third,
    messages.flow.steps.fourth,
  ]
  const nextSteps = [
    messages.nextSteps.designRules,
    messages.nextSteps.typography,
    messages.nextSteps.chaos,
  ]

  return (
    <div className='sb-project-overview'>
      <section className='sb-project-overview__hero'>
        <p className='sb-project-overview__eyebrow'>{t(messages, ['hero', 'eyebrow'], locale)}</p>
        <h1>{t(messages, ['hero', 'title'], locale)}</h1>
        <p className='sb-project-overview__lead'>{t(messages, ['hero', 'lead'], locale)}</p>
        <div className='sb-project-overview__heroActions'>
          <a
            className='sb-project-overview__primaryLink'
            href='?path=/story/docs-design-rules--overview'
          >
            {t(messages, ['hero', 'designRulesCta'], locale)}
          </a>
          <p className='sb-project-overview__heroNote'>
            {t(messages, ['hero', 'designRulesNote'], locale)}
          </p>
        </div>
      </section>

      <section className='sb-project-overview__grid'>
        {pillars.map((pillar, index) => (
          <article key={index} className='sb-project-overview__card'>
            <h2>{t(pillar, ['title'], locale)}</h2>
            <p>{t(pillar, ['body'], locale)}</p>
          </article>
        ))}
      </section>

      <section className='sb-project-overview__section'>
        <div className='sb-project-overview__sectionHeader'>
          <h2>{t(messages, ['flow', 'title'], locale)}</h2>
          <p>{t(messages, ['flow', 'description'], locale)}</p>
        </div>
        <ol className='sb-project-overview__flow'>
          {flowSteps.map((step, index) => (
            <li key={index}>{t(step, [], locale)}</li>
          ))}
        </ol>
      </section>

      <section className='sb-project-overview__columns'>
        <div className='sb-project-overview__panel'>
          <h2>{t(messages, ['directoryGuide', 'title'], locale)}</h2>
          <dl className='sb-project-overview__directoryGuide'>
            {directoryGuide.map((entry, index) => (
              <div key={index} className='sb-project-overview__directoryRow'>
                <dt>{t(entry, ['label'], locale)}</dt>
                <dd>{t(entry, ['description'], locale)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className='sb-project-overview__panel'>
          <h2>{t(messages, ['nextSteps', 'title'], locale)}</h2>
          <ul className='sb-project-overview__links'>
            {nextSteps.map((step, index) => (
              <li key={index}>{t(step, [], locale)}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className='sb-project-overview__stack'>
        {sectionEntries.map((section, index) => (
          <article key={index} className='sb-project-overview__panel'>
            <h2>{t(section, ['title'], locale)}</h2>
            <ul className='sb-project-overview__bulletList'>
              <li>{t(section, ['first'], locale)}</li>
              <li>{t(section, ['second'], locale)}</li>
              <li>{t(section, ['third'], locale)}</li>
            </ul>
          </article>
        ))}
      </section>
    </div>
  )
}
