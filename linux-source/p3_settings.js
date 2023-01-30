const { ipcRenderer } = require('electron');
function switchTab(id) {
    document.querySelector('.tab-current').classList.remove('tab-current');
    document.querySelector('.view-current').classList.remove('view-current');
    document.querySelector(`.tab-${id}`).classList.add('tab-current');
    document.querySelector(`.view-${id}`).classList.add('view-current');
}

var secret = "";
var address = "";
var Status = {};
var autostart = false;

ipcRenderer.on('switch-tab', (event,tab) => { switchTab(tab) });

setInterval(()=> {
    Status = ipcRenderer.sendSync('status');
    if(Status.secret != secret) {
        secret = Status.secret;
        document.querySelector('.p3-parameters').value = secret;
    }
    var portE=document.querySelector('.p3-port-entries');
    var portsHtml = "";
    Status.portsInUse.forEach(port => {
        var elm=document.createElement('elm')
        elm.innerHTML= `<div class="p3-port-row">
        <div class="p3-port-port"></div>
        <div class="p3-port-flags"></div>
        <div class="p3-port-type"></div>
        </div>`;
        elm.querySelector('.p3-port-port').innerText = port;
        elm.querySelector('.p3-port-type').innerText = 'Private';
        portsHtml += elm.innerHTML;
    });
    portE.innerHTML = portsHtml;
    if(Status.autostart != autostart) {
        autostart = Status.autostart;
        document.querySelector('.p3-on-startup').checked = autostart;
    }
    document.querySelector('.p3-status-light').dataset.state = Status.state;
    switch(Status.state) {
        case 'online':
            document.querySelector('.p3-status').innerText = "Connected";
            break;
        case 'offline':
            document.querySelector('.p3-status').innerText = "Not Connected";
            break
        case 'connecting':
            document.querySelector('.p3-status').innerText = "Connecting";
            break;
        case 'error':
        default:
            document.querySelector('.p3-status').innerText = "Error";
    }
    document.querySelector('.p3-parameters').disabled = Status.state!='offline';
    document.querySelector('.p3-connector').disabled = Status.state=='connecting';
    document.querySelector('.p3-connector').innerText = Status.state == 'offline' ? 'Connect': 'Disconnect';
    if(Status.address != address) {
        address = Status.address;
        document.querySelector('.p3-address').value = address||"";
    }
});

function P3_Start() {
    ipcRenderer.send('p3.start')
}

function P3_Stop() {
    ipcRenderer.send('p3.stop')
}

function P3_SetKey(key) {
    ipcRenderer.send('p3.setkey', key)
}

function P3_SetOnStart(ons) {
    ipcRenderer.send('p3.setOnStart', ons)
}