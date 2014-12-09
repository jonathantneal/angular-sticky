# Angular Sticky

**Angular Sticky** is an [AngularJS](//angularjs.org) [directive](//docs.angularjs.org/guide/directive) that gives you the ability to keep any element on your page visible.

## Usage

To use **Angular Sticky**, add the [script](angular-sticky.js) to the head of your document.

```html
<head>
	<script src="angular-sticky.js"></script>
</head>
```

Next, add the *sticky* directive to your angular app.

```html
<script>
angular.module('demo', ['sticky'])
</script>
```

Finally, add a *sticky* attribute to an element.

```html
<div ng-app="demo">
	<p sticky sticky-top="48" sticky-top="48" sticky-media="(min-width:640px)">This sticks to the top of the page.</p>
</div>
```

## Options

- **sticky**: Enables an element to become sticky.
- **sticky-top**: Pixels between the top of the page and the sticky element.
- **sticky-bottom**: Pixels between the bottom of the page and the sticky element.
- **sticky-media**: Media query required to enable sticky.
- **sticky-wrapper-tag**: Specifies the HTML tag that is used when creating the sticky wrapper.
- **sticky-style**: Specifies the CSS style that should be added to the wrapper and element when in sticky mode.
- **sticky-class**: Specifies the CSS class that should be added to the wrapper and element when in sticky mode.

## Demo

See a [sticky demonstration](demo.html) leveraging all of the available options.

---

The [documented script](angular-sticky.js) is 3.11KB, and the [compressed script](angular-sticky.min.js) is 572 bytes.
