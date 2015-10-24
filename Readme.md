# Validate

[![Build Status](https://secure.travis-ci.org/chemzqm/validate.png)](http://travis-ci.org/chemzqm/validate)

Validate input elements in an easy way

* *Design friendly* write html by yourself, no generate html, className change only
* *locale friendly* write error messages in javascript
* *Smart* promise awareness, [invlid](https://github.com/chemzqm/invalid) fileds ignored on `isValid()` call
* *No harm* no magic, easy to understand

## Install

    npm i validate-component

## Usage

```
var Validate = require('validate-component')

var validater = Validate(form, {
  search: function (el) {
    return el.parentNode.firstElementChild.lastElementChild
  }
  //errorClass: 'error',
  //successClass: 'success'
})

validater.on('blur', function (name, val, required, el) {
  if (required && !val) return 'Please enter your ' + name
})

validater.on('name blur', function (val) {
  if (!/^[\w_]+$/.test(val)) return 'Should only contain letters, numbers and _'
  if (val.length < 6) return 'At least have 6 characters'
})

validater.on('email blur', function (val) {
  if (!/.+\@.+\..+/.test(val)) return 'Please enter valid email address'
})

form.onsubmit = function(e) {
  if (!validater.isValid()) e.preventDefault()
}
```

## API

### Validate.setDefault(opt)

Static method for set default options including:

* `search` Required function for find error element
* `errorClass` ['error'] className add to error element onerror, input element would be add `input-[errorClass]`
* `successClass` ['success'] className add to error element onsuccess, input element would be add `input-[successClass]`
* `successMsg` [''] Optional success message string add to error element, if it's a function, should return message according to input name

### Validate(form, [opt])

Create validate with form element and options (see above).

### .isValid()

Trigger all the blur events for valid fields, return true if all pass (promise results are ignored)

## Events

`blur` emit with `name` `value` `required` and element, when return string, showed as error message
`blur [name]` emit with `value` and `element`, when return string, showed as error message

