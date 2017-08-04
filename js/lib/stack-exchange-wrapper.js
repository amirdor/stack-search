(function(exports) {
  // Rob's API details
  var API_KEY = '06Nh6mUooA9aV00wfkBChw((';
  var API_CLIENT_ID = '10162';
  window.app = window.app || {};

  // URLs for getting API token. Sufficed URL with "robw" to create a semi-unique URL to avoid conflicts with others
  var _api_auth_redirect_url = 'https://stackexchange.com/oauth/login_success?robw&protocol=https&';
  var API_AUTH_URL = 'https://stackexchange.com/oauth/dialog?' +
    'client_id=' + API_CLIENT_ID +
    '&scope=no_expiry,write_access' +
    '&redirect_uri=' + encodeURIComponent(_api_auth_redirect_url);

  /////////////////////
  // API Definition  //
  /////////////////////
  /**
   * Emitted events:
   * - change:unread
   * - change:token
   * - error
   */
  var StackExchangeWrapper = {
    auth: {
      requestToken: requestToken, // void requestToken()
      getToken: getToken, // string getToken()
      setToken: setToken, // void setToken(string token)
      API_AUTH_URL: API_AUTH_URL,
      deactivate: deactivate
    },
    postVote: function(answer_id, site, action) {
      return postVote(answer_id, site, action);
    }, // void fetchUnreadCount( function callback(unreadCount) )
    // Very simple event emitter
    _callbacks: {},
    emit: function(method, data) {
      var callbacks = this._callbacks[method] || [];
      for (var i = 0; i < callbacks.length; i++) {
        callbacks[i](data);
      }
    },
    on: function(method, callback) {
      if (typeof callback != "function") throw "Callback must be a function!";
      (this._callbacks[method] || (this._callbacks[method] = [])).push(callback);
    },
    off: function(method, callback) {
      if (!callback) delete this._callbacks[method];
      else if (this._callbacks[method]) {
        var index = this._callbacks[method].indexOf(callback);
        if (index !== -1) this._callbacks[method].splice(index, 1);
      }
    }
  };

  /////////////////////
  // Authentication  //
  /////////////////////
  function requestToken() {
    throw Error('api.requestToken not implemented! Write an environment-specific adapter for this method!');
  }

  function getToken() {
    throw new Error('api.getToken not implemented! Write an environment-specific adapter for this method!');
  }

  function setToken(token) {
    throw new Error('api.setToken not implemented! Write an environment-specific adapter for this method!');
    //StackExchangeWrapper.emit('change:token', token);
  }

  function deactivate() {
    throw new Error('api.deactivate not implemented! Write an environment-specific adapter for this method!');
  }

  function generateStackExchangeAPIURL(id, action) {
    var url = 'https://api.stackexchange.com/2.2/answers/';
    url += id + '/';
    url += action.replace('-', '/');
    return url;
  }

  function generateStackExchangeAPIData(site) {
    var data = {};
    data['key'] = API_KEY;
    data['site'] = site;
    data['access_token'] = StackExchangeWrapper.auth.getToken();
    return data;
  }
  // Get inbox entries
  function postVote(answer_id, site, action) {
    if (!StackExchangeWrapper.auth.getToken()) {
      // No token? No request!
      StackExchangeWrapper.emit('error', 'No access token found, cannot connect to StackExchange API');
      return;
    }
    var url = generateStackExchangeAPIURL(answer_id, action);
    $.ajax({
      async: true,
      url: url,
      type: "POST", //send it through get method
      data: generateStackExchangeAPIData(site),
      success: function(response) {
        app.TRACKER.event('event', 'vote', action, site)
        $("#score" + '_' + site + "_answer-" + answer_id).text(response['items'][0]['score']);
        if (action == 'upvote') {
          $("#downvote-undo_" + site + "_answer-" + answer_id).find('.fa').addClass('fa-thumbs-o-up').removeClass('fa-thumbs-up');
          $("#" + action + '_' + site + "_answer-" + answer_id).find('.fa').addClass('fa-thumbs-up').removeClass('fa-thumbs-o-up');
          $("#" + action + '_' + site + "_answer-" + answer_id).attr('id', "upvote-undo_" + site + "_answer-" + answer_id);
        }
        if (action == 'downvote') {
          $("#upvote-undo_" + site + "_answer-" + answer_id).find('.fa').addClass('fa-thumbs-o-up').removeClass('fa-thumbs-up');
          $("#" + action + '_' + site + "_answer-" + answer_id).find('.fa').addClass('fa-thumbs-down').removeClass('fa-thumbs-o-down');
          $("#" + action + '_' + site + "_answer-" + answer_id).attr('id', "downvote-undo_" + site + "_answer-" + answer_id);
        }
        if (action == 'upvote-undo') {
          $("#" + action + '_' + site + "_answer-" + answer_id).find('.fa').addClass('fa-thumbs-o-up').removeClass('fa-thumbs-up');
          $("#" + action + '_' + site + "_answer-" + answer_id).attr('id', "upvote_" + site + "_answer-" + answer_id);
        }
        if (action == 'downvote-undo') {
          $("#" + action + '_' + site + "_answer-" + answer_id).find('.fa').addClass('fa-thumbs-o-down').removeClass('fa-thumbs-down');
          $("#" + action + '_' + site + "_answer-" + answer_id).attr('id', "downvote_" + site + "_answer-" + answer_id);
        }

      },
      error: function(xhr) {
        //Do Something to handle error
        console.log("XHR")
        console.log(xhr)
        var response = xhr.responseJSON;
        if (response['error_id'] == 403) {
          StackExchangeWrapper.auth.setToken();
        }
        app.TRACKER.event('event', 'AJAX_error', 'generateStackExchangeAPIURL', response.message)

      }
    });
  }
  exports.StackExchangeWrapper = StackExchangeWrapper;
})(typeof exports == 'undefined' ? this : exports);

// Adapter for Chrome
StackExchangeWrapper.auth.requestToken = function() {
  chrome.windows.create({
    url: StackExchangeWrapper.auth.API_AUTH_URL,
    focused: true,
    type: 'popup',
    top: 0,
    left: Math.max(0, Math.round((screen.availWidth - 660) / 2)),
    height: Math.min(screen.availHeight, 480),
    width: Math.min(screen.availWidth, 660)
  });
};

StackExchangeWrapper.auth.deactivate = function() {
  var user_token = StackExchangeWrapper.auth.getToken();
  if (!user_token || user_token == '') {
    app.Utils.logout_success();
    return
  }
  var url = 'https://api.stackexchange.com/2.2/apps/' + user_token + '/de-authenticate';
  $.ajax({
    async: true,
    url: url,
    type: "GET", //send it through get method
    success: function(response) {
      StackExchangeWrapper.auth.setToken()
      app.TRACKER.event(app.TRACKER.EVENT.DEACTIVATE)
      $('#message_option').text("We are sorry to see you go :(")
      app.Utils.logout_success();

    },
    error: function(xhr) {
      //Do Something to handle error
      var response = xhr.responseJSON;
      app.TRACKER.event('event', 'AJAX_error', 'deactivate', response.error_message)
    }
  });
};

StackExchangeWrapper.auth.requestTokenMain = function() {
  var url = StackExchangeWrapper.auth.API_AUTH_URL;
  var top = 0;
  var left = Math.max(0, Math.round((screen.availWidth - 660) / 2));
  var h = Math.min(screen.availHeight, 480);
  var w = Math.min(screen.availWidth, 660);
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  window.open(url, 'title', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
};

StackExchangeWrapper.auth.getToken = function getToken() {
  if (window.token != null && window.token != '') {
    return window.token
  }
  chrome.storage.sync.get('se_auth_token', function(item) {
    window.token = item['se_auth_token'] || ''
  });
  return window.token;

};
StackExchangeWrapper.auth.setToken = function setToken(token) {
  if (token) {
    chrome.storage.sync.set({
      'se_auth_token': token
    });
    window.token = token;
    app.Utils.login_success();
  } else {
    chrome.storage.sync.set({
      'se_auth_token': ''
    });
  }
  StackExchangeWrapper.emit('change:token', token);
};
// Handle successful authentication
chrome.runtime.onMessage.addListener(function(message, sender) {
  if ('auth_token' in message) {
    if (message.auth_token) {
      StackExchangeWrapper.auth.setToken(message.auth_token);
    }
    if (message.account_id) {
      StackExchangeWrapper.emit('found:account_id', message.account_id);
    }
    chrome.tabs.remove(sender.tab.id);
  }
});

window.token = chrome.storage.sync.get('se_auth_token', function(item) {
  return item['se_auth_token'] || ''
});