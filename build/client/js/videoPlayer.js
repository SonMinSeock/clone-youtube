"use strict";

var video = document.querySelector("video");
var playBtn = document.getElementById("play");
var playBtnIcon = playBtn.querySelector("i");
var muteBtn = document.getElementById("mute");
var muteBtnIcon = document.querySelector("i");
var volumeRange = document.getElementById("volume");
var currentTime = document.getElementById("currentTime");
var totalTime = document.getElementById("totalTime");
var timeline = document.getElementById("timeline");
var fullScreenBtn = document.getElementById("fullScreen");
var fullScreenIcon = document.querySelector("i");
var videoContainer = document.getElementById("videoContainer");
var videoControls = document.getElementById("videoControls");
var controlsTimeout = null;
var controlsMovementTimeout = null;
var volumeValue = 0.5;
video.volume = volumeValue;
var handlePlayClick = function handlePlayClick(event) {
  // 만약에 비디오 플레이중이면 멈추고 아니면 비디오를 실행하게 하자.
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};
var handlePause = function handlePause() {
  return playBtn.innerText = "Play";
};
var handlePlay = function handlePlay() {
  return playBtn.innerText = "Pause";
};
var handleMute = function handleMute() {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtnIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : volumeValue;
};
var handleVolumeChange = function handleVolumeChange(event) {
  var value = event.target.value;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  volumeValue = value;
  video.volume = value;
};
var formatTime = function formatTime(seconds) {
  return new Date(seconds * 1000).toISOString().substr(14, 5);
};
var handleLoaddedMetadata = function handleLoaddedMetadata() {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};
var handleTimeUpdate = function handleTimeUpdate() {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};
var handleTimelineChange = function handleTimelineChange(event) {
  var value = event.target.value;
  video.currentTime = value;
};
var handleFullscreen = function handleFullscreen() {
  var fullScreen = document.fullscreenElement;
  if (fullScreen) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress";
  }
};
var hideControls = function hideControls() {
  return videoControls.classList.remove("showing");
};
var handleMouseMove = function handleMouseMove() {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};
var handleMouseLeave = function handleMouseLeave() {
  controlsTimeout = setTimeout(hideControls, 3000);
};
var handleEnded = function handleEnded() {
  var id = videoContainer.dataset.id;
  fetch("/api/videos/".concat(id, "/view"), {
    method: "POST"
  });
};
playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("canplay", handleLoaddedMetadata);
handleLoaddedMetadata();
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullscreen);