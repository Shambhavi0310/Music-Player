
 $(document).ready(function () {
 socket.emit("TrackLoader","");
 socket.emit("Seektoupto","");
 socket.on("receivetime", function (receiving_time) {
   console.log("receiving_time",receiving_time)
  curr_track.currentTime=receiving_time;
 });
   socket.on("Current_Running_Tracks", function (receiving_variable) {
    track_index=receiving_variable;
    loadTrack(track_index);
    // playpauseTrack();
    playTrack();
   });
 });
 var socket = io(); // var socket = io('http://192.168.0.100');
let now_playing = document.querySelector(".now-playing");
let track_art = document.querySelector(".track-art");
let track_name = document.querySelector(".track-name");
let track_artist = document.querySelector(".track-artist");

let playpause_btn = document.querySelector(".playpause-track");
let next_btn = document.querySelector(".next-track");
let prev_btn = document.querySelector(".prev-track");

let seek_slider = document.querySelector(".seek_slider");
let volume_slider = document.querySelector(".volume_slider");
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");

let track_index = 1;

let updateTimer;

// Create new audio element
let curr_track = document.createElement('audio');
let isPlaying = curr_track.currentTime > 0 && !curr_track.paused && !curr_track.ended && curr_track.readyState > curr_track.HAVE_CURRENT_DATA;;
curr_track.autoplay = true;
curr_track.load();
// Define the tracks that have to be played
let track_list = [
  {
    name: "Night Owl",
    artist: "Broke For Free",
    image: "https://images.pexels.com/photos/2264753/pexels-photo-2264753.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=250&w=250",
    path: "/api/please_call_my_music_player_API/classical"
     //path: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3"
  },
  {
    name: "Enthusiast",
    artist: "Tours",
    image: "https://images.pexels.com/photos/3100835/pexels-photo-3100835.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=250&w=250",
    path: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3"
  },
  {
    name: "Shipping Lanes",
    artist: "Chad Crouch",
    image: "https://images.pexels.com/photos/1717969/pexels-photo-1717969.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=250&w=250",
    path: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Shipping_Lanes.mp3",
  },
];

function random_bg_color() {

  // Get a number between 64 to 256 (for getting lighter colors)
  let red = Math.floor(Math.random() * 256) + 64;
  let green = Math.floor(Math.random() * 256) + 64;
  let blue = Math.floor(Math.random() * 256) + 64;

  // Construct a color withe the given values
  let bgColor = "rgb(" + red + "," + green + "," + blue + ")";

  // Set the background to that color
  document.body.style.background = bgColor;
}

function loadTrack(track_index) {
  console.log("loadTrack",track_index)
 
  clearInterval(updateTimer);
  resetValues();
  curr_track.src = track_list[track_index].path;
  curr_track.load();

  track_art.style.backgroundImage = "url(" + track_list[track_index].image + ")";
  track_name.textContent = track_list[track_index].name;
  track_artist.textContent = track_list[track_index].artist;
  now_playing.textContent = "PLAYING " + (track_index + 1) + " OF " + track_list.length;
  console.log("now_playing",now_playing);
  updateTimer = setInterval(seekUpdate, 1000);
  console.log("updateTimer",updateTimer);
  curr_track.addEventListener("ended", nextTrack);
  random_bg_color();
}

function resetValues() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}

// Load the first track in the tracklist
 //loadTrack(track_index);

function playpauseTrack() {
  if (!isPlaying) {playTrack();
    console.log("playTrack")}
  else {pauseTrack();
    console.log("pauseTrack")
  }
}

function playTrack() {
  curr_track.play();
  isPlaying = true;
  playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
}

function pauseTrack() {
  curr_track.pause();
  isPlaying = false;
  playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';;
}

function nextTrack() {
  if (track_index < track_list.length - 1)
    track_index += 1;
  else track_index = 0;
  loadTrack(track_index);
  socket.emit("sync_track_index",track_index);
  playTrack();
}

function prevTrack() {
  if (track_index > 0)
    track_index -= 1;
  else track_index = track_list.length;
  loadTrack(track_index);
  socket.emit("sync_track_index",track_index);
  playTrack();
}

function seekTo() {
  let seekto = curr_track.duration * (seek_slider.value / 100);
   curr_track.currentTime = seekto;
  console.log("seektollllllllllllll",seekto)
}

function setVolume() {
  curr_track.volume = volume_slider.value / 100;
}

function seekUpdate() {
   let seekPosition = 0;

  if (!isNaN(curr_track.duration)) {
    // console.log("curr_track.duration",curr_track.duration)
    // curr_track.currentTime=112;
    seekPosition = curr_track.currentTime * (100 / curr_track.duration);
    //  console.log("seekPosition",seekPosition)

    seek_slider.value = seekPosition;
    //  console.log("seek_slider.value",seek_slider.value)
    let currentMinutes = Math.floor(curr_track.currentTime / 60);
    let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
    let durationMinutes = Math.floor(curr_track.duration / 60);
    let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);

    if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
    if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
    if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
    if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

    curr_time.textContent = currentMinutes + ":" + currentSeconds;
    socket.emit("updatetimepersecond",seekPosition);
    console.log("seekposition",seek_slider.value)
    // console.log("curr_time.textContent",curr_time.textContent)
    total_duration.textContent = durationMinutes + ":" + durationSeconds;
    // console.log("total_duration.textContent",total_duration.textContent)
  }
}


