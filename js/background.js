window.app = window.app || {};
answers_div = [];
g_current_index = 0;
g_stack_link_count = 0;
const config = {
  childList: true,
  subtree: true
};
const regex = /<a.*?onmousedown="return.*?>[^<]*<\/a>/;
app.TRACKER.page('background.js');
/* MutationObserver configuration data: Listen for "childList"
/* Traverse 'rootNode' and its descendants and modify '<a>' tags */
function modifyLinks(rootNode) {
  answers_div = [];
  g_stack_link_count = 0;
  var nodes = [rootNode];
  while (nodes.length > 0) {
    var node = nodes.shift();
    if (node.tagName == "A") {
      /* Modify the '<a>' element */
      if (app.Utils.valid_link(node)) {
        href = node.href.replace('http://', 'https://');
        g_stack_link_count += 1;
        app.ANSWERS.show_answers(node, href);
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

// listen for document and resources loaded 
observer1.observe(document.body, config);
