(function(window, $) {
  'use strict';
  
  var spotifyScrobbler = new window.SlackScrobbler('spotify');
  spotifyScrobbler.isCorrectFrame = function(service, options, callback) {
    var element = $(options.spotify.dataUriElementSelector);
    callback(element.length > 0);
  };
  // Bug with OSX implementations of spotify web app's playlist. Song beginning check disabled.
  spotifyScrobbler.isSongBeginning = function(service, options, callback) {
    callback(false);
  };
  spotifyScrobbler.getSong = function(service, options, callback) {
    var element = $(options.spotify.dataUriElementSelector);
    if (element.length < 1) {
      callback({});
      return;
    }
    var id = element[0].dataset.uri;
    if (!id) {
      callback({});
      return;
    }

    var uri = options.spotify.apiUrl + id.replace(options.spotify.dataUriReplace, '');
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
  spotifyScrobbler.isSameSong = function(song, previousSong, callback) {
    callback(previousSong && previousSong.uid && (!song || song.uid == previousSong.uid));
  };

  spotifyScrobbler.run();
}(window, $));