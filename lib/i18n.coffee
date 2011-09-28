I18n = {
  compile: Handlebars.compile

  translations: {}

  template: (key) ->
    result = I18n.translations[key]
    unless result?
      result = I18n.translations[key] = I18n.compile "Missing translation: " + key
    unless $.isFunction(result)
      result = I18n.translations[key] = I18n.compile result
    result

  t: (key, context) ->
    template = I18n.template key
    return template context
}

SC.I18n = I18n

isBinding = /(.+)Binding$/

# Much of this code was adapated from Sproutcore's bindAttr helper.
Handlebars.registerHelper 't', (key, options) ->
  context = this
  attrs = options.hash
  view = options.data.view

  # Generate a unique id for this element. This will be added as a
  # data attribute to the element so it can be looked up when
  # the bound property changes.
  elementID = "i18n-#{jQuery.uuid++}"

  SC.keys(attrs).forEach (property)->
    isBindingMatch = property.match(isBinding)
    if isBindingMatch?
      # Get the current values for any bound properties:
      propertyName = isBindingMatch[1]
      bindPath = attrs[property]
      currentValue = SC.getPath bindPath
      attrs[propertyName] = currentValue

      # Set up an observer for changes:
      invoker = null

      observer = ()->
        newValue = SC.getPath context, bindPath

        sc_assert "Attributes must be numbers, strings or booleans, not %@".fmt(newValue), !newValue? || typeof newValue == 'number' || typeof newValue == 'string' || typeof newValue == 'boolean'

        elem = view.$ "##{elementID}"

        # If we aren't able to find the element, it means the element
        # to which we were bound has been removed from the view.
        # In that case, we can assume the template has been re-rendered
        # and we need to clean up the observer.
        if elem.length == 0
          SC.removeObserver context, bindPath, invoker
          return

        attrs[propertyName] = newValue
        elem.html I18n.t key, attrs

      invoker = ->
        SC.run.once observer

      SC.addObserver context, bindPath, invoker

  new Handlebars.SafeString "<span id='#{elementID}'>#{I18n.t key, attrs}</span>"