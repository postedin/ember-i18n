import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('I18nService#addTranslations', function(hooks) {
  setupTest(hooks);

  // `addTranslations` mutates global state, so be careful that these
  // tests don't interact poorly with one another or other tests.

  test('adds translations to the current locale', function(assert) {
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en' });

    const before = i18n.t('defined.at.runtime.one');
    assert.equal(before, 'Missing translation: defined.at.runtime.one');

    run(i18n, 'addTranslations', 'en', {
      'defined.at.runtime': { one: 'Defined at Runtime' }
    });

    const after = i18n.t('defined.at.runtime.one');
    assert.equal(after, 'Defined at Runtime');
  });

  test('adds translations to a parent locale', function(assert) {
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en-ps' });

    const before = i18n.t('defined.at.runtime.two');
    assert.equal(before, 'Missing translation: defined.at.runtime.two');

    run(i18n, 'addTranslations', 'en', {
      'defined.at.runtime.two': 'Defined at Runtime'
    });

    const after = i18n.t('defined.at.runtime.two');
    assert.equal(after, 'Defined at Runtime');
  });

  test('adds translations to an unrelated locale', function(assert) {
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'es' });

    const before = i18n.t('defined.at.runtime.three');
    assert.equal(before, 'Missing translation: defined.at.runtime.three');

    run(i18n, 'addTranslations', 'en', {
      'defined.at': { 'runtime.three': 'Defined at Runtime' }
    });

    run(i18n, 'set', 'locale', 'en');

    const after = i18n.t('defined.at.runtime.three');
    assert.equal(after, 'Defined at Runtime');
  });

  test('adds translations to a locale that has not yet been defined', function(assert) {
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en' });

    run(i18n, 'addTranslations', 'en-xyz', {
      'defined.at': { 'runtime.four': 'Defined at Runtime' }
    });

    run(i18n, 'set', 'locale', 'en-xyz');

    const after = i18n.t('defined.at.runtime.four');
    assert.equal(after, 'Defined at Runtime');
  });
});
