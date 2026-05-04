/**
 * ESLint plugin: katsumascore-ui
 *
 * Enforces UI architecture rules for the katsumascore-front project.
 * Rules are designed to prevent accidental violations of component
 * responsibility boundaries, styling conventions, and variant patterns.
 */
import noFetchInComponent from './no-fetch-in-component.mjs'
import noHardcodedHexColor from './no-hardcoded-hex-color.mjs'
import noVariantLayoutProp from './no-variant-layout-prop.mjs'
import noPostSectionDirectPostCard from './no-postsection-direct-postcard.mjs'
import noPostListSectionTitle from './no-postlist-section-title.mjs'
import noHardcodedFontFamily from './no-hardcoded-font-family.mjs'
import noHardcodedI18n from './no-hardcoded-i18n.mjs'
import noDirectFontSize from './no-direct-font-size.mjs'
import noDesignViolation from './no-design-violation.mjs'

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
  meta: {
    name: 'katsumascore-ui',
    version: '1.0.0',
  },
  rules: {
    'no-fetch-in-component': noFetchInComponent,
    'no-hardcoded-hex-color': noHardcodedHexColor,
    'no-variant-layout-prop': noVariantLayoutProp,
    'no-postsection-direct-postcard': noPostSectionDirectPostCard,
    'no-postlist-section-title': noPostListSectionTitle,
    'no-hardcoded-font-family': noHardcodedFontFamily,
    'no-hardcoded-i18n': noHardcodedI18n,
    'no-direct-font-size': noDirectFontSize,
    'no-design-violation': noDesignViolation,
  },
}

export default plugin
