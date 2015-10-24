var classes = require('classes')
var Emitter = require('emitter')
var query = require('query')
var invalid = require('invalid')

var defaultOpt = {
  search: function (el) {
    return el.parentNode.firstElementChild.lastElementChild
  },
  successMsg: '✔',
  processMsg: 'checking...',
  errorClass: 'error',
  successClass: 'success'
}

/**
 * Validate
 *
 * `search` Required function for find error element
 * `errorClass` ['error'] className add to error element onerror, input element would be add `input-[errorClass]`
 * `successClass` ['success'] className add to error element onsuccess, input element would be add `input-[successClass]`
 * `successMsg` [''] Optional success message string add to error element, if it's a function, should return message according to input name
 * `processMsg` process message for promise
 *
 * @param {Element} form
 * @param {Object} opt options for validate
 * @api public
 */
function Validate(form, opt) {
  if (!(this instanceof Validate)) return new Validate(form, opt)
  this.el = form
  this.values_map = {}
  this.opt = assign({}, defaultOpt)
  assign(this.opt, opt)
  var inputs = this.inputs = filterInput(query.all('input', form))
  var self = this
  inputs.forEach(function (input) {
    input.onblur = function () {
      self.onblur(input)
    }
  })
}

Emitter(Validate.prototype)

Validate.prototype.onblur = function (el) {
  var val = el.value
  var opt = this.opt
  var name = el.name
  // Not change do nothing
  if (this.values_map[name] === val) return
  this.values_map[name] = val
  var errEl = this.opt.search(el)
  if (!errEl) throw new Error('can\'t find error element')
  var required = el.required
  var promise
  var results = this.emit('blur', name, val, required, el)
  var arr = this.emit('blur ' + name, val, el)
  results = results.concat(arr).filter(function (str) {
    if (str.then) {
      promise = str
      return false
    }
    return str.length
  })
  if (results.length) return this.showErrmsg(results[0], el)
  if (!promise) return this.onsuccess(el)
  var self = this
  errEl.innerHTML = opt.processMsg
  promise.then(function (str) {
    if (str) return self.showErrmsg(str, el)
    self.onsuccess(el)
  }, function (e) {
    classes(errEl).remove(opt.successClass)
    classes(errEl).add(opt.errorClass)
    errEl.innerHTML = e.message
  })
}

Validate.prototype.onsuccess = function (el) {
  var opt = this.opt
  var errEl = this.opt.search(el)
  classes(errEl).remove(opt.errorClass)
  classes(el).remove('input-' + opt.errorClass)
  if (opt.successClass) {
    classes(errEl).add(opt.successClass)
    classes(el).add('input-' + opt.successClass)
    errEl.innerHTML = opt.successMsg || ''
  }
}

/**
 * Check if all fields are valid
 *
 * @api public
 */
Validate.prototype.isValid = function () {
  var form = this.el
  var errEls = []
  var errorClass = this.opt.errorClass
  var search = this.opt.search
  this.inputs.forEach(function (input) {
    if (invalid(input, form)) return
    input.onblur()
    errEls.push(search(input))
    errEls.__target = input
  })
  var valid = true
  // errors might be hidden with invalid inputs
  errEls.forEach(function (el) {
    if (classes(el).has(errorClass)) {
      if (valid) el.__target.focus()
      valid = false
    }
  })
  return valid
}

/**
 * Show err message to el
 *
 * @param {String} str error message
 * @param {Element} el error element
 * @api private
 */
Validate.prototype.showErrmsg = function (str, el) {
  var opt = this.opt
  var errEl = opt.search(el)
  if (opt.successClass) {
    classes(errEl).remove(opt.successClass)
    classes(el).remove('input-' + opt.successClass)
  }
  classes(el).add('input-' + opt.errorClass)
  classes(errEl).add(opt.errorClass)
  errEl.innerHTML = str
}

// hack emit function to return result
Validate.prototype.emit = function(event){
  var res = []
  var s
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      s = callbacks[i].apply(this, args);
      // only cares about none null values
      if (s != null) res.push(s)
    }
  }

  return res;
};

Validate.setDefault = function (opt) {
  assign(defaultOpt, opt)
}

/**
 * Assign properties from `obj` to `o`, reutrn target object
 *
 * @param {Object} o target object
 * @param {Object} obj source object
 * @return target object
 * @api public
 */
function assign(o, obj) {
  for (var k in obj) {
    o[k] = obj[k]
  }
  return o
}

/**
 * No hidden inputs
 *
 * @param {Array} inputs
 * @api public
 */
function filterInput(els) {
  var res = []
  var el
  for (var i = 0, len = els.length; i < len; i++) {
    el = els[i]
    if (el.type === 'hidden') continue
    res.push(el)
  }
  return res
}

module.exports = Validate
