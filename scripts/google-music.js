(function(window) {
  'use strict';

  var googleScrobbler = new window.SlackScrobbler('google');
  googleScrobbler.getSong = function(service, options, callback) {
    window.SlackScrobbler.prototype.getSong(service, options, function(song) {
      var element = $(options[service].dataIdElementSelector);
      if (element.length > 0) {
        var id = element[0].dataset.id;
        if (id) {
          song.url = 'https://play.google.com/music/m/' + id;
        }
      }
      callback(song);
    });
  }
  googleScrobbler.run();
}(window));