var PROXY_QIHOO = {
    mode: "fixed_servers",
    rules: {
        singleProxy: {
            host: "10.16.13.18",
            port: 8080
        },
        bypassList: ["<local>", "*corp.qihoo.net"]
    }
}
var PROXY_DIRECT = {
    mode: "direct"
}
var PROXY_RULES_KEY = 'proxy_rules';

chrome.proxy.settings.get(
          {'incognito': false},
          function(config) {console.log(config)});

document.addEventListener('DOMContentLoaded', function() {


    var curHostDOM = document.querySelector('#curHost');
    var proxyModeDOM = document.querySelector('#proxyMode');
    var statusDOM = document.querySelector('#status');
    var btnStartProxy = document.querySelector('#btnStartProxy');
    var btnStopProxy = document.querySelector('#btnStopProxy');

    var currentHost = null;
    var proxyRules = null;
    var proxyRuleIndex = -1;


    chrome.tabs.query({
        active: true
    }, function(tabs) {
        var curURL = tabs[0].url;
        var location = getLocation(curURL);
        var host = location.hostname;

        currentHost = host;
        curHostDOM.innerText = host;

        chrome.storage.local.get(null, function(obj) {
            console.log(obj);
            if (!(PROXY_RULES_KEY in obj)) {
                proxyRules = [];
            } else {
                proxyRules = Array.isArray(obj[PROXY_RULES_KEY]) && obj[PROXY_RULES_KEY] || [];
                console.log(proxyRules);
                proxyRuleIndex = proxyRules.indexOf(host);

                if (proxyRuleIndex >= 0) {
                    proxyModeDOM.value = 1;
                }
            }
        });
    });

    btnStartProxy.addEventListener('click', function() {
        startProxy(statusDOM)
    }, false);

    btnStopProxy.addEventListener('click', function() {
        stopProxy(statusDOM)
    }, false);

    proxyModeDOM.addEventListener('change', function() {
        var mode = this.value;
        console.log(proxyRules);
        changeProxyMode(currentHost, mode, proxyRules, proxyRuleIndex);
    })
})

function getLocation(href) {
    var a = document.createElement("a");
    a.href = href;
    return a;
};

function startProxy(statusDOM) {
    chrome.proxy.settings.set({
        value: PROXY_QIHOO,
        scope: 'regular'
    });
    statusDOM.innerText = "QIHOO";
}

function stopProxy(statusDOM) {
    chrome.proxy.settings.set({
        value: PROXY_DIRECT,
        scope: 'regular'
    });
    statusDOM.innerText = "DIRECT";
}

function changeProxyMode(host, mode, rules, index) {
    if (mode == 1 && index < 0) {
        // 添加host
        rules.push(host);
        updateStorage(rules);
    } else if (index >= 0) {
        // 剔除host
        rules.splice(index, 1);
        updateStorage(rules);
    }

    chrome.proxy.settings.set({
        value: {
            mode: "pac_script",
            pacScript: {
                data: getNewPAC(rules)
            }
        },
        scope: 'regular'
    });
}

function updateStorage(rules) {
    var obj = {};

    obj[PROXY_RULES_KEY] = rules;
    chrome.storage.local.set(obj);
}

function getNewPAC(rules) {
    var proxys = [
        "PROXY 10.16.13.18:8080",
        "PROXY proxy.corp.qihoo.net:8080"
    ].join('; ');

    var pac = [
        'function FindProxyForURL(url,host){var OUT_WALLS=',
        JSON.stringify(rules),
        ';var PROXYS="',
        proxys,
        '";if(OUT_WALLS.indexOf(host)<0)return "DIRECT";return PROXYS;}'
    ].join('');
console.log(pac);
    return pac;
}
