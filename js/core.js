$("#coor_k").val(Math.random() + 12);
$("#coor_B").val(Math.random() + 107);
var mapOptions = {
    center: new google.maps.LatLng(18.46909509, 73.78848078),
    zoom: 3
};
var map = new google.maps.Map(document.getElementById("map"), mapOptions);
var panorama = map.getStreetView();
var directionsService = new google.maps.DirectionsService();
var directionsDisplay = new google.maps.DirectionsRenderer();
var socket = io();
var coordinate = '';
var socket_id = '';
var global_id = '';
var cardid = 'id-';
var time = '';
var allFlightPath = [];
var allMarkerStress = [];
var streetLineStatus = 0;
var markers = [];
var myid = [];
var position_from = [],
    infowindow = [];
serverUserTime = 0;
createGroup = 0;
room_id = '';
var remotemonitoring = "Remote monitoring";
var xyz = "http://114.143.216.178:5426/Remote_monitoring.html"; //Remote_monitoring
var contentString = '<div id="content">' +
    '<div id="siteNotice">' +
    '</div>' +
    //'<h1 id="firstHeading" class="firstHeading">Device Info</h1>' +
    '<div id="bodyContent" style="overflow:hidden;">' +
    '<TABLE BORDERCOLOR="#4499DD" BORDER="1" WIDTH="100%" style="  border-collapse: collapse;" >' +
    '<TR ALIGN="CENTER">' +
    '<TD>Latitude</TD>' +
    '<TD>18.54545</TD>' +
    '<TDLongitude</TD>' +
    '<TD>73.5454</TD>' +
    '<TD>Number</TD>' +
    '<TD>1</TD>' +
    '<TD COLSPAN="4"> </TD>' +

    '</TR>' +
    '<TR ALIGN="CENTER">' +
    '<TD><BR>POSITION' +
    '</TD>' +
    '<TD COLSPAN="8"><BR>MAHARASHRTA,INDIA' +
    '</TD>' +
    '</TR>' +
    '<TR bgcolor="#4499DD">' +
    '<TH><font color="white">Clients Name</TH>' + //font color #2FBF0F
    '<TH><font color="white">GPRS NAME</TH>' +
    '<TH><font color="white">GPRS Encoding</TH>' +
    '<TH><font color="white">Contr No.</TH>' +
    '<TH><font color="white">Last Time</TH>' +
    '<TH><font color="white">Locate</TH>' +
    '<TH><font color="white">Signal</TH>' +
    '<TH COLSPAN="2"><font color="white">Link</TH>' +
    '</TR>' +
    '<TR ALIGN="CENTER">' +
    '<TD><font color="#2FBF0F">Orbittal Panels</TD>' +
    '<TD><font color="#2FBF0F">O1</TD>' +
    '<TD><font color="#2FBF0F">' + cardid + '</TD>' +
    '<TD><font color="#2FBF0F">id101</TD>' +
    '<TD><font color="#2FBF0F">2017-07-22<br>15:43:02</TD>' +
    '<TD><font color="#2FBF0F">LBS</TD>' +
    '<TD><font color="#2FBF0F">63.3%</TD>' +
    '<TD><font color="#2FBF0F"><img src="http://114.143.216.178:5426/images/4.png" onclick="addTab(remotemonitoring,xyz)"></img></TD>' +
    '<TD><img src="http://114.143.216.178:5426/images/1.ico" onclick="addTab(remotemonitoring,xyz)"></img></TD>' +
    '</TR>' +
    '</TABLE>' +

    '</div>' +
    '</div>';

socket.on('updateHeader', function(data) {

    console.log('updateHeader called just now1!');
    var declare = String(data);
    var id1 = declare.substring(1, 6);
    global_id = id1;
});
//Get users who are logged in first
function getServerUser() {
    console.log('here is the getserver');
    socket.on("server_user", function(server_user) {

        console.log('server_user.length', server_user.length);
        if (serverUserTime == 0) {
            //  console.log('data_user1=', server_user);
            for (var i = 0; i < server_user.length; i++) {
                data_user = server_user[i];
                data_user.id = global_id;
                // console.log('data_user2=', data_user);
                // console.log('server_user=', server_user[i].sex);
                if (i >= 1) {
                    makeMarkerUser(data_user, server_user[i].id);
                }
            }
            serverUserTime = 1;
        }
    });
}
socket.on("markeroff", function(markerID, server_user) {
    markerofff(markerID, server_user);
});
socket.on("chgstat", function(markerID) {
    markers[markerID].setIcon("http://114.143.216.178:5426/on.png");
});
socket.on("chgcoord", function(markerID, laT, log) {
    var lat = markers[markerID].getPosition().lat();
    var lng = markers[markerID].getPosition().lng();
    console.log("latup=", lat);
    console.log("lngup=", lng);
    var Lat = parseFloat(laT);
    var Log = parseFloat(log);
    if (lat != Lat) {
        console.log('new coordinates');
        var myNewlatlng = new google.maps.LatLng(Lat, Log);
        markers[markerID].setPosition(myNewlatlng);
    }
});

function markerofff(markerID, server_user) {
    if (markers[markerID]) {
        console.log('server_user34=', server_user);
        for (i = 0; i < server_user.length; i++) {
            // console.log('server_user34=', server_user);
            // console.log('server_user14=', server_user[i].name);
            // console.log('markers[markerID]23=', markers[markerID]);
            if (markers[markerID].id == server_user[i].name) {
                server_user[i].sex = "female";
                socket.emit('changestatus', server_user[i].sex);
                // console.log('server_usersss=', server_user);
                markers[markerID].setIcon("http://114.143.216.178:5426/off.png");
                markers[markerID].icon = "http://114.143.216.178:5426/off.png";
                socket.emit('updatestat', server_user[i].name, server_user[i].sex);
            }
        }
    }
}
//delete marker 
function removeM(markerID) {
    //socket.on("markers", function(markers) {
    if (markers[markerID]) {
        markers[markerID].setMap(null);
        delete markers[markerID];
    }
    //});
}
//Make a marker 
function makeMarkerUser(data_user, id) {
    //socket.on("markers", function(markers) {
    //update
    var markerID = data_user.name;
    cardid = "id-";
    // console.log('markers[markerID]', markers[markerID]);
    if (markers[markerID]) {
        var latlng = new google.maps.LatLng(data_user.coordinate[0], data_user.coordinate[1]);
        markers[markerID].setPosition(latlng);
        if (data_user.sex == "male") {
            var icon_user = "http://114.143.216.178:5426/on.png";
        } else {
            var icon_user = "http://114.143.216.178:5426/off.png";
        }
        markers[markerID].setIcon(icon_user);
        // console.log('markers123', markers[markerID]);
        console.log('Updating Position..');
        myid[markerID] = markers[markerID];
        console.log('myglobalid=', myid[markerID].id);

    } else {
        //label
        var labelText = data_user.name;

        var myOptions3 = {
            content: labelText,
            boxStyle: {
                marginLeft: "30px",
                marginTop: "-42px",
                backgroundColor: "#CCFF99",
                border: "1px solid #3C9FC8",
                textAlign: "center",
                fontSize: "8pt",
                width: "50px"
            },
            disableAutoPan: true,
            pixelOffset: new google.maps.Size(-25, 0),
            position: new google.maps.LatLng(data_user.coordinate[0], data_user.coordinate[1]),
            closeBoxURL: "",
            isHidden: false,
            pane: "mapPane",
            enableEventPropagation: true
        };

        var ibLabel = new InfoBox(myOptions3);
        ibLabel.open(map);
        //end label
        console.log('creating new ID....');
        if (data_user.sex == "male") {
            var icon_user = "http://114.143.216.178:5426/on.png";
        } else {
            var icon_user = "http://114.143.216.178:5426/off.png";
        }
        // console.log('markers1234', markers[markerID]);
        markers[markerID] = new google.maps.Marker({
            position: new google.maps.LatLng(data_user.coordinate[0], data_user.coordinate[1]),
            icon: icon_user
        });
        markers[markerID].setMap(map);
        // markers[markerID].setIcon("http://114.143.216.178:5426/off.png");
        //  markers[id].id = data_user.id; orignal
        markers[markerID].id = data_user.name;
        //  console.log('data_user NAME', data_user.name);
        //console.log('marker ID', markers[markerID].id);

        /*infowindow[id] = new google.maps.InfoWindow();
        infowindow[id].setContent("<b>" + data_user.name + "</b>");
        infowindow[id].open(map, markers[markerID]);*/
        myid[markerID] = markers[markerID];
        // console.log('myglobalid=', myid[markerID]);

        markers[markerID].addListener('click', function() {
            //console.log('open');
            // myid[markerID] = markers[markerID];
            // console.log('mygolbalid=', myid[markerID]);
            infowindow[id] = new google.maps.InfoWindow({
                content: contentString
            });
            infowindow[id].open(map, markers[markerID]);
            socket.emit('myid', markers[markerID].id);

        });
        google.maps.event.addListener(markers[markerID], 'dblclick', function(marker, id) {

        });
    }
    //});
}

$(function() {


    getServerUser();
    socket.on("user_connection", function(id) {
        //Logging in to the system will get 1 ID from the server side
        if (socket_id == '') {
            socket_id = id;
            console.log('initialize_id_user_connection=', socket_id);
            //Work on obtaining ID
        }
    });


    // Get users information first
    // Create user
    socket.on("create_user", function(create_user) {
        create_user.id = create_user.name;
        // console.log('createuser id', create_user.id);
        console.log('createusername', create_user.name);
        makeMarkerUser(create_user, create_user.id);
    });
    //User exits 
    socket.on("user_disconnect", function(id) {
            //   markers[$.trim(id)].setMap(null);
            //   markers[$.trim(id)] = undefined;
            //   console.log('markers[$.trim(id)].setMap(null)', markers[$.trim(id)].setMap(null));
        })
        // Handle sent chat messages


    google.maps.event.addListener(map, 'dblclick', function(event) {
        if (room_id != '') {
            socket.emit("event_room", room_id, "travel", [event.latLng.lat(), event.latLng.lng()]);
        } else {
            position_from = [coordinate];
            position_to = [event.latLng.lat(), event.latLng.lng()];
            travel(position_from, position_to);
        }
    });
    google.maps.event.addListener(map, 'bounds_changed', function() {
        if (room_id != '') {
            var mapview = {};
            center = {
                "lat": map.center.k,
                "lng": map.center.B
            }
            mapview.zoom = map.zoom;
            mapview.center = center;
            socket.emit("event_room", room_id, "bounds", mapview);
        }
    });
    google.maps.event.addListener(panorama, 'visible_changed', function() {
        streetview = {};
        if (panorama.getVisible()) {
            streetview.show = 1;
            streetview.getPano = panorama.getPano();
            streetview.getPov = panorama.getPov();
            streetview.getPosition = panorama.getPosition();
            streetview.getZoom = panorama.getZoom();
        } else {
            streetview.show = 0;
        }
        socket.emit("event_room", room_id, "streetview", streetview);
    });

    function streetview_changed(panorama) {
        streetview = {};
        streetview.show = 1;
        streetview.getPano = panorama.getPano();
        streetview.getPov = panorama.getPov();
        streetview.getPosition = panorama.getPosition();
        streetview.getZoom = panorama.getZoom();
        socket.emit("event_room", room_id, "streetview", streetview);
    }
    google.maps.event.addListener(panorama, 'position_changed', function() {
        streetview_changed(panorama);
    });
    google.maps.event.addListener(panorama, 'pov_changed', function() {
        streetview_changed(panorama);
    });
    google.maps.event.addListener(panorama, 'zoom_changed', function() {
        streetview_changed(panorama);
    })




});

function travel(from, to) {
    for (var i = 0; i < Math.max(allFlightPath.length, allMarkerStress.length); i++) {
        if (typeof(allFlightPath[i]) !== undefined) {
            allFlightPath[i].setMap(null);
        }
        if (typeof(allMarkerStress[i]) !== undefined) {
            allMarkerStress[i].setMap(null);
        }
    }
    allFlightPath = [];
    allMarkerStress = [];
    for (var i = 0; i < from.length; i++) {
        var request = {
            origin: new google.maps.LatLng(from[i][0], from[i][1]),
            destination: new google.maps.LatLng(to[0], to[1]), //lat, lng
            travelMode: google.maps.TravelMode["WALKING"]
        };
        directionsService.route(request, function(response, status) {
            var flightPath = '',
                marker_stress = '';
            if (status == google.maps.DirectionsStatus.OK) {
                data = response.routes[0].overview_path;
                color = "#ff0000";
                opacity = 1;

                flightPath = new google.maps.Polyline({
                    path: data,
                    geodesic: true,
                    strokeColor: color,
                    strokeOpacity: opacity,
                    strokeWeight: 2,
                    map: map
                });
                flightPath.setMap(map);
                marker_stress = new google.maps.Marker({
                    position: new google.maps.LatLng(data[data.length - 1].k, data[data.length - 1].B),
                    icon: "http://icons.iconarchive.com/icons/fatcow/farm-fresh/32/hand-point-270-icon.png"
                });
                marker_stress.setMap(map);
                allFlightPath.push(flightPath);
                allMarkerStress.push(marker_stress);
            }
        });
    }
}