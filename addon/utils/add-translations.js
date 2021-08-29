export default function addTranslations(locale, newTranslations, owner) {
  const key = `locale:${locale}/translations`;
  let factory = owner.factoryFor(key);
  let existingTranslations = factory && factory.class;

  if (existingTranslations == null) {
    existingTranslations = {};
    owner.register(key, existingTranslations);
  }

  Object.assign(existingTranslations, newTranslations);
}
