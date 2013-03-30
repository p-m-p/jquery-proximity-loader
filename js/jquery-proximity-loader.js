;(function ($, undefined) {

  var $doc = $(document)
    , loader = {
          listening: false
        , watchList: []
        , defaultSettings: {}
      };

  loader.init = function (options) {
    if (!loader.listening) {
      loader.listen();
    }

    return this.each(function () {
      var $elem = $(this)
        , task = $.extend({
              $elem: $elem
            , bounds: loader.calculateBounds($elem, options.distance || 200)
          }, options);

      loader.watchList.push(task);

      // Stop the listed events from doing running handler until js loaded
      if (options.events) {
        $.each(options.events, function (event, handler) {
          $elem.on(event, loader.cancelEventUntilLoaded);
        });
      }
    });
  };

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

  loader.check = function (ev) {
    var i = 0, item = loader.watchList[i];

    while (item) {
      if (
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

    if (!loader.watchList.length) {
      loader.stopListening();
    }
  };

  loader.loadAndRun = function (task) {
    var toLoad;

    if (!$.isArray(task.js)) {
      task.js = [task.js];
    }

    toLoad = task.js.length;
    $.each(task.js, function (i, script) {
      $.ajax({
          url: script
        , dataType: 'script'
        , success: function (data) { if (toLoad === 1) loader.run(task, data) }
        , complete: function () { toLoad -= 1 }
      });
    });
  };

  loader.run = function (task, data) {
    // Attach events now script is loaded
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

  loader.listen = function () {
    $doc.on('mousemove', loader.check);
  };

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
