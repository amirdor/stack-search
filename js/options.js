window.app = window.app || {};

window.addEventListener('load', _onLoad);
StackExchangeWrapper.auth.getToken()

function _onLoad() {
  app.TRACKER.page('options.html');
  $('.btn_an').click(function() {
    trackButton($(this)[0])
  });

  chrome.storage.sync.get(null, function(items) {
      if (items['se_auth_token'] && items['se_auth_token'] != '') {
        app.Utils.login_success();
      } else {
        app.Utils.logout_success();
      }
    });
  }

  function trackButton(e) {
    app.TRACKER.event('event', e.id, 'options', 'clicked');
  };

  function click_answers() {
    var answers = document.getElementById('answers').checked;
    app.TRACKER.event('event', 'show_answers', answers + "", 'clicked')
    if (answers) {
      document.getElementById('answer_color').disabled = false;
    } else {
      document.getElementById('answer_color').disabled = true;
    }
  }

  document.addEventListener('DOMContentLoaded', app.Utils.restore_options);
  document.getElementById('reset').addEventListener('click', app.Utils.reset_options);
  document.getElementById('save').addEventListener('click', app.Utils.save_options);
  document.getElementById("answers").addEventListener("change", click_answers);
  document.getElementById('register').addEventListener('click', function() {
    StackExchangeWrapper.auth.requestToken();
  })
  document.getElementById('logout').addEventListener('click', function() {
    StackExchangeWrapper.auth.deactivate();
  })