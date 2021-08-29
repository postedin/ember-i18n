/* global t, expectTranslation */

import { visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | {{t}} Helper', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function() {
    await visit('/');
  });

  test("t test helper", function(assert) {
    assert.equal(t("pluralized.translation", { count: 1 }), "One Click", "test-helpers t returns translation");
  });

  test("expectTranslation test helper", function() {
    expectTranslation('.no-interpolations', 'no.interpolations');
  });
});
