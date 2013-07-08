// メッセージを受信し処理する
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.status === 200) {
        jQuery("#move").trigger("click");
    }
    else if (request.status === 500) {
        console.log(request.message);
    }
    sendResponse({status: "end"});
});