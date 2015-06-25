(function(window, $) {
  'use strict';
  
  function getId(options) {
    var element = $(options.spotify.dataUriElementSelector);
    return element[0].dataset.uri;
  }

  window.SlackMusicNotifier.init('spotify', getId, function(options, callback) {
    var uri = options.spotify.apiUrl;
    var id = getId(options);
    
    if (!id) {
      return;
    }
    
    uri += id.replace(options.spotify.dataUriReplace, '');
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
  });
}(window, $));