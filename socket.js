var io;
var http;

function initIo() {
    io.on('connection', function(socket) {
        console.log('a user connected');
        socket.on('disconnect', function() {
            console.log('user disconnected');
        });
    });
}

function checkIn() {
    return function(req, res, next) {
        io.on('connection', function(socket) {
            socket.on('userCheckin', function(user, location) {
                var date = new Date();
                var timeStamp = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + " ";
                timeStamp += date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                var msg = "Check-in: " + user + " checked in at " + location + " around " + timeStamp;
                io.emit('userCheckin', msg);
            });
        });
        next();
    }
}

function checkWinners(user, contest) {
    var date = new Date();
    var timeStamp = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + " ";
    timeStamp += date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    var msg = "Winner: " + user + " won in at contest: " + contest + " around " + timeStamp;
    io.emit('winner', msg);
}

module.exports = {
    init: function(http) {
        if (!io && http) {
            io = require("socket.io").listen(http);
            initIo();
        }

        return {
            checkIn: checkIn,
            checkWinners: checkWinners
        }
    }
};