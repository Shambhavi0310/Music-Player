var mysql = require("mysql");
var net = require('net');
var sockets = [];
var express = require("express"),
    app = require("express")(),
    http = require("http").Server(app),
    io = require("socket.io")(http),
    util = require("util"),
    fs = require("fs");
var valid = 0;
var HOST = '192.168.0.111'; //  var HOST = '192.168.0.91';
var PORT = 8003;
global.MYVAR = "Test 1";
global.MYVAR2 = "Test 2";
var server = net.createServer();
server.listen(PORT, HOST);

var server_user = []; //Chưa thông tin của người dùng
var clients = []; //Chưa socket của người dùng
var group_leader = [];
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'vfdstatus',
    password: 'root',
    database: 'vfdstatus',
});

connection.connect();
http.listen(2500, function() {
    console.log("Connected to :2500");
});

app.use(express.static(__dirname));
app.get("/", function(req, res) {
    res.sendfile(__irname + "/index.html");
});
app.get("/load", function(req, res) {
    res.sendfile(__irname + "/load.html");
});
io.sockets.on("connection", function(socket) {
    socket.on('callread', function(msg) { // code for write 
        // Creates an event
        console.log(msg);
        // displays the message in the console
        MYVAR = msg;
        // Sets the global variable to be the contents of the message recieved
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i]) {
                sockets[i].write(MYVAR, 'utf-8');
            }
        }
    }); //done ok

    socket.on('checkbox1', function(msg) { // code for write 
        // Creates an event
        console.log(msg);
        // displays the message in the console
        MYVAR = msg;
        // Sets the global variable to be the contents of the message recieved
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i]) {
                sockets[i].write(MYVAR, 'utf-8');
            }
        }
    }); //done ok
    io.emit("user_connection", socket.id);
    //At the user login
    //Returns all other user information
    io.emit("server_user", server_user);
    //Create a new user
    socket.on("create_user", function(data_user) {
        server_user.push(data_user);
        io.emit("create_user", data_user);
    });
    //Send chat content
    socket.on("message", function(data_message) {
        io.emit("message", data_message);
    })
    socket.on("disconnect", function() {
        var i = 0;
        for (var i = 0; i < server_user.length; i++) {
            if (server_user[i].id == socket.id) {
                console.log('socketid3=', socket.id);
                //  server_user.splice(i, 1); //Clear user data
            }
        }
        io.emit("user_disconnect", socket.id);
        fs.writeFile('socket.txt', util.inspect(socket, false, null));
    });
    //Create a new group
    socket.on("create_room", function(room_id) {
        io.sockets.connected[socket.id].join(room_id);
        group_leader[room_id] = socket.id;
    });
    socket.on("invite_room", function(id, room_id) {
        io.sockets.connected[id].emit("invite_room", id, room_id);
    });
    socket.on("status_invited_room", function(id, room_id, status) {
        if (status == 1) {
            io.sockets.connected[id].join(room_id);
        }
    });
    socket.on("event_room", function(room_id, message_type, event_room) {
        if (group_leader[room_id] == socket.id) {
            if (message_type == "travel") {
                socket.in(room_id).emit("event_room", getUserRoom(room_id), message_type, event_room);
                io.sockets.connected[socket.id].emit("event_room", getUserRoom(room_id), message_type, event_room);
                console.log("Da chi duong");
            } else if (message_type == "bounds" || message_type == "streetview") {
                socket.in(room_id).emit("event_room", '', message_type, event_room);
            }
        }
    });
    socket.on("room_message", function(room_id, data_message) {
        socket.in(room_id).emit("room_message", data_message);
        io.sockets.connected[socket.id].emit("room_message", data_message);
    })
});
server.on('connection', function(socket) { //when card is connected to server
    // Opens the socket for the TCP connection
    sockets.push(socket);
    clients.push(socket);
    socket.write(MYVAR, 'utf-8');


    console.log('TCP connecting 1');
    io.emit("user_connection", socket.id);
    console.log('TCP connecting 2');
    //At the user login
    //Returns all other user information
    io.emit("server_user", server_user);
    console.log('TCP connecting 3');
    // Handle incoming messages from clients.
    socket.on('data', function(data) {
        //  socket.username = username;
        //broadcast(socket.name + "> " + data, socket);
        console.log('data', data);
        broadcast(" " + data, socket);

    });
    // Remove the client from the list when it leaves
    socket.on('end', function() {
        // clients.splice(clients.indexOf(socket), 1);
        console.log(socket.id + '-left');
        var i = 0;
        for (var i = 0; i < server_user.length; i++) {
            console.log('sockets.name=', sockets.name);
            console.log('socket.name', socket.name);
            if (server_user[i].id == socket.id) {
                //server_user.splice(i, 1); //Xóa dữ liệu người dùng
                console.log('id=', server_user[i].name);
            }

        }
        io.emit("user_disconnect", socket.id);
        //fs.writeFile('socket.txt', util.inspect(socket, false, null));
        //  clients.splice(clients.indexOf(socket), 1);
        // broadcast(socket.name + " left .\n");
    });
    // Send a message to all clients
    function broadcast(message, sender) {

        MYVAR2 = message;
        console.log(MYVAR2);
        var substr1 = MYVAR2.substring(1, 6);
        var substr2 = MYVAR2.substring(6, 10);
        console.log('Inputid:', substr1);
        console.log('Inputval:', substr2);
        //sql
        console.log('current valid id', valid);
        var queryString = 'SELECT `productid` FROM `status`';
        //select 
        connection.query(queryString, function(err, result, fields) {
            if (err) throw err;
            console.log('RESULT:', result);
            for (var i in result) {
                console.log(result[i].productid);
                if (substr1 == result[i].productid) {
                    valid = 1;
                    console.log('True valid id', valid);
                    io.emit('online', substr1);
                }
            }

            console.log('Now Valid is:', valid);
            if (valid == 1) {
                console.log('inserting values..');
                connection.query("INSERT INTO `status` (`productid`,`freq`) VALUES ('" + substr1 + "','" + substr2 + "')", function(err, rows) {
                    if (err) throw err;
                });

            }
            console.log('valid5:', valid);
            if (valid == 1) {
                console.log('sending msg over internet...');
                io.emit('updateHeader', MYVAR2);
                valid = 0;
            }
            console.log('valid6:', valid);
        });
        connection.on('error', function(err) {
            // callback(false);
            return;
        });

        //sql ends
    }
}).listen(PORT, HOST);

function getUserRoom(room_id) {
    var user = [];
    for (var key in io.sockets.adapter.rooms[room_id]) {
        if (io.sockets.adapter.rooms[room_id][key] == true) {
            user.push(key);
        }
    }
    return user;
}