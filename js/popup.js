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
  app.Utils.restore_options();
}
document.getElementById('reset').addEventListener('click', app.Utils.reset_options);

classname = document.getElementsByClassName("options")
for (var i = 0; i < classname.length; i++) {
  classname[i].addEventListener("change", app.Utils.save_options);
}

document.getElementById('open_options').addEventListener('click', function() {
  chrome.tabs.create({
    'url': 'chrome://extensions/?options=' + chrome.runtime.id
  });
})