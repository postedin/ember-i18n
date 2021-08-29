import { computed } from '@ember/object';
import Helper from '@ember/component/helper';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { render } from '@ember/test-helpers';

module('t helper', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    if (Helper == null) {
      const initializer = this.container.lookupFactory('initializer:ember-i18n-legacy-helper');
      initializer.initialize(this.registry);
    }

    const i18n = this.i18n = this.owner.lookup('service:i18n');
    i18n.set('locale', 'en');

    this.addTranslations = function(locale, translations) {
      run(i18n, 'addTranslations', locale, translations);
    };
  });

  hooks.afterEach(function() {
    run(this.i18n, 'destroy');
  });

  test('simple text, static key', async function(assert) {
    this.addTranslations('en', { 'foo.bar': 'Foo Bar' });

    await render(hbs`{{t 'foo.bar'}}`);
    assert.equal(this.$().text(), 'Foo Bar');
  });

  test('text with HTML, static key', async function(assert) {
    this.addTranslations('en', { name: '<em>Name</em>:' });

    await render(hbs`{{t 'name'}}`);
    assert.equal(this.$().html(), '<em>Name</em>:');
  });

  test('dynamic key', async function(assert) {
    this.addTranslations('en', { foo: 'Foo', bar: 'Bar' });
    this.set('someKey', 'foo');

    await render(hbs`{{t someKey}}`);
    assert.equal(this.$().text(), 'Foo');

    run(this, 'set', 'someKey', 'bar');
    assert.equal(this.$().text(), 'Bar');
  });

  test('interpolations', async function(assert) {
    this.addTranslations('en', { 'bowl of soup': 'A bowl of {{soup}}' });
    this.set('soup', 'bisque');

    await render(hbs`{{t 'bowl of soup' soup=soup}}`);
    assert.equal(this.$().text(), 'A bowl of bisque');

    run(this, 'set', 'soup', 'clam chowder');
    assert.equal(this.$().text(), 'A bowl of clam chowder');
  });

  test('interpolations with passed context', async function(assert) {
    this.addTranslations('en', { 'bowl of soup': 'A bowl of {{soup}}' });
    this.set('soup', 'bisque');

    this.set('contextObject', computed('soup', function() {
      return {
        soup: this.soup
      };
    }));

    await render(hbs`{{t 'bowl of soup' contextObject}}`);
    assert.equal(this.$().text(), 'A bowl of bisque');

    run(this, 'set', 'soup', 'clam chowder');
    assert.equal(this.$().text(), 'A bowl of clam chowder');
  });

  test('interpolations with passed context and a hash', async function(assert) {
    this.addTranslations('en', { 'bowl of soup': 'A bowl of {{soup}} or {{salad}}' });
    this.set('soup', 'bisque');
    this.set('salad', 'mixed greens');

    this.set('contextObject', computed('soup', function() {
      return {
        soup: this.soup
      };
    }));

    await render(hbs`{{t 'bowl of soup' contextObject salad=salad}}`);
    assert.equal(this.$().text(), 'A bowl of bisque or mixed greens');

    run(this, 'set', 'soup', 'clam chowder');
    run(this, 'set', 'salad', 'cobb salad');
    assert.equal(this.$().text(), 'A bowl of clam chowder or cobb salad');
  });

  test('interpolations with passed context and a hash - hash overrides context', async function(assert) {
    this.addTranslations('en', { 'A delicious entree': 'A delicious {{entree}}' });
    this.set('entreeFromContext', 'steak');
    this.set('entreeFromHash', 'pasta');

    this.set('contextObject', computed('entreeFromContext', function() {
      return {
        soup: this.entreeFromContext
      };
    }));

    await render(hbs`{{t 'A delicious entree' contextObject entree=entreeFromHash}}`);
    assert.equal(this.$().text(), 'A delicious pasta');

    run(this, 'set', 'entreeFromContext', 'burger');
    run(this, 'set', 'entreeFromHash', 'pizza');
    assert.equal(this.$().text(), 'A delicious pizza');
  });

  test('locale change', async function(assert) {
    this.addTranslations('en', { soup: 'Soup' });
    this.addTranslations('zh', { soup: '湯' });

    await render(hbs`{{t 'soup'}}`);
    assert.equal(this.$().text(), 'Soup');

    run(this.i18n, 'set', 'locale', 'zh');
    assert.equal(this.$().text(), '湯');
  });

  test('pluralization', async function(assert) {
    this.addTranslations('en', {
      bowls: {
        one: 'one bowl',
        other: '{{count}} bowls'
      }
    });
    run(this, 'set', 'numberOfBowls', 0);

    await render(hbs`{{t 'bowls' count=numberOfBowls}}`);
    assert.equal(this.$().text(), '0 bowls');

    run(this, 'set', 'numberOfBowls', 1);
    assert.equal(this.$().text(), 'one bowl');

    run(this, 'set', 'numberOfBowls', 2);
    assert.equal(this.$().text(), '2 bowls');
  });
});
