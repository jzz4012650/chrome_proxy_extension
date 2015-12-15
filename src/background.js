var hosts = [],
    servers = [],
    currentTabId = -1

// initial proxy state
chrome.storage.local.get({
    "switch": true,
    "proxy_rules": [],
    "proxy_servers": []
}, function(obj) {
    if (obj["switch"]) {
        startProxy();
    } else {
        stopProxy();
    }
});


// when tab changeed
chrome.tabs.onActivated.addListener(function(tab) {
    currentTabId = tab.tabId;
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

function stopProxy(fn) {
    var fnc = fn || function() {};

    chrome.proxy.settings.set({
        value: {
            mode: "system"
        }
    }, function() {
        chrome.browserAction.setIcon({
            path: "icon16_gray.png"
        });

        fnc();
    });
}

function startProxy(fn) {
    var fnc = fn || function() {};

    chrome.storage.local.get({
        "proxy_rules": [],
        "proxy_servers": []
    }, function(obj) {
        chrome.proxy.settings.set({
            value: {
                mode: "pac_script",
                pacScript: {
                    data: generatePAC(obj["proxy_rules"], obj["proxy_servers"])
                }
            }
        }, function() {
            chrome.browserAction.setIcon({
                path: "icon16.png"
            });

            fnc();
        });
    });
}

function generatePAC(rules, servers) {
    var proxys = servers.map(function(el) {
        return "proxy " + el;
    }).join('; ') || "DIRECT";

    var pac = [
        'function FindProxyForURL(url,host){var OUT_WALLS=',
        JSON.stringify(rules),
        ';var PROXYS="',
        proxys,
        '";if(OUT_WALLS.indexOf(host)<0)return "DIRECT";return PROXYS;}'
    ].join('');

    return pac;
}
