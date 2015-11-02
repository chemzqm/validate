# Validate

[![Dependency Status](https://david-dm.org/chemzqm/validate.png)](https://david-dm.org/chemzqm/validate)
[![Build Status](https://secure.travis-ci.org/chemzqm/validate.png)](http://travis-ci.org/chemzqm/validate)

Validate input elements in an easy way [demo](http://chemzqm.github.io/validate/)

* **Design friendly** write html by yourself, no generate html, className change only
* **locale friendly** write error messages in javascript
* **Smart** promise awareness, [invlid](https://github.com/chemzqm/invalid) fileds ignored on `isValid()` call
* **Cache** no validation fired when not changed
* **No harm** no magic, easy to understand

## Install

    npm i validate-component

## Usage

``` js
var Validate = require('validate-component')

var validater = Validate(form, {
  search: function (el) {
    return el.parentNode.firstElementChild.lastElementChild
  }
})

validater.on('blur', function (name, val, required, el) {
  if (required && !val) return 'Please enter your ' + name
})

validater.on('blur name', function (val) {
  if (!/^[\w_]+$/.test(val)) return 'Should only contain letters, numbers and _'
  if (val.length < 6) return 'At least have 6 characters'
})

validater.on('blur email', function (val) {
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

* `blur` emit with `name` `value` `required` and element, when return string, showed as error message
* `blur [name]` emit with `value` and `element`, when return string, showed as error message

## MIT license
Copyright (c) 2015 chemzqm@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
