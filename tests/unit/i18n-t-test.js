import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('I18nService#t', function(hooks) {
  setupTest(hooks);

  test('falls back to parent locale', function(assert) {
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en-ps' });

    assert.equal('' + i18n.t('no.interpolations'), 'téxt wîth nö ìntérpølåtíôns');
    assert.equal(i18n.t('with.interpolations', { clicks: 8 }), 'Clicks: 8');
  });

  test('allows number values in translations', function(assert) {
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en' });

    assert.equal(i18n.t('with.number'), "3");
  });

  test('supports changing locales', function(assert) {
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en' });
    assert.equal('' + i18n.t('no.interpolations'), 'text with no interpolations');

    run(i18n, 'set', 'locale', 'en-ps');
    assert.equal('' + i18n.t('no.interpolations'), 'téxt wîth nö ìntérpølåtíôns');

    run(i18n, 'set', 'locale', 'en');
    assert.equal('' + i18n.t('no.interpolations'), 'text with no interpolations');

    run(i18n, 'set', 'locale', 'es');
    assert.equal('' + i18n.t('no.interpolations'), 'texto sin interpolaciones');

    run(i18n, 'set', 'locale', 'en');
    assert.equal('' + i18n.t('no.interpolations'), 'text with no interpolations');
  });

  test('returns "missing translation" translations', function(assert) {
    const result = this.owner.factoryFor('service:i18n').create({ locale: 'en' }).t('not.yet.translated', {});
    assert.equal(result, 'Missing translation: not.yet.translated');
  });

  test('emits "missing" events', function(assert) {
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en' });
    const calls = [];
    function spy() { calls.push(arguments); }
    i18n.on('missing', spy);

    i18n.t('not.yet.translated', { some: 'data' });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].length, 3);
    assert.equal(calls[0][0], 'en');
    assert.equal(calls[0][1], 'not.yet.translated');
    assert.equal(calls[0][2].some, 'data');
  });

  test('adds RTL markers if the locale calls for it', function(assert) {
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en-bw' });
    const result = i18n.t('no.interpolations');

    assert.equal(result.toString(), '\u202Bsnoitalopretni on htiw txet\u202C');
  });

  test("applies pluralization rules from the locale", function(assert) {
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en' });

    assert.equal(i18n.t('pluralized.translation', { count: 0 }), '0 Clicks');
    assert.equal(i18n.t('pluralized.translation', { count: '1' }), 'One Click');
    assert.equal(i18n.t('pluralized.translation', { count: 2 }), '2 Clicks');
  });

  test("applies custom pluralization rules", function(assert) {
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en-wz' });

    assert.equal(i18n.t('pluralized.translation', { count: '0' }), 'Zero Clicks');
    assert.equal(i18n.t('pluralized.translation', { count: 1 }), 'One Click');
    assert.equal(i18n.t('pluralized.translation', { count: 2 }), '2 Clicks');
  });

  test("applies provided default translation in cascade when main one is not found", function(assert) {
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en' });
    const defaultsChain = ['with.pretty-good-interpolations', 'with.interpolations'];
    const calls = [];
    function spy() { calls.push(arguments); }
    i18n.on('missing', spy);
    assert.equal(i18n.t('with.great-interpolations', { clicks: 8, default: defaultsChain }), 'Clicks: 8', 'default can be an array');
    assert.equal(i18n.t('with.great-interpolations', { clicks: 8, default: 'with.interpolations' }), 'Clicks: 8', 'default can be an string');
    assert.equal(calls.length, 0, 'The missing event is not fired when a fallback translation is found');
    assert.equal(i18n.t('not.yet.translated', { clicks: 8, default: ['not.translated.either'] }), 'Missing translation: not.yet.translated');
    assert.equal(calls[0][1], 'not.yet.translated', 'When the "missing" event is fired, it\'s fired with the provided key');
  });

  test("check unknown locale", function(assert) {
    const result = this.owner.factoryFor('service:i18n').create({ locale: 'uy' }).t('not.yet.translated', {count: 2});
    assert.equal(result, 'Missing translation: not.yet.translated');
  });

  test('provided default translation works as expected when locale is default', function(assert) {
    this.owner.register('config:environment', {
      i18n: {
        defaultLocale: 'en',
        defaultFallback: true
      }
    });
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'en' });
    assert.equal('' + i18n.t('defined.in.default.value', { count: 2 }), 'Default 2 value');
  });

  test('falls back to default translation when label not found for locale', function(assert) {
    this.owner.register('config:environment', {
      i18n: {
        defaultLocale: 'en',
        defaultFallback: true
      }
    });
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'es' });
    assert.equal('' + i18n.t('defined.in.default.value', { count: 2 }), 'Default 2 value');
  });

  test('falls back to default translation when label not found and locale not found', function(assert) {
    this.owner.register('config:environment', {
      i18n: {
        defaultLocale: 'en',
        defaultFallback: true
      }
    });
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'foobz' });
    assert.equal('' + i18n.t('defined.in.default.value', { count: 2 }), 'Default 2 value');
  });

  test('does not fall back to default translation when configuration true but defaultLocale falsy', function(assert) {
    this.owner.register('config:environment', {
      i18n: {
        defaultLocale: '',
        defaultFallback: true
      }
    });
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'es' });
    assert.equal('' + i18n.t('defined.in.default.value', { count: 2 }), 'Missing translation: defined.in.default.value');
  });

  test('does not fall back to default translation when configuration false', function(assert) {
    this.owner.register('config:environment', {
      i18n: {
        defaultLocale: 'en',
        defaultFallback: false
      }
    });
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'es' });
    assert.equal('' + i18n.t('defined.in.default.value', { count: 2 }), 'Missing translation: defined.in.default.value');
  });

  test('does not fall back to default translation when configuration null', function(assert) {
    this.owner.register('config:environment', {
      i18n: {
        defaultLocale: 'en',
        defaultFallback: null
      }
    });
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'es' });
    assert.equal('' + i18n.t('defined.in.default.value', { count: 2 }), 'Missing translation: defined.in.default.value');
  });

  test('does not fall back to default translation when configuration undefined', function(assert) {
    this.owner.register('config:environment', {
      i18n: {
        defaultLocale: 'en',
        defaultFallback: undefined
      }
    });
    const i18n = this.owner.factoryFor('service:i18n').create({ locale: 'es' });
    assert.equal('' + i18n.t('defined.in.default.value', { count: 2 }), 'Missing translation: defined.in.default.value');
  });
});
