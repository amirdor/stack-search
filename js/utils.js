window.app = window.app || {};

app.Utils = (function() {
  'use strict';

  const VERSION = '1.3.6';

  return {
    VERSION: VERSION
  };

})();

window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
  app.TRACKER.event('event', 'error', errorMsg, url);
  return false;
}