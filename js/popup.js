window.app = window.app || {};

window.addEventListener('load', _onLoad);

function trackButton(e) {
  app.TRACKER.event('event', e.id, 'popup', 'clicked');
};

function _onLoad() {
  app.TRACKER.page('popups.html');
  $('.btn_an').click(function() {
    trackButton($(this)[0])
  });
}