window.app = window.app || {};

app.TRACKER = (function() {
  'use strict';

  const TRACKING_ID = 'UA-55950495-3';
  const event_logger = [];
  const EVENT = {
    SEARCH: {
      eventCategory: 'google_search',
      eventAction: 'search',
      eventLabel: 'show',
    },
    ANSWER: {
      eventCategory: 'google_search',
      eventAction: 'search',
      eventLabel: 'answers_exists',
    },
    CORRECT: {
      eventCategory: 'google_search',
      eventAction: 'search',
      eventLabel: 'correct_answers_exists',
    },
    NEXT: {
      eventCategory: 'arrows',
      eventAction: 'clicked',
      eventLabel: 'next'
    },
    PREV: {
      eventCategory: 'arrows',
      eventAction: 'clicked',
      eventLabel: 'prev',
    },
    SAVED_OPTIONS: {
      eventCategory: 'save',
      eventAction: 'clicked',
      eventLabel: 'options',
    },
    RESET_OPTIONS: {
      eventCategory: 'reset',
      eventAction: 'clicked',
      eventLabel: 'options',
    }
  };

  function _onLoad() {
    // Standard Google Universal Analytics code
    // noinspection OverlyComplexFunctionJS
    (function(i, s, o, g, r, a, m) {
      i['GoogleAnalyticsObject'] = r;
      // noinspection CommaExpressionJS
      i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments);
      }, i[r].l = 1 * new Date();
      // noinspection CommaExpressionJS
      a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
      a.async = 1;
      a.src = g;
      m.parentNode.insertBefore(a, m);
    })(window, document, 'script',
      'https://www.google-analytics.com/analytics.js', 'ga');
    ga('create', TRACKING_ID, 'auto');
    // see: http://stackoverflow.com/a/22152353/1958200
    ga('set', 'checkProtocolTask', function() {});
    ga('set', 'appName', 'Stack Search');
    ga('set', 'appId', 'stack-search');
    ga('set', 'appVersion', app.Utils.VERSION);
    ga('require', 'displayfeatures');
  }

  // listen for document and resources loaded
  window.addEventListener('load', _onLoad);

  return {
    EVENT: EVENT,

    page: function(page) {
      if (page) {
        ga('send', 'pageview', page);
      }
    },

    event: function(event, category = null, label = null, action = null) {
      if (event) {
        if (label != null) {
          var ev = {}
        } else {
          var ev = event;
        }
        ev.hitType = 'event';
        ev.eventLabel = label ? label.replaceAll(' ', '+') : ev.eventLabel;
        ev.eventAction = action ? action.replaceAll(' ', '+') : ev.eventAction;
        ev.eventCategory = category ? category.replaceAll(' ', '+') : ev.eventCategory;
        ga('send', ev);
      }
    },

  };
})();

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};