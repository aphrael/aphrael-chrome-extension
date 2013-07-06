(function() {

var Aphrael = {
    host: 'localhost',
    port: '9222',
    webSocket: null,
    tabs: []
};

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
    });
};

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
chrome.windows.onCreated.addListener(function() {
    updateTabInfo();

    if (!Aphrael.webSocket) {
        Aphrael.webSocket = new WebSocket("ws://" + Aphrael.host + ":" + Aphrael.port + "/websocket");
    }

    Aphrael.webSocket.onmessage = function(res) {
        executeTracking(JSON.parse(res.data));
    };

    Aphrael.webSocket.onclose = function(ws) {
        Aphrael.connections = Aphrael.connections.filter(function(conn) {
            return conn === ws ? false : true;
        });
    };

    Aphrael.webSocket.onerror = function(e) {
        throw e;
    };  
});

// ウインドウが削除されたとき
chrome.windows.onRemoved.addListener(updateTabInfo);
// タブがウインドウに入ったとき
chrome.tabs.onAttached.addListener(updateTabInfo);
// タブがウインドウからでたとき    
chrome.tabs.onDetached.addListener(updateTabInfo);
// 選択されているタブが変わったとき
chrome.tabs.onSelectionChanged.addListener(function(tabId) {
    //Aphrael.tabId = tabId;
    updateTabInfo();
});
// タブが更新されたとき
chrome.tabs.onUpdated.addListener(updateTabInfo);


})();