(function() {
/**
 * notify.js
 * version: 0.0.7 (2013/07/09)
 *
 * Licensed under the MIT:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2013, Ryuichi TANAKA [mapserver2007@gmail.com]
 */

var Aphrael = {
    host: 'localhost',
    port: '9224',
    webSocket: null,
    manager: null,
    tabs: [],
    storage: null
};

// Extensionの実行を許可するホスト名
var ALLOWED_HOST = [
    'localhost',
    'sparhawk-web-server.herokuapp.com'
];

Aphrael.storage = new AphraelStorage();

/**
 * WebSocket接続処理
 */
var connect = function() {
    if (Aphrael.webSocket) return;
    Aphrael.webSocket = new WebSocket("ws://" + Aphrael.host + ":" + Aphrael.port);

    Aphrael.webSocket.onmessage = function(res) {
        executeTracking(JSON.parse(res.data));
    };
    Aphrael.webSocket.onclose = function(ws) {
        if (!ws.wasClean) {
            this.close();
        }
        // 1006の場合、サーバからの切断なのでAlertを発生させる
        if (ws.code === 1006) {
            chrome.windows.getCurrent(function(windowInfo) {
                chrome.tabs.getSelected(windowInfo.id, function(tab) {
                    showMessage(tab.id, 'Connection rest by peer.');
                });
            });
        }
    };
    Aphrael.webSocket.onerror = function(e) {
        console.log(e);
        throw e;
    };
};

/**
 * WebSocket切断処理
 */
var close = function() {
    if (Aphrael.webSocket) {
        Aphrael.webSocket.close();
        Aphrael.webSocket = null;
    }
};

/**
 * WebSocketの接続を監視する
 * Aphraelのページを開いたタブがアクティブかつサーバとの接続が未確立の場合、
 * 接続処理を実行する。タブがインアクティブになったら接続ループから抜ける
 */
var connectionManager = function() {
    // WebSocketが切断状態になったら再接続する
    if (Aphrael.webSocket !== null && Aphrael.webSocket.readyState === 3) {
        console.log("Client connection closed for server stop");
        close();
    }
    if (Aphrael.webSocket === null) {
        console.log("Client reconnect for server restart.");
        connect();
    }
};

/**
 * ウインドウにAlertを表示する
 * @param {Integer} tabId タブID
 * @param {String} message 表示メッセージ
 */
var showMessage = function(tabId, message) {
    sendMessage(tabId, 500, {message: message}, function() {});
};

/**
 * メッセージをコンテントスクリプトに送信する
 * @param {Integer} tabId タブID
 * @param {Integer} status ステータスコード
 * @param {Object} data 送信データ
 * @param {Function} callback 送信実行後のコールバック
 */
var sendMessage = function(tabId, status, data, callback) {
    chrome.tabs.executeScript(tabId, {file: "content_script.js"}, function() {
        data.status = status;
        chrome.tabs.sendMessage(tabId, data, callback);
    });
};

/**
 * 更新対象のタブIDをセットする
 */
var updateTabInfo = function() {
    // 全てのWindow情報を取得
    chrome.windows.getAll({populate: true}, function(windowList) {
        Aphrael.tabs = [];
        windowList.forEach(function(windowInfo) {
            var tabs = windowInfo.tabs;
            // 全てのタブをチェックし、Aphraelを適用するタブ情報を保持する
            tabs.forEach(function(tab) {
                if (isAllowedHost(tab.url)) {
                    Aphrael.tabs.push(tab.id);
                }
            });
        });

        // Aphraelのページを全て閉じたらWebSocketをクローズする
        if (Aphrael.tabs.length === 0) {
            close();
        }
    });
};

/**
 * 地図更新処理を実行
 * @param {Object} data 送信データ
 */
var executeTracking = function(data) {
    Aphrael.tabs.forEach(function(tabId) {
        chrome.tabs.get(tabId, function(tab) {
            sendMessage(tabId, 200, data, function(response) {
                if (typeof response === 'undefined') {
                   chrome.tabs.update(tabId, {url: tab.url});
                }
            });
        });
    });
};

/**
 * 配列の中に要素が含まれるかどうか検出する
 * @param {*} elem 要素
 * @param {Array} array 検索対象の配列
 * @returns {Number} キー番号
 */
var inArray = function(elem, array) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (array[i] === elem) {
            return i;
        }
    }
    return -1;
};

/**
 * タブ更新されたときの処理
 * @param {String} url タブのURL
 * @return {Boolean} 実行許可されたホストかどうか
 */
var isAllowedHost = function(url) {
    for (var i = 0; i < ALLOWED_HOST.length; i++) {
        if (url.indexOf("://" + ALLOWED_HOST[i], 0) !== -1) {
            return true;
        }
    }
    return false;
};

/**
 * タブ更新されたときの処理
 * @param {Integer} tabId タブID
 */
var tabUpdated = function(tabId) {
    updateTabInfo();
    // サーバとの接続が切断済みだがWebSocketオブジェクトが残っている場合は一旦
    // クライアント側でクローズしてオブジェクトをクリアする
    if (Aphrael.webSocket !== null && Aphrael.webSocket.readyState === 3) {
        close();
    }
    // Aphraelのページをアクティブにしたとき、接続と監視を開始する   
    if (inArray(tabId, Aphrael.tabs) !== -1) {
        connect();
        Aphrael.manager = setInterval(connectionManager, 3000);
    }
    // Aphrael以外のページをアクティブにしたとき監視を停止する
    else {
        clearInterval(Aphrael.manager);
    }
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
    tabUpdated(tabId);
});
// タブが更新されたとき
chrome.tabs.onUpdated.addListener(function(tabId) {
    tabUpdated(tabId);
});


})();