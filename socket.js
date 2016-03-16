var io;

function initIo() {
    io.on('connection', function (socket) {
        console.log('a user connected');
        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    });

    io.on('connection', function (socket) {
        socket.on('chat message', function (msg) {
            io.emit('chat message', 'message: ' + msg);
        });
    });
}

module.exports = function (http) {

    if (!io && http) {
        io = require("socket.io").listen(http);
        initIo();
    }
}