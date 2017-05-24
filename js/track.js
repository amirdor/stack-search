
(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-55950495-3']);
_gaq.push(['_trackPageview']);

$('.btn_an').click(function () {
trackButton($(this))
});
 function trackButton(e) {
    _gaq.push(['_trackEvent', e.id, 'clicked']);
  };