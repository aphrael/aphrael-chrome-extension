/**
 * 画面にデータを埋め込む
 * @param {String} lng 軽度
 * @param {String} lat 緯度
 */
var embedData = function(lng, lat) {
    if (!jQuery("#__lng__").get(0)) {
        jQuery(document.body).append(
            jQuery("<div>").attr({id: "__lng__"})
        );
    }
    if (!jQuery("#__lat__").get(0)) {
        jQuery(document.body).append(
            jQuery("<div>").attr({id: "__lat__"})
        );
    }
    jQuery("#__lng__").text(lng);
    jQuery("#__lat__").text(lat);
};

// メッセージを受信し処理する
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.status === 200) {
        embedData(request.lng, request.lat);
        jQuery("#move").trigger("click");
    }
    else if (request.status === 500) {
        console.log(request.message);
    }
    sendResponse({status: "end"});
});