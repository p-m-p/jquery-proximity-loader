jQuery Script Proximity Loader
===

Proximity loader helps you to defer script loading until the user enters the
proximity of a element on your page.

```javascript
$('#feature-link').proximityLoader({
    distance: 100 // load `js` if user moves mouse within 100px
  , js: 'path-to-script-to-load.js'
  , success: function () { /* some code to run once all scripts are loaded */ }
  , events: { // Bind this event listener once the scripts are loaded
      'click': function (ev) {
        $(this).css('color', 'blue');
        ev.preventDefault();
      }
    }
});
```

Options
---
* `distance` The distance from the element that should trigger the asset load
* `js` A single script file or an array of multiple scripts
* `success` A callback function to run once the script has loaded
* `events` Events to listen to on the element and their associated handler
    functions. These handlers will be proxied until the assets are load to a
    no-op function that will cancel the event and stop it bubbling.
