(function(window, $, storage) {
  'use strict';

  window.SlackScrobbler = function(service) {
    var me = this;

    function checkSong(previousSong) {
      me.isSongBeginning(me.service, me.options, function(beginning) {
        if (!beginning) {
          me.isSongReady(me.service, me.options, function(songReady) {
            if (songReady) {
              me.getSong(me.service, me.options, function(song) {
                me.isEmptySong(song, function(emptySong) {
                  if (!emptySong) {                    
                    me.isSameSong(song, previousSong, function(sameSong) {
                      if (!sameSong) {
                        var toStore = {};
                        toStore[service + '-song'] = song;

                        storage.set(toStore, function() {
                          $.post(me.options.slack.webhook, JSON.stringify(getJson(me.options, song)));
                          resetTimeout(song);
                        });
                      } else {
                        resetTimeout(previousSong);
                      }
                    });
                  } else {
                    resetTimeout(previousSong);
                  }
                });
              });
            } else {
              resetTimeout(previousSong);
            }
          });
        } else {
          resetTimeout(previousSong);
        }
      });
    }

    function resetTimeout(previousSong) {
      setTimeout(function() {
        checkSong(previousSong);
      }, 1000);
    }

    me.run = function() {
      storage.get('options', function(stored) {
        if (!stored.options) {
          console.error('Slack Music Notifier requires options to be set before use.');
        }
        if (!stored.options[service].enabled) {
          console.log('Slack Music Notifier is disabled for ' + service + '.');
        }

        me.service = service;
        me.options = stored.options;

        storage.get(service + '-song', function(stored) {
          var previousSong = stored[service + '-song'];
          checkSong(previousSong);
        });
      });
    }
  }

  SlackScrobbler.prototype.isSongBeginning = function(service, options, callback) {
    var currentPlayTime = $(options[service].playtime).text();
    var playTimeSecs = hmsToSecondsOnly(currentPlayTime);
    callback(!playTimeSecs || playTimeSecs < 15);
  }

  SlackScrobbler.prototype.isSongReady = function(service, options, callback) {
    callback(true);
  }

  SlackScrobbler.prototype.isEmptySong = function(song, callback) {
    callback(isEmptyOrSpaces(song.artist) && isEmptyOrSpaces(song.album) && isEmptyOrSpaces(song.title));
  }

  SlackScrobbler.prototype.isSameSong = function(song, previousSong, callback) {
    callback(song.artist == previousSong.artist && song.album == previousSong.album && song.title == previousSong.title);
  }

  SlackScrobbler.prototype.getSong = function(service, options, callback) {
    var artist = $(options[service].artist).text();
    var album = $(options[service].album).text();
    var title = $(options[service].title).text();
      
    var song = {
      artist: artist,
      album: album,
      title: title,
      cover: getAlbumArt($(options[service].cover))
    }

    callback(song);
  }

  function getAlbumArt(element) {
    if (element.prop('src')) {
      return element.prop('src');
    }
    else if (element.css('background-image')) {
      var background = element.css('background-image');
      return background.replace('url(', '').replace(')', '');
    }
  }

  function isEmptyOrSpaces(string) {
    return typeof string == 'undefined' || string === null || string.match(/^ *$/) !== null;
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


  // var getSongInfo, getSongId;

  // function checkSong(service, options, prevSong) {
  //   prevSong = prevSong || {};
    
  //   // Delay posting song for 15 seconds to not report skipped songs
  //   var currentPlayTime = $(options[service].playtime).text();
  //   var playTimeSecs = hmsToSecondsOnly(currentPlayTime);
  //   if (!playTimeSecs || playTimeSecs < 15) {
  //     setTimeout(function() {
  //       checkSong(service, options, prevSong);
  //     }, 1000);
  //     return;
  //   }    

  //   // Pandora fades album covers, wait until the new cover is loaded
  //   if (options[service].cover) {
  //     var opacity = $(options[service].cover).css('opacity');
  //     if (opacity != 1) {
  //       setTimeout(function() {
  //         checkSong(service, options, prevSong);
  //       }, 1000);
  //       return;
  //     }
  //   }
  
  //   // Check to see if this is the same as the previous song
  //   if (getSongId) {
  //     if (getSongId(options) == prevSong.uid) {
  //       setTimeout(function() {
  //         checkSong(service, options, prevSong);
  //       }, 1000);
  //       return;
  //     }
  //   } else {
  //     var songToCheck = defaultGetSong(service, options);
      
  //     if (isSameSong(songToCheck, prevSong)) {
  //       setTimeout(function() {
  //         checkSong(service, options, prevSong);
  //       }, 1000);
  //       return;
  //     }
  //   }
  
  //   // If a getSongInfo function was passed in we'll use that
  //   if (getSongInfo) {
  //     getSongInfo(options, function(song) {        
  //       if (!song) {
  //         setTimeout(function() {
  //           checkSong(service, options, prevSong);
  //         }, 1000);
  //         return;
  //       }
      
  //       storeSong(service, song, options);   
  //     });   
  //   } 
  //   else {    
  //     var song = defaultGetSong(service, options);
  //     storeSong(service, song, options);
  //   }    
  // }
  
  // function storeSong(service, song, options) {
  //   storage.get( service + '-song', function(stored) {
  //     if (!isEmptySong(song)) {
  //       var toStore = {};
  //       toStore[service + '-song'] = song;

  //       storage.set(toStore, function() {
  //         $.post(options.slack.webhook, JSON.stringify(getJson(options, song)));
  //       });
  //     } 
        
  //     setTimeout(function() {
  //         checkSong(service, options, song);
  //       }, 1000);      
  //     });
  // }
  
  // function defaultGetSong(service, options) {
  //   var artist = $(options[service].artist).text();
  //   var album = $(options[service].album).text();
  //   var title = $(options[service].title).text();
      
  //   return {
  //     artist: artist,
  //     album: album,
  //     title: title,
  //     cover: getAlbumArt($(options[service].cover)),
  //     uid: artist + album + title
  //   }
  // }
  
  // function isSameSong(song, prevSong, getTrackId) {
  //   return song.uid == prevSong.uid ? true : false;
  // }

  // function isEmptySong(song) {
  //   return isEmptyOrSpaces(song.artist) && isEmptyOrSpaces(song.album) && isEmptyOrSpaces(song.title);
  // }

  // function isEmptyOrSpaces(string) {
  //   return string === null || string.match(/^ *$/) !== null;
  // }

  // function hmsToSecondsOnly(str) {
  //   var p = str.split(':'),
  //       s = 0, m = 1;

  //   while (p.length > 0) {
  //       s += m * parseInt(p.pop(), 10);
  //       m *= 60;
  //   }

  //   return s;
  // }

  // window.SlackScrobbler = {
  //   init: function(service, getId, getTrackFunc) {
  //     getSongId = getId;
  //     getSongInfo = getTrackFunc;
      
  //     storage.get('options', function(stored) {
  //       if (!stored.options) {
  //         console.error('Slack Music Notifier requires options to be set before use.');
  //       }
  //       if (!stored.options[service].enabled) {
  //         console.log('Slack Music Notifier is disabled for ' + service + '.');
  //       }

  //       checkSong(service, stored.options);
  //     });
  //   }
  // };
}(window, $, chrome.storage.local));