/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */


/*global sdata, Config, $ */

sdata.i18n = sdata.i18n || {};

/*
 * Variable that will contain all of the values for the default bundle 
 */
sdata.i18n.defaultBundle = false;

/*
 * Variable that will contain all of the values for the bundle of the language chosen
 * by the user
 */
sdata.i18n.localBundle = false;


/*
 * This function will be executed once the entire DOM has been loaded. The function will take
 * the HTML that's inside the body of the page, and load the default and user specific language
 * bundle. We then look for i18n keys inside the HTML, and replace with the values from the
 * language bundles. We always first check whether the key is available in the user specific
 * bundle and only if that one doesn't exist, we will take the value out of the default bundle.
 */
$(document).ready(function(){


	/*global doI18N , finishI18N , parsePropertiesFile */
	
	/////////////////////////////
	// CONFIGURATION VARIABLES //
	/////////////////////////////
	
	/*
	 * Definines whether there is a me feed available or not. If not, the system will use a static file
	 * somewhere on disk, to mock up the server behaviour.
	 */
	var isMeFeed = false;
	var sdataMeUrl = Config.URL.ME_SERVICE;
	
	
	////////////////////
	// HELP VARIABLES //
	////////////////////
	
	/*
	 * We take the HTML that is inside the body tag. We will use this to find string we want to
	 * translate into the language chosen by the user
	 */
	var tostring = $(document.body).html();
	
	
	////////////////////////////
	// LANGUAGE BUNDLE LOADER //
	////////////////////////////
	
	/*
	 * This function will load the general language bundle specific to the language chosen by
	 * the user and will store it in a global variable. This language will either be the prefered 
	 * user language or the prefered server language. The language will be available in the me feed 
	 * and we'll use the global sdata.me object to extract it from. If there is no prefered langauge, 
	 * we'll use the default bundle to translate everything.
	 */
	var loadLocalBundle = function(){
		if (sdata.me.locale) {
			$.ajax({
				url: Config.URL.BUNDLE_ROOT + sdata.me.locale.language + "_" + sdata.me.locale.country + ".properties",
				success: function(data){ 
					sdata.i18n.localBundle = parsePropertiesFile(data);
					doI18N(sdata.i18n.localBundle, sdata.i18n.defaultBundle);
				},
				error: function(status){
					// There is no language file for the language chosen by the user. We'll switch to using the
					// default bundle only
					doI18N(null, sdata.i18n.defaultBundle);
				}
			});
		} else {
			// There is no locale set for the current user. We'll switch to using the default bundle only
			doI18N(null, sdata.i18n.defaultBundle);
		}
	};
	
	/*
	 * This will load the default language bundle and will store it in a global variable. This default bundle
	 * will be saved in a file called _bundle/default.properties.
	 */
	var loadDefaultBundle = function(){
		$.ajax({
			url : Config.URL.BUNDLE_ROOT + "default.properties",
			success : function(data) {
				sdata.i18n.defaultBundle = parsePropertiesFile(data);
				loadLocalBundle();
			},
			error : function(status) {
				// There is no default bundle, so we'll just show the interface without doing any translations
				finishI18N();
			}
		});
	};
	
	
	////////////////////
	// ME FEED LOADER //
	////////////////////
	
	/*
	 * If there is no me feed available from the server, we'll switch to using dummy files. 
	 *  - dummyjson/demo_me.json : This is a dummy file for a user that's not logged in. This will always
	 * 	cause you to be redirected to the login page.
	 *  - dummyjson/demo_me_auth.json : This is a dummy file for user called admin that is logged in. This will
	 *  initially cause you to be redirected to the dashboard page
	 * Select the correct one to mimick logged in or logged out behavior
	 */
	if (! isMeFeed) {
		sdataMeUrl = "dummyjson/demo_me.json";
		//sdataMeUrl = "dummyjson/demo_me_auth.json";
	}
	
	/*
	 * This function will load the me feed. This feed should normally contain:
	 *  - locale
	 *    + country: a 2 letter abbreviation of the country chosen by the user (f.e. GB) 
	 *    + displayCountry: full name of the country chosen by the user (f.e. United Kingdom)
	 *    + ISO3Country: official ISO3 Country code chosen by the user (f.e. GBR)
	 *    + language: 
	 *    + displayLanguage:
	 *    + ISO3Language:
	 *    + displayName:
	 *  - preferences
	 *    + uuid:
	 *  - userStoragePrefix:
	 *  - profile: 
	 */
	var loadMe = function(){	
		$.ajax({
			url: sdataMeUrl,
			cache: false,
			success: function(data){
				sdata.me = $.evalJSON(data);
				loadDefaultBundle();
		  	},
		  	error : function(data){
				// There is no me service or the dummy file doesn't exist, so we'll just show the interface without doing any translations
		  		finishI18N();
		  	}
		});
	};
	
	
	////////////////////
	// I18N FUNCTIONS //
	////////////////////
	
	
	var finishI18N = function(){
		$(document.body).show();
		sdata.readyToLoad = true;
		sdata.performLoad();
		sdata.widgets.WidgetLoader.insertWidgets(null);
	};
	
	var doI18N = function(localjson, defaultjson){
		var newstring = sdata.i18n.processhtml(tostring, localjson, defaultjson);
		document.body.innerHTML = newstring;
		finishI18N();
	};
	
	
	///////////////////////
	// UTILITY FUNCTIONS //
	///////////////////////
	
	var parsePropertiesFile = function(data){
		var obj = {};
   		var dataArray =  data.split("\n");	
		for (var loop = 0; loop < dataArray.length ; loop++){
			if(dataArray[loop].charAt(0) !== "#" && dataArray[loop].charAt(0) !== "\r"){
				var optData = dataArray[loop].replace(/\r/g,"");				
				var indexEqual = optData.indexOf("=");
				if (indexEqual !== -1) {
					obj[$.trim(optData.substring(0, indexEqual).replace(/[\r"]/g,""))] = $.trim(optData.substring(indexEqual+1).replace(/[\r"]/g,""));
				}
			}
		}
	 	return obj;
	};
	
	
	/////////////////////////////
	// INITIALIZATION FUNCTION //
	/////////////////////////////
	
	loadMe();

});