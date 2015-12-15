var backgroundPage = chrome.extension.getBackgroundPage()


document.addEventListener('DOMContentLoaded', function() {

    var btnSaveDOM = document.querySelector('#btnSave'),
        proxyServersDOM = document.querySelector('#proxyServers')

    chrome.storage.local.get({
        proxy_servers: []
    }, function(obj) {
        proxyServersDOM.value = obj.proxy_servers.join('\n');
    })

    btnSaveDOM.addEventListener('click', function() {
        var list = proxyServersDOM.value.split('\n');

        chrome.storage.local.set({
            proxy_servers: list
        });

        chrome.storage.local.get({
            "switch": true,
        }, function(obj) {
            if (obj["switch"]) {
                backgroundPage.startProxy();
            }
        })
    })
});
