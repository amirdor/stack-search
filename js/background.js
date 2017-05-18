STACK_COLOR = ' #ff966b'

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
    var nodes = [rootNode];
    while (nodes.length > 0) {
        var node = nodes.shift();
        if (node.tagName == "A") {
            /* Modify the '<a>' element */
            if (node.href.includes("stackoverflow.com/questions") && node.innerText.length > 1){
                href = node.href.replace('http://stackoverflow','https://stackoverflow');
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
          answers = htmlElem.find('div.answer').size();
          accpeted_answer = htmlElem.find('div.accepted-answer').size();
          score = htmlElem.find('.vote-count-post');
          max_score = 0;
          for (i=1; i<score.size(); i++){
            score_i = parseInt(score[i].innerHTML)
            if (max_score < score_i){
               max_score = score_i;
            }
          }
          var div_top = document.createElement("div");
          div_top.className = "s";

          var para = document.createElement("span");
          para.className += " st";
          para.style.color = STACK_COLOR
          para.innerHTML = answers +" answers";
          if (answers > 0){
              para.innerHTML += " - Top answered score: " + max_score;        
          }
          if (accpeted_answer > 0){
              para.innerHTML += " - <b>Accpeted Answer Available</b>";
          }

          div_top.append(para);
          div = elem.parentElement.parentElement;
          div.append(div_top);
      
}