/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

require(['jquery', 'underscore', 'oae.core'], function($, _, oae) {

    var geocoder = null;
    var map = null;

    var folderId = 'f:' + $.url().segment(2) + ':' + $.url().segment(3);

    function initialize() {
      geocoder = new google.maps.Geocoder();
      var myLatlng = new google.maps.LatLng(20,20);
      var mapOptions = {
        zoom: 3,
        center: myLatlng
      }
      map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
      loadFolder();
    }

    var loadFolder = function() {
        var url = '/api/folder/' + folderId + '/library';

        $.ajax({
            'url': url,
            'data': {
                'limit': 50
            },
            'success': function(data) {
                mapItem(data.results);
            },
            'error': function(jqXHR, textStatus) {
                console.log('Error whilst retrieving location');
            }
        });
    }

    var mapItem = function(results) {
        if (results.length > 0) {
            var result = results.pop();
            result.extra = {
                'location': _.sample(['Schotland', 'Russia Europe', 'London England', 'Msterh', 'Freiburg Lower Sacksen'])
            }
            if (result.extra && result.extra.location) {
                codeAddress(result.extra.location, result);
            }
            setTimeout(function() {
                mapItem(results);
            }, 100);
        }
    };

    var codeAddress = function(address, result) {
      geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          //map.setCenter(results[0].geometry.location);
          var infowindow = new google.maps.InfoWindow({
            content: oae.api.util.template().render($('#map-template'), {
                'item': result
            }),
            maxWidth: 800
          });

          var marker = new google.maps.Marker({
              map: map,
              position: results[0].geometry.location
          });

          google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map,marker);
          });
        } else {
          console.log('Geocode was not successful for the following reason: ' + status);
        }
      });
    }

    initialize();

});