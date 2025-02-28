import { run } from '@ember/runloop';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { translationMacro as t } from 'ember-i18n';

module('translationMacro', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en' });

    // eslint-disable-next-line ember/no-classic-classes
    this.object = EmberObject.extend({
      i18n: i18n,

      numberClicks: 9,

      tMacroProperty1: t('no.interpolations'),

      tMacroProperty2: t('with.interpolations', { clicks: 'numberClicks' }),
    }).create();
  });

  test('defines a computed property that translates without interpolations', function(assert) {
    assert.equal(this.object.get('tMacroProperty1'), 'text with no interpolations');
  });

  test('defines a computed property that translates with interpolations', function(assert) {
    assert.equal(this.object.get('tMacroProperty2'), 'Clicks: 9');
  });

  test('defines a computed property with dependencies', function(assert) {
    run(this.object, 'set', 'numberClicks', 13);
    assert.equal(this.object.get('tMacroProperty2'), 'Clicks: 13');
  });

  test('defines a computed property that depends on the locale', function(assert) {
    assert.equal(this.object.get('tMacroProperty1'), 'text with no interpolations');
    run(this.object, 'set', 'i18n.locale', 'es');
    assert.equal(this.object.get('tMacroProperty1'), 'texto sin interpolaciones');
  });
});
