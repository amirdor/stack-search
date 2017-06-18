window.app = window.app || {};

app.Utils = (function() {
  'use strict';

  const VERSION = '1.5.1';

  function _is_supported_link_link(node) {
    return /(http\:\/\/|https\:\/\/)[A-Z,a-z,0-9._]*(askubuntu|serverfault|superuser|stackexchange|stackoverflow).com\/questions\/[0-9]+\/.+/.test(node.href);
  }

  function _translation_link(node) {
    return !(/https:\/\/translate\.google\.[a-zA-Z.]+\/translate\?.*/.test(node.href))
  }

  function _webcache_link(node) {
    return !(/https:\/\/webcache\.googleusercontent\.com\/search\?q=cache*/.test(node.href))
  }

  function _is_valid_links(node) {
    return _webcache_link(node) && _translation_link(node) && _is_supported_link_link(node)
  }

  // Saves options to chrome.storage.sync.
  function _save_options() {
    app.TRACKER.event(app.TRACKER.SAVED_OPTIONS)
    var color = document.getElementById('answer_color').value;
    app.TRACKER.event('event', 'color', color, 'change')
    var answers = document.getElementById('answers').checked;
    var possible_answers = document.getElementById('possible_answers').checked;
    app.TRACKER.event('event', 'possible_answers', possible_answers + '', 'change')
    chrome.storage.sync.set({
      'answer_color': color,
      'answers': answers,
      'possible_answers': possible_answers
    }, function() {
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
    });
  }


  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  function _restore_options() {
    chrome.storage.sync.get({
      'answer_color': '#ff966b',
      'answers': true,
      'possible_answers': true
    }, function(items) {
      document.getElementById('answer_color').value = items.answer_color;
      document.getElementById('answers').checked = items.answers;
      document.getElementById('possible_answers').checked = items.possible_answers;
    });
  }

  function _reset_options() {
    app.TRACKER.event(app.TRACKER.RESET_OPTIONS)
    document.getElementById('answer_color').value = '#ff966b';
    document.getElementById('answers').checked = true;
    document.getElementById('possible_answers').checked = true;
    _save_options();
  }


  return {
    VERSION: VERSION,

    save_options: function() {
      return _save_options();
    },

    reset_options: function() {
      return _reset_options();
    },

    restore_options: function() {
      return _restore_options();
    },

    default_storge: function() {
      return {
        'answer_color': '#ff966b',
        'answers': true,
        'possible_answers': true
      }
    },

    valid_link: function(node) {
      return _is_valid_links(node)
    }
  };

})();

window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
  app.TRACKER.event('event', 'error', errorMsg, url);
  return false;
}