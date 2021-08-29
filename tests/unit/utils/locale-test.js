import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('I18nService#locales', function(hooks) {
  setupTest(hooks);

  test('locales have the correct length and names', function(assert) {
    const expected = [
      'en',
      'en-bw',
      'en-ps',
      'en-wz',
      'es'
    ];
    const actual = this.owner.lookup('service:i18n').get('locales');

    assert.deepEqual(actual, expected, JSON.stringify(actual));
  });

  test('addTranslations adds to locales', function(assert) {
    const expected = [
      'en',
      'en-bw',
      'en-ps',
      'en-wz',
      'es',
      'it'
    ];

    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en' });
    i18n.addTranslations('it', {});
    const actual = i18n.get('locales');

    assert.deepEqual(actual, expected, JSON.stringify(actual));
  });

  test('addTranslations doesn\'t add duplicate locales', function(assert) {
    const expected = [
      'en',
      'en-bw',
      'en-ps',
      'en-wz',
      'es',
      'it'
    ];

    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en' });
    i18n.addTranslations('it', {});
    i18n.addTranslations('it', {});
    const actual = i18n.get('locales');

    assert.deepEqual(actual, expected, JSON.stringify(actual));
  });
});
