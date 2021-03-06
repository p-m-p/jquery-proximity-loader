// jQuery Proximity Loader
// ---
//
// Loads scripts when a user moves near to a specified element on the page.
// Allows queueing of event handlers on the target element so that actions
// that may not yet have been loaded into the page are given the chance to
// load.
;(function ($, undefined) {

  var $doc = $(document)
    , slice = Array.prototype.slice
    , loader = { listening: false, watchList: [] }
    , methods = {};

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
      loader.proxyEvents($elem, options.events);
    });
  };

  // Apply supplied event proxies
  loader.proxyEvents = function ($elem, events) {
    // Stop the listed events from running handler until js loaded
    if (events) {
      $.each(events, function (event, handler) {
        if ($.isFunction(handler)) {
          $elem.on(event, loader.cancelEventUntilLoaded);
        }
        else if ($.isPlainObject(handler)) {
          if ($.isFunction(handler.before)) {
            $elem.on(event, handler.before);
          }
        }
      });
    }
  };

  // Restore any proxied events and then apply the after event if
  // present in the events options
  loader.restoreProxiedEvents = function (task, dontApply) {
    if (task.events) {
      $.each(task.events, function (event, handler) {
        if ($.isFunction(handler)) {
          task.$elem.off(event, loader.cancelEventUntilLoaded);

          if (!dontApply) {
            task.$elem.on(event, handler);
          }
        }
        else if ($.isPlainObject(handler)) {
          task.$elem.off(event, handler.before);

          if ($.isFunction(handler.after) && !dontApply) {
            task.$elem.on(event, handler.after);
          }
        }
      });
    }
  };

  // Works out the surrounding box for an element
  loader.calculateBounds = function ($elem, distance) {
    var width = $elem.outerWidth()
      , height = $elem.outerHeight()
      , bounds = $elem.offset();

    return {
        left: bounds.left - distance
      , top: bounds.top - distance
      , right: bounds.left + width + distance
      , bottom: bounds.top + height + distance
    };
  };

  // Checks the watch list to see if any elements are in proximity
  loader.check = function (ev) {
    var i = 0, item;

    while (item = loader.watchList[i]) {
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
        .done(function (data) {
          if (toLoad === 1) {
            loader.run(task, data);
          }
        })
        .always(function () { toLoad -= 1; })
        .fail(task.error);
    });
  };

  // Applies any event handlers that have been proxied and runs the success
  // callback if set
  loader.run = function (task, data) {
    loader.restoreProxiedEvents(task);

    if ($.isFunction(task.success)) {
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

  // Cancels the event and stops propagation
  loader.cancelEventUntilLoaded = function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
  };

  // API methods
  // ---

  // ### Destroy
  //
  // Stops listening and kill the current watch list
  methods.destroy = function () {
    loader.stopListening();

    // Stop the listed events from running handler until js loaded
    $.each(loader.watchList, function (i, task) {
      loader.restoreProxiedEvents(task, true);
    });

    loader.watchList.length = 0;
    return this;
  };

  // ### Remove
  //
  // Removes the tasks associated with the list of elements from the watchlist
  // and restores events
  methods.remove = function () {
    return this.each(function () {
      var el = this
        , i = 0
        , task;

      while (task = loader.watchList[0]) {
        if (task.$elem.get(0) === el) {
          loader.watchList.splice(i, 1);
          loader.restoreProxiedEvents(task, true);
        }
        else {
          i += 1;
        }
      }

      if (!loader.watchList.length) {
        loader.stopListening();
      }
    });
  };

  // Apply plugin
  $.proximityLoader = $.fn.proximityLoader = function (options) {
    // Call init with options
    if (typeof options === 'object') {
      return loader.init.call(this, options);
    }

    // Call API method
    return methods[options].apply(this, slice.call(arguments, 1));
  };

}(jQuery));
