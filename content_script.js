// メッセージを受信し処理する
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.status === 200) {
        jQuery("#lng").text(request.lng);
        jQuery("#lat").text(request.lat);
        jQuery("#redraw").trigger("click");
    }
    else if (request.status === 500) {
        console.log(request.message);
    }
    sendResponse({status: "end"});
});