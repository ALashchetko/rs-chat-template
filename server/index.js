const express = require('express');
const WebSocketServer = require('uws').Server;
const {
    json
} = require('body-parser');
const {
    info
} = require('./helpers/logger');
const {
    port,
    socketPort,
    staticPath,
    isProduction,
    version
} = require('./config');

const server = express();
const WSServer = new WebSocketServer({
    port: socketPort
});

let clients = {};
let history = [];
let currentUsersCount = 0;

info(`---------------------CHAT SERVER v${version}---------------------`);
server.use(express.static(staticPath));
info(`Static is used from ${staticPath}`);
info(`Running in ${isProduction ? 'PRODUCTION' : 'DEV'} mode`);
server.use(json());
server.listen(port, () => {
    info(`Server was started on port ${port}`);
    info(`WebSocket server was started on port ${socketPort}`);
    info('------------------------------------------------------------');
    WSServer.on('connection', (ws) => {
        currentUsersCount += 1;
        const id = Math.floor(Math.random() * (10 - 0 + 1)) + 0;
        clients[id] = ws;
        info('user connected, user id = ' + id);
        clients[id].send(JSON.stringify({
            type: 'id',
            message: id,
        }));
        for (let i = 0; i < history.length; i++) {
            clients[id].send(JSON.stringify(history[i]));
        }
        clients[id].send(JSON.stringify({
            type: 'online',
            message: currentUsersCount,
        }));
        ws.on('message', (message) => {
            history.push({
                type: 'message',
                message: message,
            });
            info('received', message);
            for (var key in clients) {
                clients[key].send(JSON.stringify({
                    type: 'message',
                    message: message,
                }));
            }
            for (let i = 0; i < history.length; i++) {
                info(history[i].id, history[i].message);
            }
            clients[id].send(JSON.stringify({
                type: 'online',
                message: currentUsersCount,
            }));
        });
        ws.on('close', () => {
            currentUsersCount -= 1;
            info('user disconnected');
            delete clients[id];
        });
    });
});
