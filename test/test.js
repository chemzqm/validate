/*global describe, it, beforeEach, afterEach*/
var assert = require('assert')
var Validate = require('..')

function triggerEvent(obj, evt) {
  var fireOnThis = obj
  var evObj
  if( document.createEvent ) {
    evObj = document.createEvent('MouseEvents')
    evObj.initEvent( evt, true, false )
    fireOnThis.dispatchEvent( evObj )
  }
  else if( document.createEventObject ) { //IE
    evObj = document.createEventObject()
    fireOnThis.fireEvent( 'on' + evt, evObj )
  }
}

Validate.setDefault({
  search: function (el) {
    return el.previousElementSibling
  },
  successMsg: 'ok',
  processMsg: 'checking'
})

describe('validate component', function () {
  var form
  var input
  beforeEach(function () {
    form = document.createElement('form')
    document.body.appendChild(form)
    var span = document.createElement('span')
    form.appendChild(span)
    input = document.createElement('input')
    input.required = true
    input.name = 'name'
    input.type = 'text'
    form.appendChild(input)
  })

  afterEach(function () {
    document.body.removeChild(form)
    input = null
  })

  it('should pass correct arguments on blur', function () {
    var validater = Validate(form)
    validater.on('blur', function (name, val, required, el) {
      assert.equal(name, 'name')
      assert.equal(val, 'tobi')
      assert.equal(required, true)
      assert.equal(el, input)
    })
    input.value = 'tobi'
    triggerEvent(input, 'blur')
  })

  it('should pass value and element to `name blur` event', function () {
    var validater = Validate(form)
    triggerEvent(input, 'blur')
    validater.on('name blur', function (val, el) {
      assert.equal(val, 'tobi')
      assert.equal(el, input)
    })
    input.value = 'tobi'
    triggerEvent(input, 'blur')
  })

  it('should apply error class and error message on error', function () {
    var validater = Validate(form)
    triggerEvent(input, 'blur')
    validater.on('blur name', function (val) {
      if (val.length < 5) return 'at least 5 charactors'
    })
    input.value = 'tobi'
    triggerEvent(input, 'blur')
    var span = input.previousElementSibling
    assert.equal(span.className, 'error')
    assert.equal(span.textContent, 'at least 5 charactors')
    assert.equal(input.className, 'input-error')
  })

  it('should apply success class and message on success', function () {
    var validater = Validate(form)
    var span = input.previousElementSibling
    span.className = 'error'
    input.className = 'input-error'
    validater.on('blur name', function (val) {
      if (val.length < 5) return 'at least 5 charactors'
    })
    input.value = 'jennfer'
    triggerEvent(input, 'blur')
    assert.equal(span.className, 'success')
    assert.equal(span.textContent, 'ok')
    assert.equal(input.className, 'input-success')
  })

  it('should support promise validate', function (done) {
    var validater = Validate(form)
    var span = input.previousElementSibling
    span.className = 'error'
    input.className = 'input-error'
    validater.on('blur name', function (val) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          if (val.length < 5) return resolve('at least 5 charactors')
          resolve()
        }, 20)
      })
    })
    input.value = 'tobi'
    triggerEvent(input, 'blur')
    assert.equal(span.textContent, 'checking')
    setTimeout(function () {
      assert.equal(span.className, 'error')
      assert.equal(span.textContent, 'at least 5 charactors')
      done()
    }, 40)
  })

  it('should trigger all listener when isValid called', function () {
    form.appendChild(document.createElement('span'))
    var el = document.createElement('input')
    el.name = 'email'
    el.type = 'text'
    el.required = true
    el.value = ' '
    form.appendChild(el)
    var validater = Validate(form)
    var count = 0
    validater.on('blur', function (name, val, required) {
      if (required && val.trim() === '') {
        count++
        return name + ' required'
      }
    })
    validater.on('blur name', function () {
      count++
    })
    validater.on('blur email', function () {
      count++
    })
    var valid = validater.isValid()
    assert.equal(count, 4)
    assert.equal(valid, false)
  })

  it('should apply success class and message on success', function () {
    var validater = Validate(form)
    var span = input.previousElementSibling
    span.className = 'error'
    input.className = 'input-error'
    validater.on('blur name', function (val) {
      if (val.length < 5) return 'at least 5 charactors'
    })
    input.value = 'jennfer'
    triggerEvent(input, 'blur')
    assert.equal(span.className, 'success')
    assert.equal(span.textContent, 'ok')
    assert.equal(input.className, 'input-success')
  })

  it('should ignore disable fileds when called isValid', function () {
    form.appendChild(document.createElement('span'))
    var el = document.createElement('input')
    el.type = 'text'
    el.name = 'title'
    el.value = 'invalid'
    el.disabled = true
    form.appendChild(el)
    var validater = Validate(form)
    validater.on('blur title', function (val) {
      if (val === 'invalid') return 'invalid value'
    })
    assert.equal(validater.isValid(), true)
    el.disabled = false
    assert.equal(validater.isValid(), false)
  })

  it('should clean className for field with empty value and not required', function () {
    form.appendChild(document.createElement('span'))
    var el = document.createElement('input')
    el.type = 'text'
    el.name = 'title'
    el.value = 'invalid'
    form.appendChild(el)
    var validater = Validate(form)
    validater.on('blur title', function (val) {
      if (val === 'invalid') return 'invalid value'
    })
    triggerEvent(el, 'blur')
    assert.equal(el.className, 'input-error')
    assert.equal(el.previousElementSibling.className, 'error')
    el.value = ''
    triggerEvent(el, 'blur')
    assert.equal(el.className, '')
    assert.equal(el.previousElementSibling.className, '')
  })

  it('should clean all fields on form reset', function () {
    form.appendChild(document.createElement('span'))
    var el = document.createElement('input')
    el.type = 'text'
    el.name = 'title'
    el.value = 'invalid'
    el.className = 'input-error'
    form.appendChild(el)
    input.className = 'input-error'
    el.previousElementSibling.className = 'error'
    input.previousElementSibling.className = 'error'
    el.previousElementSibling.textContent = 'not valid'
    var validater = Validate(form)
    form.reset()
    assert.equal(el.className, '')
    assert.equal(input.className, '')
    assert.equal(el.previousElementSibling.className, '')
    assert.equal(input.previousElementSibling.className, '')
    assert.equal(validater.opt.search(el).textContent, '')
  })

  it('should unbind event on unbind()', function () {
    input.className = 'input-error'
    var validater = Validate(form)
    validater.unbind()
    form.reset()
    assert.equal(input.className, 'input-error')
  })

  it('should ignore unsuccessful contorls', function () {
    function createInput(type) {
      var node = document.createElement('input')
      node.type = type
      form.appendChild(node)
    }
    createInput('submit')
    createInput('button')
    createInput('image')
    createInput('reset')
    createInput('file')
    createInput('hidden')
    var validater = Validate(form)
    assert.equal(validater.inputs.length, 1)
  })

  it('should be invalid if input has error className', function () {
    var validater = Validate(form)
    form.reset()
    validater.on('blur', function () {
      return 'required'
    })
    return validater.isvalid(input).then(function (res) {
      assert.equal(res, false)
    })
  })

  it('should be valid if input has no error', function () {
    var validater = Validate(form)
    form.reset()
    return validater.isvalid(input).then(function (res) {
      assert.equal(res, true)
    })
  })

  it('should not be valid if promise return error', function () {
    var validater = Validate(form)
    form.reset()
    validater.on('blur', function () {
      return Promise.reject('failed')
    })
    return validater.isvalid(input).then(function (res) {
      assert.equal(res, false)
    })
  })
})
