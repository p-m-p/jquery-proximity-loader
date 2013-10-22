describe('jQuery Proximity Loader', function () {
  var $control;

  beforeEach(function () {
    $control = $('<a href="#">Activate control</a>')
      .css({position: 'absolute', top: '100px', left: '100px'});
  });

  afterEach(function () {
    $control.remove();
  });

  it('should prevent click event until loaded', function () {});
});
