var KEY = 'rules',
    hosts = [],
    servers = [],
    currentTabId = -1,
    hostDom = null;

var DOMAINS = ["biz","com","edu","gov","info","int","mil","name","net","org","pro","xxx","aero","cat","coop","jobs","museum","travel","mobi","asia","tel","arpa","root","tel","post","geo","kid","mail","sco","web","nato","example","invalid","localhost","test","bitnet","csnet","local","onion","uucp","ac","ad","ae","af","ag","ai","al","am","an","ao","aq","ar","as","at","au","aw","az","ba","bb","bd","be","bf","bg","bh","bi","bj","bm","bn","bo","br","bs","bt","bv","bw","by","bz","ca","cc","cd","cf","cg","ch","ci","ck","cl","cm","cn","co","cr","cu","cv","cx","cy","cz","de","dj","dk","dm","do","dz","ec","ee","eg","er","es","et","eu","fi","fj","fk","fm","fo","fr","ga","gd","ge","gf","gg","gh","gi","gl","gm","gn","gp","gq","gr","gs","gt","gu","gw","gy","hk","hm","hn","hr","ht","hu","id","ie","il","im","in","io","iq","ir","is","it","je","jm","jo","jp","ke","kg","kh","ki","km","kn","kr","kw","ky","kz","la","lb","lc","li","lk","lr","ls","lt","lu","lv","ly","ma","mc","md","me","mg","mh","mk","ml","mm","mn","mo","mp","mq","mr","ms","mt","mu","mv","mw","mx","my","mz","na","nc","ne","nf","ng","ni","nl","no","np","nr","nu","nz","om","pa","pe","pf","pg","ph","pk","pl","pm","pn","pr","ps","pt","pw","py","qa","re","ro","ru","rw","sa","sb","sc","sd","se","sg","sh","si","sk","sl","sm","sn","so","sr","st","sv","sy","sz","tc","td","tf","tg","th","tj","tk","tl","tm","tn","to","tr","tt","tv","tw","tz","ua","ug","uk","us","uy","uz","va","vc","ve","vg","vi","vn","vu","wf","ws","ye","yt","yu","za","zm","zw","cs","eh","kp","ax","bv","gb","sj","um"];

// initial proxy state
chrome.storage.sync.get({
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

    host = getTopHost(host);

    if (hosts.indexOf(host) < 0) {
        hosts.push(host);
    }
}

function getTopHost(host) {
    var hostArray = host.split('.');

    for (var i = hostArray.length - 1; i >= 0; i--) {
        if (DOMAINS.indexOf(hostArray[i]) < 0) {
            hostArray = hostArray.splice(i);console.log(hostArray)
            break;
        }
    };

    return hostArray.join('.');
}

function getLocation(href) {
    hostDom = hostDom || document.createElement("a");
    hostDom.href = href;
    return hostDom;
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

    chrome.storage.sync.get({
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
    var proxys = servers.join('; ') || "DIRECT";

    var pac = [
        'function FindProxyForURL(url,host){',
            'var OUT_WALLS=',JSON.stringify(rules),';',
            'var PROXYS="',proxys,'";',
            'for (var i = OUT_WALLS.length - 1; i >= 0; i--) {',
                'if (host.indexOf(OUT_WALLS[i]) >= 0) return PROXYS;',
            '} return "DIRECT";',
        '}'
    ].join('');

    return pac;
}
