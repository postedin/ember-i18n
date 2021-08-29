import { inject as service } from '@ember/service';
import Helper from '@ember/component/helper';
import EmberObject, { observer, get } from '@ember/object';

function mergedContext(objectContext, hashContext) {
  return EmberObject.create({
    unknownProperty(key) {
      const fromHash = get(hashContext, key);
      return fromHash === undefined ? get(objectContext, key) : fromHash;
    }
  });
}

export default Helper.extend({
  i18n: service(),

  compute([key, contextObject = {}], interpolations) {
    const mergedInterpolations = mergedContext(contextObject, interpolations);

    const i18n = this.i18n;
    return i18n.t(key, mergedInterpolations);
  },

  _recomputeOnLocaleChange: observer('i18n.locale', function() {
    this.recompute();
  })
});
