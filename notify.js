(function() {

var Aphrael = {};

// タブ切替時のイベント
chrome.tabs.onSelectionChanged.addListener(function(tabId) {
    Aphrael.tabId = tabId;
});

// ChannelIDを取得
chrome.pushMessaging.getChannelId(false, function(response){
    console.log(response); // 本当はサーバに送るんだけど、とりあえず、コンソールに出力しておく
});

// 通知を受け取るイベントハンドラを登録
chrome.pushMessaging.onMessage.addListener(function(message) {
    if (message.subchannelId !== 0) return;

    if (!!Aphrael.tabId) {
        chrome.tabs.get(Aphrael.tabId, function(tab) {
            // TODO 開発中はlocalhost。
            if (/^http:\/\/localhost.*/.test(tab.url)) {
                var location = message.payload.split(",");
                chrome.tabs.executeScript(Aphrael.tabId, {file: "content_script.js"}, function() {
                    var data = {lat: location[0], lng: location[1]};
                    chrome.tabs.sendMessage(Aphrael.tabId, data, function(response) {
                        // Responseが取れない場合は接続の確率に失敗しているため、
                        // タブをリロードする。
                        if (typeof response === 'undefined') {
                            chrome.tabs.update(Aphrael.tabId, {url: tab.url});
                        }
                    });
                });
            }
        });
    }
});

})();