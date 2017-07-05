window.app = window.app || {};

window.addEventListener('load', _onLoad);

function _onLoad() {
  app.TRACKER.page('options.html');
  $('.btn_an').click(function() {
    trackButton($(this)[0])
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
StackExchangeWrapper.auth.getToken()
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