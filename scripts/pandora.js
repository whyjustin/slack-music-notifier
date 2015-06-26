(function(window) {
  'use strict';

  var pandoraScrobbler = new window.SlackScrobbler('pandora');
  pandoraScrobbler.isSongReady = function(service, options, callback) {
    if (options[service].cover) {
      var opacity = $(options[service].cover).css('opacity');
      callback(opacity == 1);
    } else {
      callback(true);
    }
  };

  pandoraScrobbler.run();
}(window));