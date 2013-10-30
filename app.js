var http = require('http');
var express = require('express');
var app = express();
var io = require('socket.io').listen(3001);

//asks to use Chrome plugin in IE
var chromePluginMiddleware = function(req, res, next) {
    res.setHeader("X-UA-Compatible", "chrome=1"); 
    return next();
}

//configure socket.io
io.set('log level', 1);
io.set('transports', ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling', 'flashsocket']);

//configure ExpressJS
app.use(chromePluginMiddleware);
app.use(express.static(__dirname + '/public'));

app.listen(3000);

io.sockets.on('connection', function(socket) {
    socket.on('CreateSession', function(room){
        socket.join(room);
    });
    socket.on('PageChange', function(room){
        console.log("pagechange: " +room);
        socket.join(room);
        io.sockets.in(room).emit('SessionStarted', '');
    });
    socket.on('JoinRoom', function(room){
        socket.join(room);
        io.sockets.in(room).emit('SessionStarted', '');
    });
    socket.on('ClientMousePosition', function(msg){
        socket.broadcast.to(socket.room).emit('ClientMousePosition', {PositionLeft:msg.PositionLeft, PositionTop:msg.PositionTop});
    });
    socket.on('AdminMousePosition', function(msg){
        socket.broadcast.to(msg.room).emit('AdminMousePosition', {PositionLeft:msg.PositionLeft, PositionTop:msg.PositionTop});
    });
    socket.on('changeHappened', function(msg){
        socket.broadcast.to(msg.room).emit('changes', msg.change);
    });
    socket.on('DOMLoaded', function(msg){
        socket.broadcast.to(msg.room).emit('DOMLoaded', '');
    });
});