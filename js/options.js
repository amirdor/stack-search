window.app = window.app || {};

window.addEventListener('load', _onLoad);

function _onLoad() {
  app.TRACKER.page('options.html');
}
// Saves options to chrome.storage.sync.
function save_options() {
  app.TRACKER.event(app.TRACKER.SAVED_OPTIONS)
  var color = document.getElementById('answer_color').value;
  app.TRACKER.event('event', 'color', color, 'change')
  var answers = document.getElementById('answers').checked;
  var possible_answers = document.getElementById('possible_answers').checked;
  app.TRACKER.event('event', 'possible_answers', possible_answers + '', 'change')
  chrome.storage.sync.set({
    'answer_color': color,
    'answers': answers,
    'possible_answers': possible_answers
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
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

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    'answer_color': '#ff966b',
    'answers': true,
    'possible_answers': true
  }, function(items) {
    document.getElementById('answer_color').value = items.answer_color;
    document.getElementById('answers').checked = items.answers;
    document.getElementById('possible_answers').checked = items.possible_answers;
  });
}

function reset_options() {
  app.TRACKER.event(app.TRACKER.RESET_OPTIONS)
  document.getElementById('answer_color').value = '#ff966b';
  document.getElementById('answers').checked = true;
  document.getElementById('possible_answers').checked = true;
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('reset').addEventListener('click', reset_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById("answers").addEventListener("change", click_answers);