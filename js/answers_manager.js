window.app = window.app || {};

app.ANSWERS = (function() {
    'use strict';

    const STACK_COLOR = '#353535';
    const POSSIBLE_ANSWERS = '';
    const POSSIBLE_ANSWER = '';
    const VIEW_SOURCE = 'View Answer';
    const COMMENTS = "<h4>Comments:<h4>";
    const next_span = '<span style="cursor: pointer; font-size:13px;" id="next">Next Question</span>';
    const prev_span = '<span style="cursor: pointer; font-size:13px;" id="prev">Prev Question</span>';
    var storage = {}
    var f = true;

    function _calculate_counters(elem, href) {
        $.ajax({
            async: true,
            url: href,
            type: "get", //send it through get method
            success: function(response) {
                var htmlElem = $($.parseHTML(response));
                var site = href.split('.')[0].split('//')[1];
                _inject_text(elem, htmlElem, site);
                g_stack_link_count -= 1;
                if (g_stack_link_count == 0) {
                    if (storage['possible_answers']) {
                        _inject_answer();

                    }

                }
            },
            error: function(xhr) {
                //Do Something to handle error
                app.TRACKER.event('event', 'AJAX_error', href, xhr)
            }
        });
    }

    function _inject_text(elem, htmlElem, site) {
        try {
            var question_title = htmlElem.find('h1 a.question-hyperlink')[0].innerText;
            var question = htmlElem.find('div.question .postcell .post-text')[0];
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
                _possible_answer(elem, max_answer, max_score, site, question_title, question)
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
        if (answers_div.length <= 1) {
            $('#rhs_block').remove()
            return
        }
        var title_div = document.createElement("div");
        title_div.className = "kno-fb-ctx"
        var max_size_answers = answers_div.length
        var pages = ' <span id="pages" style="font-size:15px;padding-bottom: 15px;"><span id="c_page">1</span> / ' + max_size_answers + '</span>'
        title_div.innerHTML = "<div class='row'><div class='col-lg-3 text-center'>" + prev_span + "</div><div class='col-lg-3 text-center'>" + POSSIBLE_ANSWER + pages + "</div><div class='col-lg-3 text-right'>" + next_span + "</div></div>"
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

    function _possible_answer(elem, max_answer, max_score, site, question_title, question) {
        try {
            if (!max_answer) {
                return;
            }
            var comment_answer = max_answer.getElementsByClassName('comments');
            var share_link_data = max_answer.id
                // adding possible answer to the search
            var voting_info = {
                'voteup': false,
                'votedown': false
            }
            voting_info['voteup'] = max_answer.getElementsByClassName('vote-up-on').length > 0;
            voting_info['votedown'] = max_answer.getElementsByClassName('vote-down-on').length > 0;
            var answer_div = _create_answer_div(max_answer);
            var link_2_answer = _create_link_to_answer(elem, share_link_data)
            var question_div = _create_question_div(question_title, question, link_2_answer)
            _instert_comments(comment_answer, answer_div);
            // adding source link
            var source_div = _source_link(elem, share_link_data, max_score, site, voting_info)
            var main_div = document.createElement('div');
            main_div.append(question_div)
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
        var answer_title_div = document.createElement("div");
        answer_title_div.innerHTML = '<h3 style="font-weight: bold;">Answer</h3>';
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
        if (storage['question']) {
            answer_div.append(answer_title_div);
        }
        answer_div.append(answer_clean);
        return answer_div;
    }

    function _create_question_div(question_title, question, link_2_answer) {
        var question_title_div = document.createElement("div");
        question_title_div.innerHTML = '<h3 style="font-weight: bold;">Q: <a id="stack_link_title" href="' + link_2_answer + '">' + question_title + '</a></h3>';
        var question_div = document.createElement("div");
        question_div.className += " xpdopen";
        var style_for_question_div = "word-wrap: break-word;padding-left: 20px;padding-right: 20px;margin-top: 15px;"
        if (answers_div.length > 1) {
            style_for_question_div = style_for_question_div + "padding-top: 20px border-top: solid 1px #ebebeb;"
        }
        question_div.setAttribute("style", style_for_question_div)
        var question_clean = question;
        var imgs = question_clean.getElementsByTagName('img');
        for (var i = 0; i < imgs.length; i++) {
            imgs[i].style.width = '100%';
        }
        question_div.append(question_title_div);
        if (storage['question']) {
            question_div.append(question_clean);
        }
        return question_div;
    }

    function _create_link_to_answer(elem, share_link_data) {
        return elem.href + "#" + share_link_data
    }

    function _source_link(elem, share_link_data, max_score, site, voting_info) {
        var bottom_div = document.createElement("div");
        bottom_div.className += " xpdopen";
        var source_div = document.createElement("div");
        source_div.className += " col-sm-7";

        var row_div = document.createElement('div');
        row_div.className = "row";

        bottom_div.setAttribute("style", "padding-top: 20px;padding-left: 20px;border-top: solid 1px #ebebeb;margin-top: 15px;")
        var source_a = document.createElement("a");
        var share_link = elem.href + "#" + share_link_data
        source_a.href = share_link;
        source_a.target = '_blank';
        source_a.innerText = VIEW_SOURCE;
        source_div.append(source_a);

        var vote_div = document.createElement('div');
        vote_div.className += " col-sm-3";
        vote_div.setAttribute("style", "padding-left: 4%;")

        var vote_down_source = document.createElement('span');
        vote_down_source.id = 'downvote_' + site + '_' + share_link_data
        vote_down_source.className += ' vote downvote'
        vote_down_source.innerHTML = '<i class="fa fa-thumbs-o-down fa-2x fa-flip-horizontal" aria-hidden="true"></i>';
        if (voting_info['downvote']) {
            vote_down_source.innerHTML = '<i class="fa fa-thumbs-down fa-2x fa-flip-horizontal" aria-hidden="true"></i>';
        }
        vote_div.append(vote_down_source);

        var score_source = document.createElement('span');
        score_source.setAttribute("style", "padding-left: 5%;")
        score_source.id = 'score_' + site + '_' + share_link_data;
        score_source.setAttribute("style", "padding-bottom: 5%");
        score_source.innerHTML = max_score;
        vote_div.append(score_source);

        var vote_up_source = document.createElement('span');
        vote_up_source.setAttribute("style", "padding-left: 5%;")
        vote_up_source.id = 'upvote_' + site + '_' + share_link_data;
        vote_up_source.className += ' vote upvote';
        vote_up_source.innerHTML += '<i class="fa fa-thumbs-o-up fa-2x" aria-hidden="true"></i>';
        if (voting_info['downvote']) {
            vote_up_source.innerHTML += '<i class="fa fa-thumbs-up fa-2x" aria-hidden="true"></i>';
        }

        vote_div.append(vote_up_source);

        row_div.append(source_div);
        row_div.append(vote_div);
        bottom_div.append(row_div);

        return bottom_div;
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
            _render_votes();
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
            left_col.innerHTML = "<p class='donate_a' dir='auto'>Love this extension? <a id='donate_' class='donate_a b_b_click' target='_blank' href='https://www.paypal.me/doramir/25'>Consider donating!</a><p>"

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
            $('#rhs')[0].setAttribute("style", "border: solid 1px #ebebeb;min-width: 400px;max-width: 450px;");

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
                if (f) {
                    $(document).keydown(function(e) {
                        switch (e.which) {
                            case 39: // left
                                if (document.activeElement.id == "lst-ib") {
                                    return
                                }
                                _clicked(true)
                                break;
                            case 37: // right
                                if (document.activeElement.id == "lst-ib") {
                                    return
                                }
                                _clicked(false)
                                break;
                            default:
                                return; // exit this handler for other keys
                        }
                    });
                    f = false
                }

            }
            _render_votes();
            StackExchangeWrapper.auth.getToken()
                // highlight code blocks
            $('pre code').each(function(i, block) {
                hljs.highlightBlock(block);
            });

            // create donate and feedback links in the bottom of possible answer block
            _doante();
            $('#typingLoad').hide();
        } catch (error) {
            $('#typingLoad').hide();
            app.TRACKER.event('event', 'error', '_inject_answer', error.message)
        }
    }

    function vote(action, answer_id, site) {
        if (!StackExchangeWrapper.auth.getToken()) {
            // No token? No request!
            for (var i = 4; i >= 0; i--) {
                var token = StackExchangeWrapper.auth.getToken();
                if (token && token != '') {
                    StackExchangeWrapper.postVote(answer_id, site, action)
                    return;
                }
            }
            StackExchangeWrapper.auth.requestTokenMain();
            StackExchangeWrapper.emit('error', 'No access token found, cannot connect to StackExchange API');
            return;
        }
        StackExchangeWrapper.postVote(answer_id, site, action)
    }

    function _render_votes() {
        var vote_up = document.getElementsByClassName('vote');
        for (var i = 0; i < vote_up.length; i++) {
            vote_up[i].addEventListener("click",
                function(event) {
                    event.preventDefault();
                    var info = this.id.split('_');
                    var id_arr = this.id.split('-');
                    var id = id_arr[id_arr.length - 1];
                    var site = info[1];
                    vote(info[0], id, site);
                },
                false);
        }
    }

    return {
        show_answers: function(elem, href) {
            chrome.storage.sync.get(null, function(items) {
                var allKeys = Object.keys(items);
                storage = items;
                window.token = items['se_auth_token'];
                if (Object.keys(storage).length <= 1 && storage.constructor === Object) {
                    storage = app.Utils.default_storge();
                }
                _calculate_counters(elem, href)
            });
        }

    };
})();