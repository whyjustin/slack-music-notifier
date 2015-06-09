(function() {
  'use strict';

  var defaults = {
    google: {
      Artist: '#player-artist',
      Album: '.player-album',
      Title: '#player-song-title',
      Cover: '#playingAlbumArt'
    },
    pandora: {
      Artist: '.playerBarArtist',
      Album: '.playerBarAlbum',
      Title: '.playerBarSong',
      Cover: '.playerBarArt'
    }
  };

  $(document).ready(function() {
    jQuery.each(['google', 'pandora'], function(i, service) {
      jQuery.each(Object.getOwnPropertyNames(defaults.google), function(j, field) {
        $('#' + service + field).prop('placeholder', defaults[service][field]);
      });
    });

    $('#googleEnabled').add('#pandoraEnabled').click(function() {
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

    chrome.storage.local.get('options', function(stored) {
      var options = stored.options;
      if (options) {
        $('#slackUsername').val(options.slack.username);
        $('#slackWebHook').val(options.slack.webhook);
        if (!options.slack.attachment) {
          $('#attachmentEnabled').click();
        }

        jQuery.each(['google', 'pandora'], function(i, service) {
          if (!options[service].enabled) {
            $('#' + service + 'Enabled').click();
          }
          jQuery.each(Object.getOwnPropertyNames(defaults.google), function(j, field) {
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
          cover: $('#googleCover').val() ? $('#googleCover').val() : defaults.google.Cover
        },
        pandora : {
          enabled: $('#pandoraEnabled').hasClass('active'),
          artist: $('#pandoraArtist').val() ? $('#pandoraArtist').val() : defaults.pandora.Artist,
          album: $('#pandoraAlbum').val() ? $('#pandoraAlbum').val() : defaults.pandora.Album,
          title: $('#pandoraTitle').val() ? $('#pandoraTitle').val() : defaults.pandora.Title,
          cover: $('#pandoraCover').val() ? $('#pandoraCover').val() : defaults.pandora.Cover
        }
      };

      chrome.storage.local.set({ 'options' : options }, function() {
        $('#refreshAlert').css('display', 'block');
      });
    });
  });
}());