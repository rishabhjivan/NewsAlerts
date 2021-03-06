var app = {
    RegID: "APA91bF6q48SYxLufxTEr6pLi6IQkSNGnGbII800BDl4BLd9ElsrJy4vfOv0P1yx4AyjI5Cuc2OqGMp3pdKc0N2irx74LnD9OKDytndnthAVk3nmYQqli0IsRr24yBeyK0GTEHjomsPidnOqh1YwO09b8bZl5QmYcA",
	SelectedFeeds: new Array(),
	// Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
        var pushNotification = window.plugins.pushNotification;
        if (device.platform == 'android' || device.platform == 'Android') {
            pushNotification.register(this.successHandler, this.errorHandler,{"senderID":"539993042105","ecb":"app.onNotificationGCM"});
        }
        else {
            pushNotification.register(this.successHandler,this.errorHandler,{"badge":"true","sound":"true","alert":"true","ecb":"app.onNotificationAPN"});
        }
    },
    // result contains any message sent from the plugin call
    successHandler: function(result) {
        alert('Callback Success! Result = '+result)
    },
    errorHandler:function(error) {
        alert(error);
    },
    onNotificationGCM: function(e) {
        switch( e.event )
        {
            case 'registered':
                if ( e.regid.length > 0 )
                {
                    RegID = e.regid;
					console.log("Regid " + e.regid);
					$.post(WebServicesUrl + 'Device/', { Type: "Android", Id: e.regid },
					function (data) {InitMain();}, 'json');
                }
            break;
 
            case 'message':
              // this is the actual push notification. its format depends on the data model from the push server
              //alert('message = '+e.message+' msgcnt = '+e.msgcnt);
			  $("#ulLiveFeeds").prepend('<li><a href="#">' + e.message + '</a></li>');
				$("#ulLiveFeeds").trigger('create');
            break;
 
            case 'error':
              alert('GCM error = '+e.msg);
            break;
 
            default:
              alert('An unknown GCM event has occurred');
              break;
        }
    },
    onNotificationAPN: function(event) {
        var pushNotification = window.plugins.pushNotification;
        alert("Running in JS - onNotificationAPN - Received a notification! " + event.alert);
        
        if (event.alert) {
            navigator.notification.alert(event.alert);
        }
        if (event.badge) {
            pushNotification.setApplicationIconBadgeNumber(this.successHandler, this.errorHandler, event.badge);
        }
        if (event.sound) {
            var snd = new Media(event.sound);
            snd.play();
        }
    }
};
function InitMain() {
	$.get(WebServicesUrl + 'Categories/', {},
	function (data) {
		$("#divSplash").hide();$("#divHeader").show();$("#divMain").show();
		$.each(data.List, function (i, item) {
			$("#divSelectFeeds").append('<div data-role="collapsible" data-inset="false" data-id="' + item.Id + '" data-theme="c">' +
				'<h3 onclick="LoadFeeds(' + item.Id + ');">' + item.Name + '</h3><div id="divFeeds-' + item.Id + '" data-loaded="0"></div></div>');
		});
		$("#divSelectFeeds").trigger('create');
	}, 'json');
	$.get(WebServicesUrl + 'Feed/', { DeviceId: app.RegID },
	function (data) {
		app.SelectedFeeds = data.List;
	}, 'json');
}
function LoadFeeds(categoryId) {
	if ($("#divFeeds-" + categoryId).attr("data-loaded") == 0) {
	$.get(WebServicesUrl + 'Feeds/' + categoryId, {},
	function (data) {
		$("#divFeeds-" + categoryId).attr("data-loaded", 1);
		$.each(data.List, function (i, item) {
			$("#divFeeds-" + categoryId).append(
				'<input id="chkFeed-' + item.Id + '" type="checkbox" onchange="FeedChecked(' + item.Id + ');" /><label for="chkFeed-' + item.Id + '">' + item.Name + '</label>');
		});
		$.each(app.SelectedFeeds, function (i, item) {if ($("#chkFeed-" + item).length > 0) $("#chkFeed-" + item).prop("checked", true);});
		$("#divFeeds-" + categoryId).trigger('create');
	}, 'json');
	}
}
function FeedChecked(feedId) {
	var checked = $("#chkFeed-" + feedId).is(":checked");
	$.post(WebServicesUrl + 'Feed/' + feedId, { DeviceId: app.RegID, Value: checked }, 
	function (data) {
		if (checked) app.SelectedFeeds[app.SelectedFeeds.length] = feedId;
		else {
			var index = app.SelectedFeeds.indexOf(feedId);
			app.SelectedFeeds.splice(feedId, 1);
		}
	}, 'json');
}
function ToggleSettings() {
	if ($("#divSettings").is(":visible")) {
		$("#divSettings").hide();
		$("#divMain").show();
		$("#settingsLink").html("Show Settings");
	} else {
		$("#divSettings").show();
		$("#divMain").hide();
		$("#settingsLink").html("Hide Settings");
	}
}