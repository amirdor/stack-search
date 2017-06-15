window.app = window.app || {};

app.Utils = (function() {
  'use strict';

  const VERSION = '1.5.0';

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

  return {
    VERSION: VERSION,

    valid_link: function(node) {
      return _is_valid_links(node)
    }
  };

})();

window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
  app.TRACKER.event('event', 'error', errorMsg, url);
  return false;
}