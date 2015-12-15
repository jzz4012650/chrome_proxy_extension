var backgroundPage = chrome.extension.getBackgroundPage(),
    hosts = backgroundPage["hosts"]


document.addEventListener('DOMContentLoaded', function() {

    var hostListDOM = document.querySelector('#hostList');
    var btnMainSwitch = document.querySelector('#mainSwitch');

    var currentHost = null;
    var proxyRuleIndex = -1;

    // get rule list
    chrome.storage.local.get({
        "proxy_rules": [],
        "switch": true
    }, function(obj) {
        var proxyRules = obj["proxy_rules"];

        if (obj["switch"]) {
            btnMainSwitch.className = "on";
        } else {
            hostList.className = "disabled";
        }

        hostListHTML = hosts.map(function(host) {
            var inList = proxyRules.indexOf(host) >= 0;
            return [
                '<li>',
                '<i ' + (inList ? 'class="on"' : '') + '><span></span></i>',
                // '<select>',
                // '<option value="0" ' + (inList ? '' : 'selected') + '>Direct</option>',
                // '<option value="1" ' + (inList ? 'selected' : '') + '> Proxy</option>',
                // '</select>',
                '<span class="host-name">' + host + '</span>',
                '</li>'
            ].join(' ');
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
            chrome.storage.local.set({
                "switch": false
            }, function() {
                self.className = "";
                hostList.className = "disabled";
                backgroundPage.stopProxy();
            });
        } else {
            chrome.storage.local.set({
                "switch": true
            }, function() {
                self.className = "on";
                hostList.className = "";
                backgroundPage.startProxy();
            });
        }
    }, false);
})

function changeProxyMode(host, mode, fn) {
    var fuc = fn || function() {};

    chrome.storage.local.get({
        "proxy_rules": []
    }, function(obj) {
        var rules = obj["proxy_rules"]
        var index = rules.indexOf(host);

        if (mode == 1 && index < 0) {
            rules.push(host);
        } else if (index >= 0) {
            rules.splice(index, 1);
        }

        chrome.storage.local.set({
            "proxy_rules": rules
        }, function() {
            backgroundPage.startProxy();
            fuc();
        })
    })
}
