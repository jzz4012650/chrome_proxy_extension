var backgroundPage = chrome.extension.getBackgroundPage();
var tabs           = backgroundPage.tabs;
var currentTabId   = backgroundPage.currentTabId;
var settings       = backgroundPage.settings;

// var options = chrome.storage.sync.get({
//         proxy_servers: []
//     }, function(obj) {
//         proxyServersDOM.value = obj.proxy_servers.join('\n');
//     })

document.addEventListener('DOMContentLoaded', function() {

    var mask = document.querySelector('.mask');
    var hostListDOM = document.querySelector('#hostList');
    var btnMainSwitch = document.querySelector('#mainSwitch');
    var btnOpenOptionPage = document.querySelector('#btnOpenOptionPage');

    var currentHost = null;
    var proxyRuleIndex = -1;



    // get rule list
    chrome.storage.sync.get({
        "proxy_servers": [],
        "proxy_rules": [],
        "switch": false
    }, function(obj) {
        var hosts      = tabs[currentTabId];
        var proxyRules = obj["proxy_rules"];
console.log(obj["proxy_servers"]);
        if (!obj["proxy_servers"].length) {
            mask.style.display = 'flex';
        } else {
            mask.style.display = 'none';
        }

        if (obj["switch"]) {
            btnMainSwitch.className = "on";
        } else {
            hostList.className = "disabled";
        }

        hostListHTML = hosts.map(function(host) {
            var inList = proxyRules.indexOf(host) >= 0;
            return `
                <li>
                    <i class="${inList ? 'on' : ''}"><span></span></i>
                    <span class="host-name">${host}</span>
                </li>
            `;
        })

        hostListDOM.innerHTML = hostListHTML.join('');
    });

    // host list change event
    hostListDOM.addEventListener('click', function(event) {
        var el = event.target;

        if (el.tagName !== 'I' && el.parentNode.tagName === 'I') {
            el = el.parentNode;
        }

        if (el.tagName === 'I') {
            var mode = !(el.className === "on");
            var host = el.parentNode.querySelector('span.host-name').innerText;

            changeProxyMode(host, mode, function() {
                el.className = mode ? "on" : "";
            });
        }
    }, false);

    // main switch envent
    btnMainSwitch.addEventListener('click', function(event) {
        var self = this;
        if (self.className === "on") {
            backgroundPage.stopProxy(function() {
                chrome.storage.sync.set({
                    "switch": false
                }, function() {
                    self.className = "";
                    hostList.className = "disabled";
                });
            });
        } else {
            backgroundPage.startProxy(function() {
                chrome.storage.sync.set({
                    "switch": true
                }, function() {
                    self.className = "on";
                    hostList.className = "";
                });
            })
        }
    }, false);

    // open options page
    btnOpenOptionPage.addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    })
})

function changeProxyMode(host, mode, fn) {
    var fuc = fn || function() {};

    chrome.storage.sync.get({
        "proxy_rules": []
    }, function(obj) {
        var rules = obj["proxy_rules"]
        var index = rules.indexOf(host);

        if (mode == 1 && index < 0) {
            rules.push(host);
        } else if (index >= 0) {
            rules.splice(index, 1);
        }

        chrome.storage.sync.set({
            "proxy_rules": rules
        }, function() {
            backgroundPage.startProxy();
            fuc();
        })
    })
}
