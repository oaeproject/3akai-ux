/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

// Init google map object with Cambridge location as the center position
var map = new google.maps.Map(document.getElementById("googlemaps_map_canvas"), {
	zoom: 8,
	center: new google.maps.LatLng(52.2025441, 0.1312368),
	mapTypeControlOptions: { style: google.maps.MapTypeControlStyle.DROPDOWN_MENU },
	mapTypeId: google.maps.MapTypeId.ROADMAP,
	navigationControlOptions: { style: google.maps.NavigationControlStyle.ZOOM_PAN }
});

// Init google marker object with Cambridge location as the center position
var marker = new google.maps.Marker({
	position: new google.maps.LatLng(52.2025441, 0.1312368),
	title: 'Point A',
	map: map,
	draggable: false
});

// Init a google maps infor window object to open a info window to show the location info
var infoWindow = new google.maps.InfoWindow({
	content: ""
});

// Init a json object which inlcudes the basic properties of the google map
var json = {
	"maps": [{
		"mapcenter": {
			"lat": map.getCenter().lat(), 
			"lng": map.getCenter().lng()
		}, 
		"mapzoom": map.getZoom(),
		"mapinput": "", 
		"mapsize": "", 
		"maphtml": "Cambridge UK"
	}]
};

/**
 * Update the content in infoWindow
 */
function updateInfoWindow(html) {
	if (infoWindow) {
		infoWindow.close();
	}
	
	json.maps[0].maphtml = html;
	infoWindow = new google.maps.InfoWindow({
		content: "<h4>" + html + "</h4>"
	});
	infoWindow.open(map, marker);
}

/**
 * Find the closest position near the marker's location
 * @param {Object} position of the closest location
 */
function geocodePosition(position) {
	var geocoder = new google.maps.Geocoder();
	if (geocoder) {
		geocoder.geocode({
			latLng: position
		}, function(responses){
			if (responses && responses.length > 0) {
				var html = responses[0].formatted_address;
				updateInfoWindow(html);
			}
			else {
				alert("Cannot determine address at this location.");
			}
		});
	}
}

/**
 * Find the closest position near the marker's location
 * @param {Object} address the position of the closest location
 */
function geocodeAddress(address) {
	var geocoder = new google.maps.Geocoder();
    if (geocoder) {
		geocoder.geocode({
			"address": address
		}, function(results, status){
			if (status == google.maps.GeocoderStatus.OK) {
				var position = results[0].geometry.location;
				map.setCenter(position);
				marker.setMap(map);
				marker.setPosition(position);
				var html = address;
				updateInfoWindow(html);
			}
			else {
				alert("Cannot determine address at this location.");
			}
		});
	}
}

/**
 * Get the json object
 */
var getJSON = function() {
	json.maps[0].mapcenter.lat = map.getCenter().lat();
	json.maps[0].mapcenter.lng = map.getCenter().lng();
	json.maps[0].mapzoom = map.getZoom();
	return json;
};

/**
 * Search the corresponded city between the target location
 * @param {string} keyword the target location
 */
function search(keyword) {	

	geocodeAddress(keyword);
	json.maps[0].mapinput = keyword;
}

/**
 * Set the map initial property (center an zoom)
 * @param {Object} jsonTarget the json object includes map's properties
 */
function setMap(jsonTarget) {
	json = jsonTarget;
	
	var latLng = new google.maps.LatLng(json.maps[0].mapcenter.lat, json.maps[0].mapcenter.lng);
	map.setCenter(latLng);
	map.setZoom(json.maps[0].mapzoom);
	marker.setPosition(latLng);
	
	// Init the infoWindow object and decide to open it or not
	if (json.maps[0].maphtml) {
		updateInfoWindow(json.maps[0].maphtml);
	}
}

/**
 * Init the listeners of marker
 */
function init() {
	
	//alert(new google.maps.LatLng(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude))
	google.maps.event.addListener(marker, "click", function() {
		geocodePosition(marker.getPosition());
	});
}

init();
