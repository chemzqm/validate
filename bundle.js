/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!**************************!*\
  !*** ./example/index.js ***!
  \**************************/
/***/ function(module, exports, __webpack_require__) {

	var form = document.forms[0]
	var Validate = __webpack_require__(/*! .. */ 1)
	var debounce = __webpack_require__(/*! debounce */ 9)
	
	var inputs = [].slice.call(document.querySelectorAll('input'))
	inputs.forEach(function (input) {
	  input.onkeyup = function () {
	    var fn = debounce(input.onblur, 300)
	    fn()
	  }
	})
	
	var validater = Validate(form, {
	  search: function (el) {
	    return el.parentNode.firstElementChild.lastElementChild
	  }
	  //errorClass: 'error',
	  //successClass: 'success'
	})
	
	validater.on('blur', function (name, val, required) {
	  if (required && !val) return 'Please enter your ' + name
	})
	
	validater.on('blur name', function (val) {
	  if (!/^[\w_]+$/.test(val)) return 'Should only contain letters, numbers and _'
	  if (val.length < 6) return 'At least have 6 characters'
	  return new Promise(function (resolve, reject) {
	    setTimeout(function() {
	      if (val === 'obmygod') return reject(new Error('request error'))
	      if (val === 'abcdef') {
	        resolve('abcdef already exists')
	      } else {
	        resolve('')
	      }
	    }, 1500)
	  })
	})
	
	validater.on('blur email', function (val) {
	  if (!/.+\@.+\..+/.test(val)) return 'Please enter valid email address'
	})
	
	validater.on('blur age', function (val) {
	  if (!/\d+/.test(val)) return 'Please enter valid age'
	})
	
	form.onsubmit = function (e) {
	  e.preventDefault()
	  if (validater.isValid()) {
	    console.log('submit data')
	  }
	}


/***/ },
/* 1 */
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ function(module, exports, __webpack_require__) {

	var classes = __webpack_require__(/*! classes */ 2)
	var Emitter = __webpack_require__(/*! emitter */ 4)
	var query = __webpack_require__(/*! query */ 5)
	var invalid = __webpack_require__(/*! invalid */ 6)
	var events = __webpack_require__(/*! event */ 8)
	
	var defaultOpt = {
	  search: function(el) {
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
	 * `successMsg` ['✔']  success message string add to error element, if it's a function, should return message according to input name
	 * `processMsg` process message for promise
	 * `exclude` optional regex for filter field by name
	 *
	 * @param {Element} form
	 * @param {Object} opt options for validate
	 * @api public
	 */
	function Validate(form, opt) {
	  if (!(this instanceof Validate)) return new Validate(form, opt)
	  opt = opt || {}
	  this.el = form
	  this.values_map = {}
	  this.opt = assign({}, defaultOpt)
	  assign(this.opt, opt)
	  var inputs = this.inputs = filterInput(query.all('input', form))
	  if (opt.exclude) {
	    inputs.filter(function(input) {
	      return !opt.exclude.test(input.name)
	    })
	  }
	  var self = this
	  inputs.forEach(function(input) {
	    input.onblur = function() {
	      self.onblur(input)
	    }
	  })
	  this._reset = this.reset.bind(this)
	  events.bind(this.el, 'reset', this._reset)
	}
	
	Emitter(Validate.prototype)
	
	/**
	 * Clean all input status
	 *
	 * @api public
	 */
	Validate.prototype.reset = function () {
	  this.inputs.forEach(function (input) {
	    this.clean(input)
	  }, this)
	}
	
	Validate.prototype.unbind = function () {
	  events.unbind(this.el, 'reset', this._reset)
	}
	
	Validate.prototype.onblur = function(el) {
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
	  if (!required && val === '') return this.clean(el)
	  results = results.concat(arr).filter(function(str) {
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
	  promise.then(function(str) {
	    if (str) return self.showErrmsg(str, el)
	    self.onsuccess(el)
	  }, function(e) {
	    classes(errEl).remove(opt.successClass)
	    classes(errEl).add(opt.errorClass)
	    errEl.innerHTML = e.message
	  })
	}
	
	Validate.prototype.onsuccess = function(el) {
	  var opt = this.opt
	  var errEl = this.opt.search(el)
	  classes(errEl).remove(opt.errorClass)
	  classes(el).remove('input-' + opt.errorClass)
	  if (opt.successClass) {
	    classes(el).add('input-' + opt.successClass)
	    classes(errEl).add(opt.successClass)
	    errEl.innerHTML = opt.successMsg || ''
	  }
	}
	
	/**
	 * clean classes and message
	 *
	 * @param {Element} el
	 * @api public
	 */
	Validate.prototype.clean = function(el) {
	    var opt = this.opt
	    var errEl = this.opt.search(el)
	    classes(el).remove('input-' + opt.successClass)
	    classes(el).remove('input-' + opt.errorClass)
	    classes(errEl).remove(opt.successClass)
	    classes(errEl).remove(opt.errorClass)
	    errEl.innerHTML = ''
	  }
	  /**
	   * Check if all fields are valid
	   *
	   * @return {Boolean} valid
	   * @api public
	   */
	Validate.prototype.isValid = function() {
	  var form = this.el
	  var errEls = []
	  var errorClass = this.opt.errorClass
	  var search = this.opt.search
	  this.inputs.forEach(function(input) {
	    if (invalid(input, form)) return
	    input.onblur()
	    var errEl = search(input)
	    errEls.push(errEl)
	    errEl.__target = input
	  })
	  var valid = true
	    // errors might be hidden with invalid inputs
	  errEls.forEach(function(el) {
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
	Validate.prototype.showErrmsg = function(str, el) {
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
	Validate.prototype.emit = function(event) {
	  var res = []
	  var s
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1),
	    callbacks = this._callbacks['$' + event];
	
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
	
	Validate.setDefault = function(opt) {
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


/***/ },
/* 2 */
/*!**************************************!*\
  !*** ./~/component-classes/index.js ***!
  \**************************************/
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	
	var index = __webpack_require__(/*! indexof */ 3);
	
	/**
	 * Whitespace regexp.
	 */
	
	var re = /\s+/;
	
	/**
	 * toString reference.
	 */
	
	var toString = Object.prototype.toString;
	
	/**
	 * Wrap `el` in a `ClassList`.
	 *
	 * @param {Element} el
	 * @return {ClassList}
	 * @api public
	 */
	
	module.exports = function(el){
	  return new ClassList(el);
	};
	
	/**
	 * Initialize a new ClassList for `el`.
	 *
	 * @param {Element} el
	 * @api private
	 */
	
	function ClassList(el) {
	  if (!el || !el.nodeType) {
	    throw new Error('A DOM element reference is required');
	  }
	  this.el = el;
	  this.list = el.classList;
	}
	
	/**
	 * Add class `name` if not already present.
	 *
	 * @param {String} name
	 * @return {ClassList}
	 * @api public
	 */
	
	ClassList.prototype.add = function(name){
	  // classList
	  if (this.list) {
	    this.list.add(name);
	    return this;
	  }
	
	  // fallback
	  var arr = this.array();
	  var i = index(arr, name);
	  if (!~i) arr.push(name);
	  this.el.className = arr.join(' ');
	  return this;
	};
	
	/**
	 * Remove class `name` when present, or
	 * pass a regular expression to remove
	 * any which match.
	 *
	 * @param {String|RegExp} name
	 * @return {ClassList}
	 * @api public
	 */
	
	ClassList.prototype.remove = function(name){
	  if ('[object RegExp]' == toString.call(name)) {
	    return this.removeMatching(name);
	  }
	
	  // classList
	  if (this.list) {
	    this.list.remove(name);
	    return this;
	  }
	
	  // fallback
	  var arr = this.array();
	  var i = index(arr, name);
	  if (~i) arr.splice(i, 1);
	  this.el.className = arr.join(' ');
	  return this;
	};
	
	/**
	 * Remove all classes matching `re`.
	 *
	 * @param {RegExp} re
	 * @return {ClassList}
	 * @api private
	 */
	
	ClassList.prototype.removeMatching = function(re){
	  var arr = this.array();
	  for (var i = 0; i < arr.length; i++) {
	    if (re.test(arr[i])) {
	      this.remove(arr[i]);
	    }
	  }
	  return this;
	};
	
	/**
	 * Toggle class `name`, can force state via `force`.
	 *
	 * For browsers that support classList, but do not support `force` yet,
	 * the mistake will be detected and corrected.
	 *
	 * @param {String} name
	 * @param {Boolean} force
	 * @return {ClassList}
	 * @api public
	 */
	
	ClassList.prototype.toggle = function(name, force){
	  // classList
	  if (this.list) {
	    if ("undefined" !== typeof force) {
	      if (force !== this.list.toggle(name, force)) {
	        this.list.toggle(name); // toggle again to correct
	      }
	    } else {
	      this.list.toggle(name);
	    }
	    return this;
	  }
	
	  // fallback
	  if ("undefined" !== typeof force) {
	    if (!force) {
	      this.remove(name);
	    } else {
	      this.add(name);
	    }
	  } else {
	    if (this.has(name)) {
	      this.remove(name);
	    } else {
	      this.add(name);
	    }
	  }
	
	  return this;
	};
	
	/**
	 * Return an array of classes.
	 *
	 * @return {Array}
	 * @api public
	 */
	
	ClassList.prototype.array = function(){
	  var className = this.el.getAttribute('class') || '';
	  var str = className.replace(/^\s+|\s+$/g, '');
	  var arr = str.split(re);
	  if ('' === arr[0]) arr.shift();
	  return arr;
	};
	
	/**
	 * Check if class `name` is present.
	 *
	 * @param {String} name
	 * @return {ClassList}
	 * @api public
	 */
	
	ClassList.prototype.has =
	ClassList.prototype.contains = function(name){
	  return this.list
	    ? this.list.contains(name)
	    : !! ~index(this.array(), name);
	};


/***/ },
/* 3 */
/*!**********************************************************!*\
  !*** ./~/component-classes/~/component-indexof/index.js ***!
  \**********************************************************/
/***/ function(module, exports) {

	module.exports = function(arr, obj){
	  if (arr.indexOf) return arr.indexOf(obj);
	  for (var i = 0; i < arr.length; ++i) {
	    if (arr[i] === obj) return i;
	  }
	  return -1;
	};

/***/ },
/* 4 */
/*!**************************************!*\
  !*** ./~/component-emitter/index.js ***!
  \**************************************/
/***/ function(module, exports) {

	
	/**
	 * Expose `Emitter`.
	 */
	
	module.exports = Emitter;
	
	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */
	
	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};
	
	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */
	
	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}
	
	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
	    .push(fn);
	  return this;
	};
	
	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.once = function(event, fn){
	  function on() {
	    this.off(event, on);
	    fn.apply(this, arguments);
	  }
	
	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};
	
	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	
	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }
	
	  // specific event
	  var callbacks = this._callbacks['$' + event];
	  if (!callbacks) return this;
	
	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks['$' + event];
	    return this;
	  }
	
	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};
	
	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */
	
	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks['$' + event];
	
	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }
	
	  return this;
	};
	
	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */
	
	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks['$' + event] || [];
	};
	
	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */
	
	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ },
/* 5 */
/*!************************************!*\
  !*** ./~/component-query/index.js ***!
  \************************************/
/***/ function(module, exports) {

	function one(selector, el) {
	  return el.querySelector(selector);
	}
	
	exports = module.exports = function(selector, el){
	  el = el || document;
	  return one(selector, el);
	};
	
	exports.all = function(selector, el){
	  el = el || document;
	  return el.querySelectorAll(selector);
	};
	
	exports.engine = function(obj){
	  if (!obj.one) throw new Error('.one callback required');
	  if (!obj.all) throw new Error('.all callback required');
	  one = obj.one;
	  exports.all = obj.all;
	  return exports;
	};


/***/ },
/* 6 */
/*!**************************************!*\
  !*** ./~/invalid-component/index.js ***!
  \**************************************/
/***/ function(module, exports, __webpack_require__) {

	var computedStyle = __webpack_require__(/*! computed-style */ 7)
	
	/**
	 * Check if element is invalid
	 *
	 * @param {Element} el
	 * @param {Element} [topEl] optional top element to check
	 * @api public
	 */
	module.exports = function (el, topEl) {
	  topEl = topEl || document.body
	  do {
	    if (el.disabled) return true
	    if (hidden(el)) return true
	    el = el.parentNode
	    // parent could be removed
	    if (!el || el === topEl) break
	  } while(el)
	  return false
	}
	
	function hidden(el) {
	  var display = computedStyle(el, 'display')
	  if (display === 'none') return true
	  var visibility = computedStyle(el, 'visibility')
	  if (visibility === 'hidden') return true
	  return false
	}


/***/ },
/* 7 */
/*!*********************************************************!*\
  !*** ./~/computed-style/dist/computedStyle.commonjs.js ***!
  \*********************************************************/
/***/ function(module, exports) {

	// DEV: We don't use var but favor parameters since these play nicer with minification
	function computedStyle(el, prop, getComputedStyle, style) {
	  getComputedStyle = window.getComputedStyle;
	  style =
	      // If we have getComputedStyle
	      getComputedStyle ?
	        // Query it
	        // TODO: From CSS-Query notes, we might need (node, null) for FF
	        getComputedStyle(el) :
	
	      // Otherwise, we are in IE and use currentStyle
	        el.currentStyle;
	  if (style) {
	    return style
	    [
	      // Switch to camelCase for CSSOM
	      // DEV: Grabbed from jQuery
	      // https://github.com/jquery/jquery/blob/1.9-stable/src/css.js#L191-L194
	      // https://github.com/jquery/jquery/blob/1.9-stable/src/core.js#L593-L597
	      prop.replace(/-(\w)/gi, function (word, letter) {
	        return letter.toUpperCase();
	      })
	    ];
	  }
	}
	
	module.exports = computedStyle;


/***/ },
/* 8 */
/*!************************************!*\
  !*** ./~/component-event/index.js ***!
  \************************************/
/***/ function(module, exports) {

	var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
	    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
	    prefix = bind !== 'addEventListener' ? 'on' : '';
	
	/**
	 * Bind `el` event `type` to `fn`.
	 *
	 * @param {Element} el
	 * @param {String} type
	 * @param {Function} fn
	 * @param {Boolean} capture
	 * @return {Function}
	 * @api public
	 */
	
	exports.bind = function(el, type, fn, capture){
	  el[bind](prefix + type, fn, capture || false);
	  return fn;
	};
	
	/**
	 * Unbind `el` event `type`'s callback `fn`.
	 *
	 * @param {Element} el
	 * @param {String} type
	 * @param {Function} fn
	 * @param {Boolean} capture
	 * @return {Function}
	 * @api public
	 */
	
	exports.unbind = function(el, type, fn, capture){
	  el[unbind](prefix + type, fn, capture || false);
	  return fn;
	};

/***/ },
/* 9 */
/*!*****************************!*\
  !*** ./~/debounce/index.js ***!
  \*****************************/
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */
	
	var now = __webpack_require__(/*! date-now */ 10);
	
	/**
	 * Returns a function, that, as long as it continues to be invoked, will not
	 * be triggered. The function will be called after it stops being called for
	 * N milliseconds. If `immediate` is passed, trigger the function on the
	 * leading edge, instead of the trailing.
	 *
	 * @source underscore.js
	 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
	 * @param {Function} function to wrap
	 * @param {Number} timeout in ms (`100`)
	 * @param {Boolean} whether to execute at the beginning (`false`)
	 * @api public
	 */
	
	module.exports = function debounce(func, wait, immediate){
	  var timeout, args, context, timestamp, result;
	  if (null == wait) wait = 100;
	
	  function later() {
	    var last = now() - timestamp;
	
	    if (last < wait && last > 0) {
	      timeout = setTimeout(later, wait - last);
	    } else {
	      timeout = null;
	      if (!immediate) {
	        result = func.apply(context, args);
	        if (!timeout) context = args = null;
	      }
	    }
	  };
	
	  return function debounced() {
	    context = this;
	    args = arguments;
	    timestamp = now();
	    var callNow = immediate && !timeout;
	    if (!timeout) timeout = setTimeout(later, wait);
	    if (callNow) {
	      result = func.apply(context, args);
	      context = args = null;
	    }
	
	    return result;
	  };
	};


/***/ },
/* 10 */
/*!****************************************!*\
  !*** ./~/debounce/~/date-now/index.js ***!
  \****************************************/
/***/ function(module, exports) {

	module.exports = Date.now || now
	
	function now() {
	    return new Date().getTime()
	}


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map