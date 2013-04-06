// jQuery Proximity Loader
// ---
//
// Loads scripts when a user moves near to a specified element on the page.
// Allows queueing of event handlers on the target element so that actions
// that may not yet have been loaded into the page are given the chance to
// load.
;(function ($, undefined) {

  var $doc = $(document)
    , loader = { listening: false, watchList: [] };

  // Sets up the bounds for the selected elements and adds them to the watch
  // list. If any events are specified then those events are proxied until the
  // specified assets have loaded
  loader.init = function (options) {
    // Switch on mousemove listening if not already enabled
    if (!loader.listening) {
      loader.listen();
    }

    return this.each(function () {
      var $elem = $(this)
        , task = $.extend({
              $elem: $elem
            , bounds: loader.calculateBounds(
                  $elem
                , parseInt(options.distance, 10) || 200
              )
          }, options);

      loader.watchList.push(task);

      // Stop the listed events from running handler until js loaded
      if (options.events) {
        $.each(options.events, function (event, handler) {
          $elem.on(event, loader.cancelEventUntilLoaded);
        });
      }
    });
  };

  // Works out the surrounding box for an element
  loader.calculateBounds = function ($elem, distance) {
    var width = $elem.outerWidth()
      , height = $elem.outerHeight()
      , bounds = $elem.offset()

    bounds.left = bounds.left - distance;
    bounds.top = bounds.top - distance;
    bounds.right = bounds.left + width + (distance * 2);
    bounds.bottom = bounds.top + height + (distance * 2);

    return bounds;
  };

  // Checks the watch list to see if any elements are in proximity
  loader.check = function (ev) {
    var i = 0, item = loader.watchList[i];

    while (item) {
      if ( // The mouse is within the elements proximity
        ev.pageX >= item.bounds.left && ev.pageX <= item.bounds.right &&
        ev.pageY >= item.bounds.top && ev.pageY <= item.bounds.bottom
      ) {
        loader.watchList.splice(i, 1);
        loader.loadAndRun(item);
      }
      else {
        i += 1;
      }

      item = loader.watchList[i];
    }

    // Nothing more to watch for then stop listening to the mousemove
    if (!loader.watchList.length) {
      loader.stopListening();
    }
  };

  // Load the required assets then run
  loader.loadAndRun = function (task) {
    var toLoad;

    if (!$.isArray(task.js)) {
      task.js = [task.js];
    }

    // Load each asset
    toLoad = task.js.length;
    $.each(task.js, function (i, script) {
      $.ajax({ url: script , dataType: 'script' })
        .done(function (data) { if (toLoad === 1) loader.run(task, data) })
        .always(function () { toLoad -= 1 });
    });
  };

  // Applies any event handlers that have been proxied and runs the success
  // callback if set
  loader.run = function (task, data) {
    if (task.events) {
      $.each(task.events, function (event, handler) {
        task.$elem.off(event, loader.cancelEventUntilLoaded);
        task.$elem.on(event, handler);
      });
    }

    if (typeof task.success === 'function') {
      task.success.call(task.$elem, data);
    }
  };

  // Listen to the mouse move events
  loader.listen = function () {
    $doc.on('mousemove', loader.check);
  };

  // Stop listening to the mouse move event
  loader.stopListening = function () {
    $doc.off('mousemove', loader.check);
  };

  loader.cancelEventUntilLoaded = function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
  };

  $.fn.proximityLoader = function (options) {
    if (typeof options === 'object') {
      return loader.init.call(this, options);
    }
  };

}(jQuery));
