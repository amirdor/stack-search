answers_div = []
g_current_index = 0
flag = true;
STACK_COLOR = ' #ff966b';
POSSIBLE_ANSWERS = 'Possible Answers'
POSSIBLE_ANSWER = 'Possible Answer'
VIEW_SOURCE = 'View Answer';
COMMENTS = "<h4>Comments:<h4>";
CODE_COLOR = "#eff0f1";
g_stack_link_count = 0;
window.app = window.app || {};

/* MutationObserver configuration data: Listen for "childList"
 * mutations in the specified element and its descendants */
var config = {
    childList: true,
    subtree: true
};
var regex = /<a.*?>[^<]*<\/a>/;

function calculate_counters(elem, href){
     $.ajax({
        async: true,
        url: href,
        type: "get", //send it through get method
        success: function(response) {
          var htmlElem = $($.parseHTML(response));
          inject_text(elem, htmlElem)
          g_stack_link_count -= 1;
          if (g_stack_link_count == 0){
            inject_answer();
          }
        },
        error: function(xhr) {
              //Do Something to handle error
        }
          });
}
/* Traverse 'rootNode' and its descendants and modify '<a>' tags */
function modifyLinks(rootNode) {
    answers_div = [];
    g_stack_link_count = 0;
    app.TRACKER.event('event', 'query', $("#lst-ib")[0].value, 'search_query')
    var nodes = [rootNode];
    while (nodes.length > 0) {
        var node = nodes.shift();
        if (node.tagName == "A") {
            /* Modify the '<a>' element */
            if (is_valid_links(node) && (is_stack_link(node) || is_stackexchange_link(node))){
              href = node.href.replace('http://','https://');
              flag = true
              g_stack_link_count += 1;
              calculate_counters(node, href);
            }
        } else {
            /* If the current node has children, queue them for further
             * processing, ignoring any '<script>' tags. */
            [].slice.call(node.children).forEach(function(childNode) {
                if (childNode.tagName != "SCRIPT") {
                    nodes.push(childNode);
                }
            });
        }
    }
  app.TRACKER.event('event', 'stack_links', g_stack_link_count + '', 'stack_links') 
}

/* Observer1: Looks for 'div.search' */
var observer1 = new MutationObserver(function(mutations) {
    /* For each MutationRecord in 'mutations'... */
    mutations.some(function(mutation) {
        /* ...if nodes have beed added... */
        if (mutation.addedNodes && (mutation.addedNodes.length > 0)) {
            /* ...look for 'div#search' */
            var node = mutation.target.querySelector("div#search");
            if (node) {
                /* 'div#search' found; stop observer 1 and start observer 2 */
                observer1.disconnect();
                observer2.observe(node, config);

                if (regex.test(node.innerHTML)) {
                    /* Modify any '<a>' elements already in the current node */
                    modifyLinks(node);
                }
                return true;
            }
        }
    });
});

/* Observer2: Listens for '<a>' elements insertion */
var observer2 = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes) {
            [].slice.call(mutation.addedNodes).forEach(function(node) {
                /* If 'node' or any of its desctants are '<a>'... */
                if (regex.test(node.outerHTML)) {
                    /* ...do something with them */
                    modifyLinks(node);
                }
            });
        }
    });
});


//  Start observing 'body' for 'div#search' 
// observer1.observe(document.body, config);

// listen for document and resources loaded 
window.addEventListener('load', function() { 
observer1.observe(document.body, config); 
});


function inject_text(elem, htmlElem){
  answers = htmlElem.find('div.answer')
  answers_count = answers.size();
  accpeted_answer = htmlElem.find('div.accepted-answer').size();
  max_score = 0;
  max_answer = answers[0];
  for (i=0; i<answers_count; i++){
    score = answers[i].getElementsByClassName('vote-count-post')[0].innerHTML;
    score_i = parseInt(score)
    if (max_score < score_i){
       max_score = score_i;
       max_answer = answers[i];
    }
  }
  if (max_answer){
    first_answer_feature(elem, max_answer);
  }
  create_answers_score(elem, answers_count, accpeted_answer);
  app.TRACKER.event('event', 'answers', answers_count + '', 'answers_count_per_link')  
}

function title(){
  var title_div = document.createElement("div");
  title_div.className ="kno-ecr-pt kno-fb-ctx"
  title_div.setAttribute("style","padding-left: 20px;padding-right: 20px;");
  title_div.innerHTML = POSSIBLE_ANSWER;
  if (answers_div.length > 1){
  title_div.innerHTML = '<span style="cursor: pointer;" id="prev">◀ </span>' + POSSIBLE_ANSWERS + '<span style="cursor: pointer;" id="next"> ▶</span>'
  }
  $('#rhs').append(title_div);
}

function create_answers_score(elem, answers_count, accpeted_answer){
  var div_top = document.createElement("div");
  div_top.className = "s";

  var para = document.createElement("span");
  para.className += " st";
  para.dir = 'auto'
  para.style.color = STACK_COLOR
  para.innerHTML = answers_count +" answers";
  if (answers_count > 0){
      para.innerHTML += " - Top answered score: " + max_score;        
  }
  if (accpeted_answer > 0){
      para.innerHTML += " - <b>Accepted Answer Available</b>";
      app.TRACKER.event(app.TRACKER.EVENT.CORRECT)  

  }

  div_top.append(para);
  div = elem.parentElement.parentElement;
  div_top.dir = 'auto'
  div.append(div_top);
}


function possible_answer(elem, max_answer){
  if (!max_answer){
    return;
  }
  comment_answer = max_answer.getElementsByClassName('comments');
  share_link_data = max_answer.id
  // adding possible answer to the search
  var answer_div = create_answer_div(max_answer);
  instert_comments(comment_answer, answer_div);
  // adding source link
  source_div = source_link(elem, share_link_data)
  $('#rhs')[0].setAttribute("style","border: solid 1px #ebebeb;min-width: 400px;max-width: 500px;");
  var main_div = document.createElement('div');
  main_div.append(answer_div);   
  main_div.append(source_div); 
  main_div.className = "main_div"
  answers_div.push(main_div); 
}

function create_answer_div(max_answer){
  var answer_div = document.createElement("div");
  answer_div.className += " xpdopen";
  answer_div.setAttribute("style", "word-wrap: break-word;padding-top: 20px;padding-left: 20px;padding-right: 20px;border-top: solid 1px #ebebeb;margin-top: 15px;")
  max_answer = max_answer.getElementsByTagName('tr')[0];
  max_answer.getElementsByClassName('votecell')[0].remove();
  max_answer.getElementsByClassName('fw')[0].remove();
  answer_clean = max_answer.getElementsByClassName('post-text')[0];
  imgs = answer_clean.getElementsByTagName('img');
  for (i=0; i<imgs.length; i++){
    imgs[i].style.width = '100%';
  }
  answer_div.append(answer_clean);
  return answer_div;
}

function source_link(elem, share_link_data){
  var source_div = document.createElement("div");
  source_div.className += " xpdopen";
  source_div.setAttribute("style", "padding-top: 20px;padding-left: 20px;border-top: solid 1px #ebebeb;margin-top: 15px;")
  var source_a = document.createElement("a");
  share_link = elem.href + "#" + share_link_data
  source_a.href = share_link;
  source_a.innerText = VIEW_SOURCE;
  source_div.append(source_a);
  return source_div;
}

function instert_comments(comment_answer, answer_div){
  if (comment_answer.length < 1 ){
      return;   
  }
  comment_answer = comment_answer[0];
  comment_actions = comment_answer.getElementsByClassName('comment-actions');
  for (var i = comment_actions.length - 1; i >= 0; i--) {
    comment_actions[i].remove();
  }
  comments = comment_answer.getElementsByClassName('comment-copy');
  var comments_size = comments.length;
  for (var i = 0; i < comments_size-1  && i < 2; i++) {
    var h = document.createElement("hr")
    h.style.paddingTop = "10px"
    comments[i].append(h);
  }

  if (comments_size > 0){
    var comments_span = document.createElement('span')
    comments_span.setAttribute("style", "border-top: solid 1px #ebebeb")
    comments_span.innerHTML = COMMENTS
    answer_div.append(comments_span);
  }
  var  i = 0;
  while(comments.length >0 && i < 3) {
    answer_div.append(comments[0]);
    i += 1;
  }
}

function clicked(next){
  if (next){
    g_current_index = (g_current_index + 1) % answers_div.length;
    app.TRACKER.event(app.TRACKER.EVENT.NEXT)  

  }
  else{
    g_current_index = g_current_index - 1;
    if (g_current_index < 0) {
        g_current_index = answers_div.length - 1;
    }
    app.TRACKER.event(app.TRACKER.EVENT.PREV)  
  }
  var next_div = answers_div[g_current_index];
  $('.main_div')[0].remove();
  $('#rhs').append(next_div);
}

function first_answer_feature(elem, max_answer){
  if (flag){
    
    possible_answer(elem, max_answer)
    flag = false;
    }
  else{
    possible_answer(elem, max_answer)
  }

}

function is_stack_link(node){
  return (node.href.includes("stackoverflow.com/questions")
            && !node.href.includes("stackoverflow.com/questions/tagged") 
            && node.innerText.length > 1)
}


function is_stackexchange_link(node){
  return /(http\:\/\/|https\:\/\/)[A-Z,a-z,0-9._]*.stackexchange.com\/questions\/[0-9]+\/.+/.test(node.href);
}

function is_valid_links(node){
  return !(/https:\/\/translate\.google\.com\/translate\?.*/.test(node.href))
}

function inject_answer(){
  title();
  $('#rhs').attr("dir", "auto");
  $('#rhs').append(answers_div[0]);
  if (answers_div.length > 1){
    var next_link = document.getElementById('next');
    next_link.addEventListener('click', function() {
      clicked(true)
    });
    var prev_link = document.getElementById('prev');
    prev_link.addEventListener('click', function() {
      clicked(false)
    });
  }
  
}
