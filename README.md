# legalform-js
JavaScript library to create the HTML of a form a LegalForms definition.

## Installation

For use in a PHP project

    composer install legalthings/legalform-js

## CDN

You can load legalform.js using the rawgit CDN.

```html
<script src="https://rawgit.com/legalthings/legalform-js/master/legalform.js"></script>
```

## Usage

```js
var formHtml = new LegalForm().build(definition);
```

