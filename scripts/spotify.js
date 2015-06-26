(function(window, $) {
  'use strict';
  
  var spotifyScrobbler = new window.SlackScrobbler('spotify');

  spotifyScrobbler.isCorrectFrame = function(service, options, callback) {
    var selectors = options.spotify.dataUriElementSelectors.split(',');
    for (var i = 0; i < selectors.length; i++) {
      var element = $(selectors[i]);
      if (element[0] && element[0].dataset.uri) {
        callback(true);
        break;
      }
    }

    callback(false);
  };

  spotifyScrobbler.getUid = function(service, options) {
    var selectors = options.spotify.dataUriElementSelectors.split(',');
    for (var i = 0; i < selectors.length; i++) {
      var element = $(selectors[i]);
      if (element[0]) {
        if (element[0].dataset.uri) {
          return element[0].dataset.uri.replace(new RegExp(options.spotify.dataUriReplace, "i"), '');
        }
      }
    }
  }

  spotifyScrobbler.getSong = function(service, options, callback) {
    var id = this.getUid(service, options);

    if (!id) {
      callback({});
      return;
    }

    var uri = options.spotify.apiUrl + id;
    $.get(uri, function(data) {
      var song = {
        artist: data.artists[0].name,
        album: data.album.name,
        title: data.name,
        cover: data.album.images.length ? data.album.images[data.album.images.length-1].url : undefined,
        url: data.external_urls.spotify,
        uid: id
      };

      callback(song);
    });
  };

  spotifyScrobbler.isSameSong = function(service, options, previousSong, callback) {
    callback(previousSong && this.getUid(service, options) == previousSong.uid);
  };

  spotifyScrobbler.run();
}(window, $));