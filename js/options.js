window.app = window.app || {};

window.addEventListener('load', _onLoad);

function _onLoad() {
  app.TRACKER.page('options.html');
}

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