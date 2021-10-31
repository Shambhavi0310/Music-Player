var path = require("path");
var nodemailer = require('nodemailer');
var express = require("express");
var mysql = require("mysql");
    app = require("express")(),
    api = require("express")(),
    http = require("http").Server(app),
    io = require("socket.io")(http),
    util = require("util"),
    fileSystem = require("fs");
var valid = 0;



/*var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "admin" ,
  port : 3306
});
connection.connect(function(err) {
  if (err) throw er;
  console.log("Connected!");

 
});*/

var track_index=0;
var seekTo=0;
http.listen(5000, function() {
  console.log("Connected to :5000");
});

app.use(express.static(__dirname));
//app.get("/", function(req, res) {
//res.sendfile(__irname + "/index.html");
//}); awaj nhi yete tuza awaj gela tuza

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/register',function(req,res){
res.sendFile(path.join(__dirname + '/register.html'));

});

app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname + '/login.html'));
});

api.get('/classical', (req, res, err) => {
  // generate file path
  const filePath = path.resolve(__dirname, './Music-Library', './track.wav');
  // get file size info
  const stat = fileSystem.statSync(filePath);
  console.log(filePath)
  // set response header info
  res.writeHead(200, {
    'Content-Type': 'audio/mpeg',
    'Content-Length': stat.size
  });
  //create read stream
  const readStream = fileSystem.createReadStream(filePath);
  // attach this stream with response stream
  readStream.pipe(res);
});
//register api calls
app.use('/api/please_call_my_music_player_API', api);

io.sockets.on("connection", function(socket) {
console.log("Client Connected");

socket.on('TrackLoader',function (dummy){
io.emit("Current_Running_Tracks",track_index);
});

socket.on("Seektoupto",function(test){
io.emit("receivetime",seekTo);
});

//complulasary rightommunication code between this function area
socket.on("sync_track_index",function(datareceived){
  track_index=datareceived;
  io.emit("Current_Running_Tracks",track_index);
})
socket.on("updatetimepersecond",function(updatedtime){
   seekTo=updatedtime;
   console.log("seekto",seekTo)
});
});

