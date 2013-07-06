(function() {

var Aphrael = {
    host: 'localhost',
    port: '9222',
    webSocket: null,
    tabs: []
};

// WebSocket接続処理
var connect = function() {
    if (!Aphrael.webSocket) {
        Aphrael.webSocket = new WebSocket("ws://" + Aphrael.host + ":" + Aphrael.port);
        Aphrael.webSocket.onmessage = function(res) {
            executeTracking(JSON.parse(res.data));
        };

        Aphrael.webSocket.onclose = function(ws) {
            if (!ws.wasClean) {
                this.close();
            }
        };

        Aphrael.webSocket.onerror = function(e) {
            throw e;
        };
    }
};

// WebSocket切断処理
var close = function() {
    if (Aphrael.webSocket) {
        Aphrael.webSocket.close();
        Aphrael.webSocket = null;
    }
};

// 更新対象のタブIDをセットする
var updateTabInfo = function() {
    // 全てのWindow情報を取得
    chrome.windows.getAll({populate: true}, function(windowList) {
        Aphrael.tabs = [];
        windowList.forEach(function(windowInfo) {
            var tabs = windowInfo.tabs;
            // 全てのタブをチェックし、Aphraelを適用するタブ情報を保持する
            tabs.forEach(function(tab) {
                // FIXME 適用するURLを外出しにして正規表現をコンパイルする
                if (/^http:\/\/(?:aphrael-chrome-extension\.herokuapp\.com|localhost).*/.test(tab.url)) {
                    Aphrael.tabs.push(tab.id);
                }
            });
        });

        // Aphraelのページを全て閉じたらWebSocketをクローズする
        if (Aphrael.tabs.length === 0) {
            close();
        }

        console.log(Aphrael);
    });
};

// 地図更新処理を実行
var executeTracking = function(data) {
    Aphrael.tabs.forEach(function(tabId) {
        chrome.tabs.executeScript(tabId, {file: "content_script.js"}, function() {
            chrome.tabs.sendMessage(tabId, data, function(response) {
                // Responseが取れない場合は接続の確率に失敗しているため、タブをリロードする。
                if (typeof response === 'undefined') {
                    chrome.tabs.update(tabId, {url: tab.url});
                }
            });
        });
    });
};


// Windowを作成したときのイベント
chrome.windows.onCreated.addListener(updateTabInfo);
// ウインドウが削除されたとき
chrome.windows.onRemoved.addListener(updateTabInfo);
// タブが削除されたとき
chrome.tabs.onRemoved.addListener(updateTabInfo);

// タブがウインドウに入ったとき
chrome.tabs.onAttached.addListener(updateTabInfo);
// タブがウインドウからでたとき    
chrome.tabs.onDetached.addListener(updateTabInfo);
// 選択されているタブが変わったとき
chrome.tabs.onSelectionChanged.addListener(function(tabId) {
    updateTabInfo();
    // Aphraelのページを開いたとき
    Aphrael.tabs.forEach(function(currentTabId) {
        if (tabId === currentTabId) {
            // WebScoket接続処理を実行
            connect();
        }
    });
});
// タブが更新されたとき
chrome.tabs.onUpdated.addListener(function(tabId) {
    updateTabInfo();
    // Aphraelのページを開いたとき
    Aphrael.tabs.forEach(function(currentTabId) {
        if (tabId === currentTabId) {
            // WebScoket接続処理を実行
            connect();
        }
    });
});


})();