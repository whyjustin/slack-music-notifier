(function() {
  'use strict';
  var title;

  function checkSong(service, options) {
    // Pandora fades album covers, wait until the new cover is loaded
    var opacity = $(options[service].cover).css('opacity');
    if (opacity != 1) {
      setTimeout(function() {
        checkSong(service, options);
      }, 1000);
      return;
    }
    if (service === 'google') {
      var currplaytime = $(options[service].playtime).text();
      var playtimesecs = hmsToSecondsOnly(currplaytime);
      if (playtimesecs < 15) {
        setTimeout(function() {
          checkSong(service, options);
        }, 1000);
        return;
      }
    }
    var song = {
      artist: $(options[service].artist).text(),
      album: $(options[service].album).text(),
      title: $(options[service].title).text(),
      cover: $(options[service].cover).prop('src')
    }

    chrome.storage.local.get( service + '-song', function(stored) {
      if (!isEmptySong(song) && 
          (!stored[service + '-song'] || !isSameSong(stored[service + '-song'], song))) {
        var toStore = {};
        toStore[service + '-song'] = song;

        chrome.storage.local.set(toStore, function() {
          jQuery.post(options.slack.webhook, JSON.stringify({
            'username' : options.slack.username,
            'icon_url' : song.cover,
            "mrkdwn" : true,
            "attachments": [
              {
                "fallback": song.title + ' - ' + song.artist + ' - ' + song.album,
                "title": song.title,
                "text": song.artist + ' - ' + song.album,
                "thumb_url": song.cover
              }
            ]
          }));

          setTimeout(function() {
            checkSong(service, options);
          }, 1000);
        });
      } else {
        setTimeout(function() {
          checkSong(service, options);
        }, 1000);
      }
    });
  }

  function isEmptySong(song) {
    return !song.artist && !song.album && !song.title;
  }

  function isSameSong(songA, songB) {
    return songA.artist == songB.artist && songA.album == songB.album && songA.title == songB.title;
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
      chrome.storage.local.get('options', function(stored) {
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
}());