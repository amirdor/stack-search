window.app = window.app || {};
var bg = chrome.extension.getBackgroundPage();

window.addEventListener('load', _onLoad);

function trackButton(e) {
  app.TRACKER.event('event', e.id, 'popup', 'clicked');
};
StackExchangeWrapper.auth.getToken()

function _onLoad() {
  app.TRACKER.page('popups.html');
  $('.btn_an').click(function() {
    trackButton($(this)[0])
  });
  app.Utils.restore_options();
  chrome.storage.sync.get(null, function(items) {
    if (items['se_auth_token'] && items['se_auth_token'] != '') {
      app.Utils.login_success();
    } else {
      app.Utils.logout_success();
    }
  });

}
classname = document.getElementsByClassName("options")
for (var i = 0; i < classname.length; i++) {
  classname[i].addEventListener("change", app.Utils.save_options);
}

document.getElementById('open_options').addEventListener('click', function() {
  chrome.tabs.create({
    'url': 'chrome://extensions/?options=' + chrome.runtime.id
  });
})

document.getElementById('register').addEventListener('click', function() {
  StackExchangeWrapper.auth.requestToken();
})
document.getElementById('logout').addEventListener('click', function() {
  StackExchangeWrapper.auth.deactivate();
})