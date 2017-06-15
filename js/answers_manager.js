window.app = window.app || {};

app.ANSWERS = (function() {
  'use strict';

  const STACK_COLOR = '#ff966b';
  const POSSIBLE_ANSWERS = 'Possible Answers';
  const POSSIBLE_ANSWER = 'Possible Answer';
  const VIEW_SOURCE = 'View Answer';
  const COMMENTS = "<h4>Comments:<h4>";
  const next_span = '<span style="cursor: pointer;" id="next"> ▶</span>';
  const prev_span = '<span style="cursor: pointer;" id="prev">◀ </span>';
  var storage = {}

  function _calculate_counters(elem, href) {
    $.ajax({
      async: true,
      url: href,
      type: "get", //send it through get method
      success: function(response) {
        var htmlElem = $($.parseHTML(response));

        _inject_text(elem, htmlElem);
        g_stack_link_count -= 1;
        if (g_stack_link_count == 0) {
          if (storage['possible_answers']) {
            _inject_answer();

          }

        }
      },
      error: function(xhr) {
        //Do Something to handle error
        console.log("XHR")
        console.log(xhr)
        app.TRACKER.event('event', 'AJAX_error', href, xhr)
      }
    });
  }

  function _inject_text(elem, htmlElem) {
    try {
      var answers = htmlElem.find('div.answer')
      var answers_count = answers.size();
      var accpeted_answer = htmlElem.find('div.accepted-answer').size();
      var max_score = 0;
      var max_answer = answers[0];
      for (var i = 0; i < answers_count; i++) {
        var score = answers[i].getElementsByClassName('vote-count-post')[0].innerHTML;
        var score_i = parseInt(score)
        if (max_score < score_i) {
          max_score = score_i;
          max_answer = answers[i];
        }
      }
      if (max_answer) {
        _possible_answer(elem, max_answer)
      }
      if (storage['answers']) {
        _create_answers_score(elem, answers_count, accpeted_answer, max_score);

      }
      app.TRACKER.event('event', 'answers', answers_count + '', 'answers_count_per_link')
    } catch (error) {
      app.TRACKER.event('event', 'error', '_inject_text', error.message)
    }
  }

  function _title() {
    var title_div = document.createElement("div");
    title_div.className = "kno-ecr-pt kno-fb-ctx"
    title_div.setAttribute("style", "padding-left: 20px;padding-right: 20px;");
    title_div.innerHTML = POSSIBLE_ANSWER;
    if (answers_div.length > 1) {
      var max_size_answers = answers_div.length
      var pages = ' <span id="pages"><span id="c_page">1</span> / ' + max_size_answers + '</span>'
      title_div.innerHTML = prev_span + POSSIBLE_ANSWERS + pages + next_span
    }
    $('#rhs').append(title_div);
  }

  function _create_answers_score(elem, answers_count, accpeted_answer, max_score) {
    var div_top = document.createElement("div");
    div_top.className = "s";

    var para = document.createElement("span");
    para.className += " st";
    para.dir = 'auto'
    para.style.color = storage['answer_color'];
    para.innerHTML = answers_count + " answers";
    if (answers_count > 0) {
      para.innerHTML += " - Top answered score: " + max_score;
    }
    if (accpeted_answer > 0) {
      para.innerHTML += " - <b>Accepted Answer Available</b>";
      app.TRACKER.event(app.TRACKER.EVENT.CORRECT)
    }

    div_top.append(para);
    var div = elem.parentElement.parentElement;
    div_top.dir = 'auto'
    div.append(div_top);
  }

  function _possible_answer(elem, max_answer) {
    try {
      if (!max_answer) {
        return;
      }
      var comment_answer = max_answer.getElementsByClassName('comments');
      var share_link_data = max_answer.id
        // adding possible answer to the search
      var answer_div = _create_answer_div(max_answer);
      _instert_comments(comment_answer, answer_div);
      // adding source link
      var source_div = source_link(elem, share_link_data)
      $('#rhs')[0].setAttribute("style", "border: solid 1px #ebebeb;min-width: 400px;max-width: 450px;");
      var main_div = document.createElement('div');
      main_div.append(answer_div);
      main_div.append(source_div);
      main_div.className = "main_div"
      answers_div.push(main_div);
    } catch (error) {
      app.TRACKER.event('event', 'error', '_possible_answer', error.message)
    }

  }

  function _create_answer_div(max_answer) {
    var answer_div = document.createElement("div");
    answer_div.className += " xpdopen";
    answer_div.setAttribute("style", "word-wrap: break-word;padding-top: 20px;padding-left: 20px;padding-right: 20px;border-top: solid 1px #ebebeb;margin-top: 15px;")
    max_answer = max_answer.getElementsByTagName('tr')[0];
    max_answer.getElementsByClassName('votecell')[0].remove();
    max_answer.getElementsByClassName('fw')[0].remove();
    var answer_clean = max_answer.getElementsByClassName('post-text')[0];
    var imgs = answer_clean.getElementsByTagName('img');
    for (var i = 0; i < imgs.length; i++) {
      imgs[i].style.width = '100%';
    }
    answer_div.append(answer_clean);
    return answer_div;
  }

  function source_link(elem, share_link_data) {
    var source_div = document.createElement("div");
    source_div.className += " xpdopen";
    source_div.setAttribute("style", "padding-top: 20px;padding-left: 20px;border-top: solid 1px #ebebeb;margin-top: 15px;")
    var source_a = document.createElement("a");
    var share_link = elem.href + "#" + share_link_data
    source_a.href = share_link;
    source_a.innerText = VIEW_SOURCE;
    source_div.append(source_a);
    return source_div;
  }

  function _instert_comments(comment_answer, answer_div) {
    try {
      if (comment_answer.length < 1) {
        return;
      }
      comment_answer = comment_answer[0];
      var comment_actions = comment_answer.getElementsByClassName('comment-actions');
      for (var i = comment_actions.length - 1; i >= 0; i--) {
        comment_actions[i].remove();
      }
      var comments = comment_answer.getElementsByClassName('comment-copy');
      var comments_size = comments.length;
      for (var i = 0; i < comments_size - 1 && i < 2; i++) {
        var h = document.createElement("hr")
        h.style.paddingTop = "10px"
        comments[i].append(h);
      }

      if (comments_size > 0) {
        var comments_span = document.createElement('span')
        comments_span.setAttribute("style", "border-top: solid 1px #ebebeb")
        comments_span.innerHTML = COMMENTS
        answer_div.append(comments_span);
      }
      var i = 0;
      while (comments.length > 0 && i < 3) {
        answer_div.append(comments[0]);
        i += 1;
      }
    } catch (error) {
      app.TRACKER.event('event', 'error', '_instert_comments', error.message)
    }
  }

  function _clicked(next) {
    try {
      var max_size_answers = answers_div.length;
      if (next) {
        g_current_index += 1;
        app.TRACKER.event(app.TRACKER.EVENT.NEXT)
        if (g_current_index >= max_size_answers) {
          g_current_index = 0;
        }
      } else {
        app.TRACKER.event(app.TRACKER.EVENT.PREV)
        g_current_index -= 1;
        if (g_current_index < 0) {
          g_current_index = max_size_answers - 1;
        }
      }

      var next_div = answers_div[g_current_index];
      $('#c_page')[0].innerHTML = g_current_index + 1;
      $('.main_div')[0].remove();
      $('#rhs').append(next_div);
      $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
      });
    } catch (error) {
      app.TRACKER.event('event', 'error', _clicked, error.message)
    }
  }

  function _doante() {
    try {
      var rhs = $('#rhs');

      var donate_div = document.createElement('div');
      donate_div.id = "new";
      donate_div.className = " rhsvw";
      donate_div.style = rhs[0].style;

      var sub_row = document.createElement('div');
      sub_row.className = "row";

      var left_col = document.createElement('div');
      left_col.className = "col-lg-6";
      left_col.innerHTML = "<p class='donate_a' dir='auto'>Love this extension? <a id='donate_' class='donate_a b_b_click' target='_blank' href='https://www.paypal.me/doramir/10'>Consider donating!</a><p>"

      var right_col = document.createElement('div');
      right_col.className = "col-lg-4 pull-right";
      var feedback = "<p class='pull-right'><a id='feedback_' style='color: rgb(119, 119, 119);padding-right: 10px;' target='_blank' \
        href='https://github.com/DCookieMonster/stack-search/issues' class='feedback_a b_b_click'>Feedback</a></p>";
      right_col.innerHTML += feedback;

      sub_row.append(left_col);
      sub_row.append(right_col);

      donate_div.append(sub_row);
      $("#rhscol").append(donate_div);
      $('.b_b_click').click(function() {
        app.TRACKER.event('event', $(this)[0].id, 'main_screen', 'clicked');
      });
    } catch (error) {
      app.TRACKER.event('event', 'error', '_doante', error.message)

    }
  }

  function _inject_answer() {
    try {
      if (answers_div.length == 0) {
        return; // fix issue when there is no answer
      }
      // create title for the possible answer
      _title();

      // insert first possible answer
      $('#rhs').attr("dir", "auto");
      $('#rhs').append(answers_div[0]);

      // register for the event of next and prev
      if (answers_div.length > 1) {
        var next_link = document.getElementById('next');
        next_link.addEventListener('click', function() {
          _clicked(true)
        });
        var prev_link = document.getElementById('prev');
        prev_link.addEventListener('click', function() {
          _clicked(false)
        });
      }

      // highlight code blocks
      $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
      });

      // create donate and feedback links in the bottom of possible answer block
      _doante();
    } catch (error) {
      app.TRACKER.event('event', 'error', '_inject_answer', error.message)
    }
  }

  return {
    show_answers: function(elem, href) {
      chrome.storage.sync.get(null, function(items) {
        var allKeys = Object.keys(items);
        storage = items;
        _calculate_counters(elem, href)
      });
    }

  };
})();