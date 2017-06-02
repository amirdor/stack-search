function _analytics(){
  /**
 * Add your Analytics tracking ID here.
 */
var TRACKING_ID = 'UA-55950495-3';
// Standard Google Universal Analytics code
// noinspection OverlyComplexFunctionJS
(function(i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    // noinspection CommaExpressionJS
    i[r] = i[r] || function() {
            (i[r].q = i[r].q || []).push(arguments);
        }, i[r].l = 1 * new Date();
    // noinspection CommaExpressionJS
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
})(window, document, 'script',
    'https://www.google-analytics.com/analytics.js', 'ga');
ga('create', TRACKING_ID, 'auto');
// see: http://stackoverflow.com/a/22152353/1958200
ga('set', 'checkProtocolTask', function() { });
ga('set', 'appName', 'Stack Search');
ga('set', 'appId', 'stack-search');
ga('set', 'appVersion', '1.2.3');
ga('require', 'displayfeatures');
ga('send', 'pageview');

}

_analytics();


$('.btn_an').click(function () {
trackButton($(this)[0])
});

 function trackButton(e) {
 	ga('send', 'event',  e.id, 'clicked');
  };