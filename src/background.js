var STORAGE_KEY = 'proxy_rules',
    hosts = [],
    currentTabId = -1,
    proxyRules = null;

// when tab changeed
chrome.tabs.onActiveChanged.addListener(function(tabId) {
    currentTabId = tabId;
    resetHosts();
});

// when tab updated
chrome.tabs.onUpdated.addListener(function(tabId) {
    if (tabId == currentTabId) {
        // resetHosts();
    }
});

// when a request is going to be send
chrome.webRequest.onBeforeRequest.addListener(function(req) {
    if (req.tabId == currentTabId) {
        collectHosts(req);
    }
}, {
    urls: [
        "http://*/*",
        "https://*/*"
    ]
});

chrome.browserAction.onClicked.addListener(function(tab) {
    console.log('clicked')
})

function resetHosts() {
    hosts = [];
}

function collectHosts(req) {
    var host = getLocation(req.url).hostname;

    if (hosts.indexOf(host) < 0) {
        hosts.push(host);
    }
}

function getLocation(href) {
    var a = document.createElement("a");
    a.href = href;
    return a;
};
