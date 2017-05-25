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

require(['jquery','oae.core'], function($, oae) {

    // Set the page title
    oae.api.util.setBrowserTitle('Reset Password');

    /**
     * ResetPassword: Last Step for reseting password
     */
    var resetPassword = function(username,secret){
  	$(document).on('submit','#resetpassword-input-password', function(event){
  	    
  	    // disable redirect to other page
  	    event.preventDefault();
  	    
  	    var password = $.trim($('#resetpassword-new-password', $(this)).val());
  	    
            $.ajax({
		'url': '/api/auth/local/reset/change/' + username,
		'type': 'POST',
		'data': {'newPassword':password, 'secret':secret},
		'success': function(data) {
                    //callback(null, data);
  		    oae.api.util.notification(oae.api.i18n.translate('__MSG__CONGRATULATIONS__'), oae.api.i18n.translate('__MSG__YOUR_PASSWORD_HAS_BEEN_UPDATED__'));
  		    
          	    // wait for 3 seconds and redirect the user to mainpage
          	    setTimeout(
              		function() {
              		    //redirect the user to setting page
              		    window.location.href = "/";
              		    
              		}, 3000);
                },
		'error': function(data) {
                    oae.api.util.notification(oae.api.i18n.translate('__MSG__SORRY__'), oae.api.i18n.translate('__MSG__COULDNT_UPDATE_PASSWORD__'));
		}
            });
  	});
    };
	
    /**
     * Select a page to display: A start point for reseting passord
     */
    var displayHTML = function(){
	
	// get the path of url
	var urlPath = location.pathname;
	
	// get value of url in a array
	var urlArray = urlPath.split("/");
	
	// get the length of urlArray
	var urlLength = urlArray.length;
	
	var username = urlArray[2];
	var secret = urlArray[3];
	
	resetPassword(username,secret); 
    };
    
    displayHTML();
});
