<?php sleep(5); ?>

(function () {
  $('#feature-link').click(function (ev) {
    console.log('loaded feature js');
    ev.preventDefault();
  });
}());
