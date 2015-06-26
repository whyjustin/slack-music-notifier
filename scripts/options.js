(function(document, $, storage) {
  'use strict';

  var defaults = {
    google: {
      Artist: '#player-artist',
      Album: '.player-album',
      Title: '#player-song-title',
      Cover: '#playingAlbumArt',
      Playtime: '#time_container_current'
    },
    pandora: {
      Artist: '.playerBarArtist',
      Album: '.playerBarAlbum',
      Title: '.playerBarSong',
      Cover: '.playerBarArt',
      Playtime: '.elapsedTime'
    },
    spotify: {
      ApiUrl: 'https://api.spotify.com/v1/tracks/',
      DataUriElementSelector: '#track-add',
      DataUriReplace: 'spotify:track:',
      Playtime: '#track-current'
    }
  };

  $(document).ready(function() {
    $.each(['google', 'pandora', 'spotify'], function(i, service) {
      $.each(Object.getOwnPropertyNames(defaults[service]), function(j, field) {
        $('#' + service + field).prop('placeholder', defaults[service][field]);
      });
    });

    $('#googleEnabled').add('#pandoraEnabled').add('#spotifyEnabled').click(function() {
      var button = $(this);
      if (button.hasClass('active')) {
        button.text('Disabled');
        button.removeClass('btn-success');
        button.addClass('btn-danger');
      } else {
        button.text('Enabled');
        button.addClass('btn-success');
        button.removeClass('btn-danger');
      }
    });

    $('#attachmentEnabled').click(function() {
      var button = $(this);
      if (button.hasClass('active')) {
        button.text('Use simple message (text)');
        button.removeClass('btn-success');
        button.addClass('btn-danger');
      } else {
        button.text('Use rich message (attachment)');
        button.addClass('btn-success');
        button.removeClass('btn-danger');
      }
    });

    storage.get('options', function(stored) {
      var options = stored.options;
      if (options) {
        $('#slackUsername').val(options.slack.username);
        $('#slackWebHook').val(options.slack.webhook);
        if (!options.slack.attachment) {
          $('#attachmentEnabled').click();
        }

        $.each(['google', 'pandora', 'spotify'], function(i, service) {
          if (!options[service].enabled) {
            $('#' + service + 'Enabled').click();
          }
          $.each(Object.getOwnPropertyNames(defaults[service]), function(j, field) {
            if (options[service][field.toLowerCase()] && 
                options[service][field.toLowerCase()] != defaults[service][field]) {
              $('#' + service + field).val(options[service][field.toLowerCase()]);
            }
          });
        });
      }
    });

    $('#save').click(function() {
      var username = $('#slackUsername').val(),
        webhook = $('#slackWebHook').val();

      $('#requiredError').css('display', 'none');
      if (!username || !webhook) {
        $('#requiredError').css('display', 'block');
        return;
      }

      var options = {
        slack: {
          username: username,
          webhook: webhook,
          attachment: $('#attachmentEnabled').hasClass('active'),
        },
        google: {
          enabled: $('#googleEnabled').hasClass('active'),
          artist: $('#googleArtist').val() ? $('#googleArtist').val() : defaults.google.Artist,
          album: $('#googleAlbum').val() ? $('#googleAlbum').val() : defaults.google.Album,
          title: $('#googleTitle').val() ? $('#googleTitle').val() : defaults.google.Title,
          cover: $('#googleCover').val() ? $('#googleCover').val() : defaults.google.Cover,
          playtime: $('#googlePlaytime').val() ? $('#googlePlaytime').val() : defaults.google.Playtime
        },
        pandora : {
          enabled: $('#pandoraEnabled').hasClass('active'),
          artist: $('#pandoraArtist').val() ? $('#pandoraArtist').val() : defaults.pandora.Artist,
          album: $('#pandoraAlbum').val() ? $('#pandoraAlbum').val() : defaults.pandora.Album,
          title: $('#pandoraTitle').val() ? $('#pandoraTitle').val() : defaults.pandora.Title,
          cover: $('#pandoraCover').val() ? $('#pandoraCover').val() : defaults.pandora.Cover,
          playtime: $('#pandoraPlaytime').val() ? $('#pandoraPlaytime').val() : defaults.pandora.Playtime
        },
        spotify : {
          enabled: $('#spotifyEnabled').hasClass('active'),
          apiUrl: $('#spotifyApiUrl').val() ? $('#spotifyApiUrl').val() : defaults.spotify.ApiUrl,
          dataUriElementSelector: $('#spotifyDataUriElementSelector').val() ? $('#spotifyDataUriElementSelector').val() : defaults.spotify.DataUriElementSelector,
          dataUriReplace: $('#spotifyDataUriReplace').val() ? $('#spotifyDataUriReplace').val() : defaults.spotify.DataUriReplace,
          playtime: $('#spotifyPlaytime').val() ? $('#spotifyPlaytime').val() : defaults.spotify.Playtime
        }
      };

      storage.set({ 'options' : options }, function() {
        $('#refreshAlert').css('display', 'block');
      });
    });
  });
}(document, $, chrome.storage.local));