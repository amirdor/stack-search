(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-55950495-3']);
_gaq.push(['_trackPageview']);

flag = true;
STACK_COLOR = ' #ff966b';
POSSIBLE_ANSWER = 'Possible Answer'
VIEW_SOURCE = 'View Source';
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
          },
      error: function(xhr) {
              //Do Something to handle error
      }
          });
}
/* Traverse 'rootNode' and its descendants and modify '<a>' tags */
function modifyLinks(rootNode) {
     _gaq.push(['_trackEvent', 'google_search', 'query', $("#lst-ib")[0].value]);
    var nodes = [rootNode];
    while (nodes.length > 0) {
        var node = nodes.shift();
        if (node.tagName == "A") {
            /* Modify the '<a>' element */
            if (node.href.includes("stackoverflow.com/questions")
            && !node.href.includes("stackoverflow.com/questions/tagged") 
            && node.innerText.length > 1){
                href = node.href.replace('http://stackoverflow','https://stackoverflow');
                flag = true
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


/* Start observing 'body' for 'div#search' */
observer1.observe(document.body, config);

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
            if (flag){
              flag = false;
              possible_answer(elem, max_answer)
            }

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
             _gaq.push(['_trackEvent', 'accepted_answer', 'exsits']);
          }

          div_top.append(para);
          div = elem.parentElement.parentElement;
          div_top.dir = 'auto'
          div.append(div_top);
     _gaq.push(['_trackEvent', 'google_search', 'inject_text', 1]);

      
}

function possible_answer(elem, max_answer){
    // adding possible answer to the search
    var answer_div = document.createElement("div");
    var title_div = document.createElement("div");
    title_div.className ="kno-ecr-pt kno-fb-ctx"
    title_div.innerHTML = POSSIBLE_ANSWER
    title_div.setAttribute("style","padding-left: 15px;padding-right: 15px;");
    answer_div.className += " xpdopen";
    answer_div.setAttribute("style", "padding-left: 15px;padding-right: 15px;border-top: solid 1px #ebebeb;margin-top: 15px;")
    max_answer = max_answer.getElementsByTagName('tr')[0]
    max_answer.getElementsByClassName('votecell')[0].remove();
    max_answer.getElementsByClassName('fw')[0].remove();
    answer_div.append(max_answer.getElementsByClassName('post-text')[0]);
    // adding source link
    var source_div = document.createElement("div");
    source_div.className += " xpdopen";
    source_div.setAttribute("style", "padding-top: 15px;padding-left: 15px;border-top: solid 1px #ebebeb;margin-top: 15px;")
    var source_a = document.createElement("a");
    source_a.href = elem.href;
    source_a.innerText = VIEW_SOURCE;
    source_div.append(source_a);
    $('#rhs')[0].setAttribute("style","border: solid 1px #ebebeb;min-width: 400px;max-width: 500px;");
    $('#rhs').append(title_div);
    $('#rhs').append(answer_div);   
    $('#rhs').append(source_div);  
  
}


