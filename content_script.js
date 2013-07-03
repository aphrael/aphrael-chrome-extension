chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request);
    document.body.innerHTML += "test";
    sendResponse({status: "end"});
});

