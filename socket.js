var io;
var http;

function initIo() {
    io.on('connection', function (socket) {
        console.log('a user connected');
        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    });
}

function checkIn() {
    return function(req, res, next) {
        io.on('connection', function (socket) {
            socket.on('userCheckin', function (user, location) {
                var date = new Date();
                var timeStamp = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + " ";
                timeStamp += date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                var msg = user + " checked in at " + location + " around " + timeStamp;
                io.emit('userCheckin', msg);
            });
        });
        next();
    }
}

module.exports = {
    init: function (http) {
        if (!io && http) {
            io = require("socket.io").listen(http);
            initIo();
        }

        return {
            checkIn: checkIn
        }
    }
};
