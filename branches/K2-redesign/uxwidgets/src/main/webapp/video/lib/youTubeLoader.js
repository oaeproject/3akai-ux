/*
Constructs a YouTubeLoader object which uses ExternalInterface to interact with javascript
within the "youTubeLoader.js" file to create an ActionScript 3 Wrapper for the YouTube
chromeless player and API.

@author Matthew Richmond <matthew@choppingblock.com>
@version 1.0
@history 2008-10-07

@Copyright 2008 Matthew Richmond <matthew@choppingblock.com>
* 
* This file is part of Sawdust, a collection of useful frameworks
* managed by the folks at The Chopping Block, Inc.
* 
* Sawdust is free software: you can redistribute it and/or modify
* it under the terms of the GNU Lesser General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
* 
* Sawdust is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Lesser General Public License for more details.
* 
* You should have received a copy of the GNU Lesser General Public License
* along with Sawdust.  If not, see <http://www.gnu.org/licenses/>.
*/

//------------------------------------
// MAIN VARIABLES
//------------------------------------

var SWFID; // Must be set to id of swf or nothing will work.
var obj = new Object;

//------------------------------------
// UTILITY METHODS
//------------------------------------

function checkObj () {
	// alert("youTubeLoader.js : checkObj");
	if (SWFID) {
		createObj();
		return true;
	} else{
		alert("YouTubeLoader: In order to call methods within a swf, you must first set the variable \"SWFID\"!");
		return false;
	}
}

function createObj () {
	// alert("youTubeLoader.js : createObj");
	obj = document.getElementById(SWFID);
}

//------------------------------------
// SPECIAL YOUTUBE EVENT METHODS
//------------------------------------

function onYouTubePlayerReady(playerId) {
	
	if (checkObj()) {	
		obj.addEventListener("onStateChange", "onytplayerStateChange");
	}
	
	// PLEASE NOTE: For the purpose of this demo:
	// This calls a secondary method located in the index.html file allowing the html display to update.
	// You will most likely not need this, it's gross, remove this when you implement this code.
	secondaryOnYouTubePlayerReady(playerId);
}

function onytplayerStateChange(newState) {
   	//alert("Player's new state: " + newState);
	obj.playerStateUpdateHandler(newState);
	
	// PLEASE NOTE: For the purpose of this demo:
	// This calls a secondary method located in the index.html file allowing the html display to update.
	// You will most likely not need this, it's gross, remove this when you implement this code.
	secondaryOnytplayerStateChange(newState)
}

//------------------------------------
// YOUTUBE METHODS
//------------------------------------

function loadVideoById(id, startSeconds) {
	// alert("youTubeLoader.js : loadVideoById");
	if (checkObj()) {
		obj.loadVideoById(id,startSeconds);
	}
}

function cueNewVideo(id, startSeconds) {
	// alert("youTubeLoader.js : loadVideoById");
	if (checkObj()) {
		obj.cueVideoById(id, startSeconds);
	}
}

function clearVideo() {
	// alert("youTubeLoader.js : clearVideo");
	if (checkObj()) {
		obj.clearVideo();
	}
}

function setSize(w, h) {
	// alert("youTubeLoader.js : setSize");
	if (checkObj()) {
		obj.setSize(w, h);
	}
}

function play() {
	// alert("youTubeLoader.js : play");
	if (checkObj()) {
		obj.playVideo();
	}
}

function pause() {
	// alert("youTubeLoader.js : pause");
	if (checkObj()) {
		obj.pauseVideo();
	}
}

function stop() {
	// alert("youTubeLoader.js : stop");
	if (checkObj()) {
		obj.stopVideo();
	}
}

function seekTo(seconds) {
  	// alert("youTubeLoader.js : seekTo");
	if (checkObj()) {
		obj.seekTo(seconds, true);
	}
}

function getPlayerState() {
	// alert("youTubeLoader.js : getPlayerState");
	if (checkObj()) {
		return obj.getPlayerState();
	}
}

function getBytesLoaded() {
  	// alert("youTubeLoader.js : getBytesLoaded");
	if (checkObj()) {
		return obj.getVideoBytesLoaded();
	}
}

function getBytesTotal() {
  	// alert("youTubeLoader.js : getBytesTotal");
	if (checkObj()) {
		return obj.getVideoBytesTotal();
	}
}

function getCurrentTime() {
  	// alert("youTubeLoader.js : getCurrentTime");
	if (checkObj()) {
    	return obj.getCurrentTime();
	}
}

function getDuration() {
  	// alert("youTubeLoader.js : getDuration");
	if (checkObj()) {
		return obj.getDuration();
	}
}

function getStartBytes() {
	// alert("youTubeLoader.js : getStartBytes");
	if (checkObj()) {
		return obj.getVideoStartBytes();
	}
}

function setVolume(newVolume) {
	// alert("youTubeLoader.js : setVolume");
	if (checkObj()) {
		obj.setVolume(newVolume);
	}
}

function getVolume() {
	// alert("youTubeLoader.js : setVolume");
	if (checkObj()) {
		return obj.getVolume();
	}
}

function mute() {
	// alert("youTubeLoader.js : mute");
	if (checkObj()) {
		obj.mute();
	}
}

function unMute() {
	// alert("youTubeLoader.js : unMute");
	if (checkObj()) {
		obj.unMute();
	}
}

function getEmbedCode() {
	// alert("youTubeLoader.js : getEmbedCode");
	if (checkObj()) {
  		return obj.getVideoEmbedCode();
	}
}

function getVideoUrl() {
	// alert("youTubeLoader.js : getVideoUrl");
	if (checkObj()) {
		return obj.getVideoUrl();
	}
}
sdata.widgets.WidgetLoader.informOnLoad("video");