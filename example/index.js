var form = document.forms[0]
var Validate = require('..')
var debounce = require('debounce')

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
