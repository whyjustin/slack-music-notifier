(function($, storage) {
  'use strict';
  var SPOTIFY = "spotify";

  function checkSong(service, options, prevSong) {
    var title;  
    prevSong = prevSong || {};
    // Delay posting song for 15 seconds to not report skipped songs
    var currentPlayTime = $(options[service].playtime).text();
    var playTimeSecs = hmsToSecondsOnly(currentPlayTime);
    if (playTimeSecs < 15) {
      setTimeout(function() {
        checkSong(service, options, prevSong);
      }, 1000);
      return;
    }

    // Pandora fades album covers, wait until the new cover is loaded
	  if (options[service].cover) {
      var opacity = $(options[service].cover).css('opacity');
      if (opacity != 1) {
        setTimeout(function() {
          checkSong(service, options, prevSong);
        }, 1000);
        return;
      }
	  }
	
    // Check to see if this is the same as the previous song
	  title = $(options[service].title).text();
	  if (!title || prevSong.title == title) {
	    setTimeout(function() {
          checkSong(service, options, prevSong);
      }, 1000);
      return;
	  }
	
    // Spotify doesn't provide album information in their Now Playing
	  if (service === SPOTIFY) {
	    var element = $(options.spotify.elementSelector);
	    var uri = options.spotify.url;
	    var id = element.data('uri');
	  
	    if (!id) {
	      setTimeout(function() {
          checkSong(service, options, prevSong);
        }, 1000);
        return;
	    }
	  
	    uri += id.replace(options.spotify.regExp, '');
	    $.get(uri, function(data) {
	      var song = {
		      artist: data.artists[0].name,
		      album: data.album.name,
		      title: title,
		      cover: data.album.images[data.album.images.length-1].url,
          url: data.external_urls.spotify
		    }
		
		    storeSong(service, song, options);
	    }); 
	  } else {
	    var song = {
        artist: $(options[service].artist).text(),
        album: $(options[service].album).text(),
        title: title,
        cover: getAlbumArt($(options[service].cover))
      }
	  
	    storeSong(service, song, options);
	  }    
  }
  
  function storeSong(service, song, options) {
    storage.get( service + '-song', function(stored) {
      if (!isEmptySong(song)) {
        var toStore = {};
        toStore[service + '-song'] = song;

        storage.set(toStore, function() {
          $.post(options.slack.webhook, JSON.stringify(getJson(options, song)));
        });
      } 
        
	  setTimeout(function() {
        checkSong(service, options, song);
      }, 1000);      
    });
  }
  
  function getAlbumArt(element) {
	  if(element.prop('src')){
	    return element.prop('src');
	  }
	  else if(element.css('background-image')) {
	    var background = element.css('background-image');
	    return background.replace('url(', '').replace(')', '');
	  }
  }

  function getJson(options, song) {	
    if (options.slack.attachment) {
      return {
        'username' : options.slack.username,
        'icon_url' : song.cover,
        "mrkdwn" : true,
        "attachments": [
          {
            "fallback": song.title + ' - ' + song.artist + ' - ' + song.album,
            "title": song.title,
            "title_link": song.url,
            "text": song.artist + ' - ' + song.album,
            "thumb_url": song.cover
          }
        ]
      }
    } else {
      return {
        'username' : options.slack.username,
        'icon_url' : song.cover,
        "mrkdwn" : true,
        'text' : '*' + song.title + '*\n' + song.artist + ' - ' + song.album
      }
    }
  }

  function isEmptySong(song) {
    return isEmptyOrSpaces(song.artist) && isEmptyOrSpaces(song.album) && isEmptyOrSpaces(song.title);
  }

  function isEmptyOrSpaces(string) {
    return string === null || string.match(/^ *$/) !== null;
  }

  function hmsToSecondsOnly(str) {
    var p = str.split(':'),
        s = 0, m = 1;

    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }

    return s;
  }

  window.SlackMusicNotifier = {
    init: function(service) {
      storage.get('options', function(stored) {
        if (!stored.options) {
          console.error('Slack Music Notifier requires options to be set before use.')
        }
        if (!stored.options[service].enabled) {
          console.log('Slack Music Notifier is disabled for ' + service + '.');
        }

        checkSong(service, stored.options);
      });
    }
  };
}($, chrome.storage.local));