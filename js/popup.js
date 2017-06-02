window.app = window.app || {};

$('.btn_an').click(function () {
	trackButton($(this)[0])
});

function trackButton(e) {
	app.TRACKER.event('event',  e.id, 'clicked');
};	