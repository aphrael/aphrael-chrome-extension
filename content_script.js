chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    jQuery("#lng").text(request.lng);
    jQuery("#lat").text(request.lat);
    jQuery("#redraw").trigger("click");
    sendResponse({status: "end"});
});

