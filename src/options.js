var backgroundPage = chrome.extension.getBackgroundPage()

document.addEventListener('DOMContentLoaded', function() {

    var btnSaveDOM      = document.querySelector('#btnSave');
    var proxyServersDOM = document.querySelector('#proxyServers');
    var proxyType       = document.querySelector('#proxyType');
    var serverAddress   = document.querySelector('#serverAddress');
    var serverPort      = document.querySelector('#serverPort');

    chrome.storage.sync.get({
        proxy_servers: []
    }, function(obj) {
        if (obj["proxy_servers"].length) {
            var server = obj["proxy_servers"][0];

            proxyType.value     = server.type;
            serverAddress.value = server.server;
            serverPort.value    = server.port;
        }
    })

    btnSaveDOM.addEventListener('click', function() {
        var proxyServer = {
            type:   proxyType.value,
            server: serverAddress.value,
            port:   serverPort.value
        }

        if (!proxyServer.server) {
            serverAddress.focus();
            return alert('proxy server can not be null');
        }
        if (+proxyServer.port > 65535 || +proxyServer.port < 0) {
            serverPort.focus();
            return alert('server port must within 0 - 65535');
        }

        chrome.storage.sync.set({
            proxy_servers: [proxyServer]
        });

        chrome.storage.sync.get({
            "switch": false
        }, function(obj) {
            if (obj["switch"]) {
                backgroundPage.startProxy();
            }
        });

        alert('proxy server saved！');
    })
});
