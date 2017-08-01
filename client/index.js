import './index.css';

var socket = new WebSocket("ws://localhost:8081");

socket.onopen = function() {
    alert("Соединение установлено");
};

document.forms.publish.onsubmit = function() {
    const outgoingMessage = document.getElementById('userName').innerText + ': ' + this.message.value;
    socket.send(outgoingMessage);
    return false;
};

socket.onmessage = function(event) {
    const incomingMessage = JSON.parse(event.data);
    if (incomingMessage.type === 'message') showMessage(incomingMessage.message);
    else if (incomingMessage.type === 'id') setMyId(incomingMessage.message);
    else if (incomingMessage.type === 'online') setOnline(incomingMessage.message);
};

function showMessage(message) {
    const messageElem = document.createElement('span');
    messageElem.appendChild(document.createTextNode(message));
    document.getElementById('messagess').appendChild(messageElem);
    document.getElementById('messagess').appendChild(document.createElement('p'));
}

function setMyId(id) {
    document.getElementById('userName').innerText = 'Anon ' + id;
}

function setOnline(onlNumber) {
    document.getElementById('online').innerText = 'Online: ' + onlNumber;
}
