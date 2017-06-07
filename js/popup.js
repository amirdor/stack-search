window.app = window.app || {};

window.addEventListener('load', _onLoad);

function trackButton(e) {
  app.TRACKER.event('event', e.id, 'clicked');
};

function _onLoad() {
  app.TRACKER.page('popups.html');
  $('.btn_an').click(function() {
    trackButton($(this)[0])
  });
}