var PROXY_SYSTEM = {
    scope: 'regular',
    value: {
        mode: "system"
    }
}

var backgroundPage = chrome.extension.getBackgroundPage(),
    STORAGE_KEY = backgroundPage['STORAGE_KEY'],
    hosts = backgroundPage['hosts'],
    proxyRules = [];


document.addEventListener('DOMContentLoaded', function() {

    var curHostDOM = document.querySelector('#curHost');
    var proxyModeDOM = document.querySelector('#proxyMode');
    var statusDOM = document.querySelector('#status');
    var hostListDOM = document.querySelector('#hostList');
    var btnMainSwitch = document.querySelector('#btnMainSwitch');
    var btnStartProxy = document.querySelector('#btnStartProxy');
    var btnStopProxy = document.querySelector('#btnStopProxy');

    var currentHost = null;
    var proxyRuleIndex = -1;

    // get rule list
    chrome.storage.local.get(null, function(obj) {
        var value = obj[STORAGE_KEY];
        if (value && Array.isArray(value)) {
            proxyRules = value;
        }

        hostListHTML = hosts.map(function(host) {
            var inList = proxyRules.indexOf(host) >= 0;
            return [
                '<li>',
                    '<select>',
                        '<option value="0" ' + (inList ? '' : 'selected') + '>Direct</option>',
                        '<option value="1" ' + (inList ? 'selected' : '') + '>Proxy</option>',
                    '</select>',
                    '<span>' + host + '</span>',
                '</li>'
            ].join(' ');
        });
        hostListDOM.innerHTML = hostListHTML.join('');
    });

    hostListDOM.addEventListener('change', function(event) {
        var el = event.target;

        if (el.tagName.toLowerCase() === 'select') {
            var mode = el.value;
            var host = el.parentNode.querySelector('span').innerText;

            changeProxyMode(host, mode, proxyRules);
        }
    })；

    btnMainSwitch.addEventListener('click', function(event) {
        if (this.innerText == "ON") {
            // TODO: off
            chrome.proxy.settings.set(PROXY_SYSTEM);
            chrome.storage.local.set({"switch": false});
        } else {
            // TODO: on
            chrome.storage.local.set({"switch": true});
        }
    });
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

function changeProxyMode(host, mode, rules) {
    var index = rules.indexOf(host);

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

    obj[STORAGE_KEY] = rules;
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

    return pac;
}
