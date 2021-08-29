import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('I18nService#t', function(hooks) {
  setupTest(hooks);

  test('returns true when the key exists', function(assert) {
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en' });

    assert.true(i18n.exists('no.interpolations'));
  });

  test('returns false when the key does not exist', function(assert) {
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en' });

    assert.false(i18n.exists('not.yet.translated'));
  });

  test('works with interpolations', function(assert) {
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en' });

    assert.true(i18n.exists('with.interpolations', { count: 2 }));
  });

  test('reports false when the key does not exist, but the fallback does', function(assert) {
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en' });

    assert.false(i18n.exists('not.yet.translated', { default: 'no.interpolations' }));
  });

  test('fallsback to the parent locale', function(assert) {
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en-ps' });

    assert.true(i18n.exists('no.interpolations.either'));
  });

  test('non-existing translations when checked twice do not exist', function (assert) {
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en' });

    assert.false(i18n.exists('not.existing'));
    assert.equal(i18n.t('not.existing'), 'Missing translation: not.existing');
    assert.false(i18n.exists('not.existing'));
  });
});
