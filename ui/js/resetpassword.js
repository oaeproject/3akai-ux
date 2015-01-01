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
     * Get Secret: A start point for reseting passord
     */
	var getSecret = function(){
		$(document).on('submit','#resetpassword-input-username', function(event){
			
			// disable redirect to other page
			event.preventDefault();
			
			var username = $.trim($('#resetpassword-username', $(this)).val());
			
	        $.ajax({
	            'url': '/api/auth/local/reset/init/'+username,
	            'type': 'GET',
	            'data': null,
	            'success': function(data) {
	                //callback(null, data);
					oae.api.util.notification('Congratulations!','A Email has been sent to your Email address.');
	            },
	            'error': function(data) {
	                oae.api.util.notification('Sorry!','The Email has not been sent out!');
	            }
	        });
		});
	};
	
    /**
     * ResetPassword: Last Step for reseting passord
     */
	var resetPassword = function(username,secret){
		$(document).on('submit','#resetpassword-input-password', function(event){
			
			// disable redirect to other page
			event.preventDefault();
			
			var password = $.trim($('#resetpassword-new-password', $(this)).val());
			
	        $.ajax({
	            'url': '/api/auth/local/reset/change/' + username + '/' + secret,
	            'type': 'POST',
	            'data': {'newPassword':password},
	            'success': function(data) {
	                //callback(null, data);
					oae.api.util.notification('Congratulations!','Your password has been succesfully changed!');
					
					// wait for 3 seconds and redirect the user to mainpage
					setTimeout(
					  function() 
					  	{
					    	//redirect the user to setting page
							window.location.href = "/me";
							
					  	}, 3000);
	            	},
	            'error': function(data) {
	                oae.api.util.notification('Sorry!','The password has not been changed!');
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
		
		// short url means there is not token
		if(urlLength < 3){
			$('#resetpassword-input-password').remove();
			getSecret();
		
		// long url means there might be token, but the token might be invalid. We leave the security concern to later steps. 
		}else{
			$('#resetpassword-input-username').remove();
			var username = urlArray[2];
			var secret = urlArray[3];
			resetPassword(username,secret); 
		}
	};
	
	displayHTML();
    
});