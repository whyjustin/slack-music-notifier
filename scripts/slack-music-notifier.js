(function() {
  'use strict';

  function checkSong(service, options) {
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
            'text' : '*' + song.title + '*\n' + song.artist + ' - ' + song.album,
            "mrkdwn" : true
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