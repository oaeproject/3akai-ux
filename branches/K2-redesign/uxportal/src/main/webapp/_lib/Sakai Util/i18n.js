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


//////////////////////////////
// Global utility functions //
//////////////////////////////

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
	var isMeFeed = true;
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
	
	/**
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
	
	/**
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
	
	/**
	 * This function will load the me feed. This feed should normally contain:
	 *  - locale
	 *    + country: a 2 letter abbreviation of the country chosen by the user (f.e. GB) 
	 *    + displayCountry: full name of the country chosen by the user (f.e. United Kingdom)
	 *    + ISO3Country: official ISO3 Country code chosen by the user (f.e. GBR)
	 *    + language: a 2 letter abbreviation of the language chosen by the user (f.e. en)
	 *    + displayLanguage: full name of the language chosen by the user (f.e. English)
	 *    + ISO3Language: official ISO3 Language code chosen by the user (f.e. eng)
	 *    + displayName: 
	 *  - preferences
	 *    + uuid:
	 *  - userStoragePrefix:
	 *  - profile: 
	 *  The local bundle we will try to load will be constructed by combining language and 
	 *  country (f.e. en_GB.properties)
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
	
	/**
	 * Once all of the i18n strings have been replaced, we will finish the i18n step.
	 * The content of the body tag is hidden by default (sakai.core.2.css, line 17), in
	 * order not to show the non-translated string before they are translated. When i18n has
	 * finished, we can show the body again. 
	 * We then tell the container that pre-loading of the page has finished and that widgets are
	 * now ready to be loaded. This will mostly mean that now the general page/container code
	 * will be executed.
	 * Finally, we will look for the definition of widgets inside the HTML code, which should look
	 * like this:
	 *  - Single instance: <div id="widget_WIDGETNAME" class="widget_inline"></div>
	 *  - Multiple instance support: <div id="widget_WIDGETNAME_UID_PLACEMENT" class="widget_inline"></div>
	 * and load them into the document
	 */
	var finishI18N = function(){
		$(document.body).show();
		sdata.container.setReadyToLoad(true);
		sdata.widgets.WidgetLoader.insertWidgets(null, false);
	};
	
	/**
	 * This will give the body's HTML string, the local bundle (if present) and the default bundle to the
	 * general i18n function. This will come back with an HTML string where all of the i18n strings will
	 * be replaced. We then change the HTML of the body tag to this new HTML string. 
	 * @param {Object} localjson
	 *  JSON object where the keys are the keys we expect in the HTML and the values are the translated strings
	 * @param {Object} defaultjson
	 *  JSON object where the keys are the keys we expect in the HTML and the values are the translated strings
	 *  in the default language
	 */
	var doI18N = function(localjson, defaultjson){
		var newstring = $.i18n(tostring, localjson, defaultjson);
		// We actually use the old innerHTML function here because the jQuery.html() function will
		// try to reload all of the JavaScript files declared in the HTML, which we don't want as they
		// will already be loaded
		document.body.innerHTML = newstring;
		finishI18N();
	};
	
	
	///////////////////////
	// UTILITY FUNCTIONS //
	///////////////////////
	
	/**
	 * This function will convert a properties file into a JavaScript object where the keys in
	 * the object are the keys from the properties file, and where the values in the object are
	 * the values from the properties file.
	 * @param {Object} data
	 *  The content of a .properties files in the form of:
	 *   KEY_1 = "value 1"
	 *   KEY_2 = "value 2"
	 */
	var parsePropertiesFile = function(data){
		var obj = {};
		// Split on line break characters
   		var dataArray =  data.split("\n");	
		for (var loop = 0; loop < dataArray.length ; loop++){
			// Make sure the line we are currently at isn't commented out
			if(dataArray[loop].charAt(0) !== "#" && dataArray[loop].charAt(0) !== "\r"){
				var optData = dataArray[loop].replace(/\r/g,"");
				// Find the = in this line			
				var indexEqual = optData.indexOf("=");
				if (indexEqual !== -1) {
					// The value before the = sign becomes the key in the object, the value after the = sign becomes the value in the object
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


//////////////////////////////
// Localisation L10N plugin //
//////////////////////////////

/*
 * This plugin will handle localisation in Sakai. It will offer a set of global
 * functions that can be used to localise times, dates and numbers throughout the
 * user interface.
 */

(function($){
	
	$.L10N = {};
	
	/**
	 * Function that will take in a date object and will transform that
	 * date object into a date only string
	 * @param {Date} date
	 *  JavaScript date object that we would like to transform in a 
	 *  date string
	 * @return {String}
	 *  Fomatted date string, following the format as specified in
	 *  Config.L10N.DateFormat
	 */
	$.L10N.transformDate = function(date){
		var sdf = new SimpleDateFormat(Config.L10N.DateFormat);
		return sdf.format(date);
	};
	
	/**
	 * Function that will take in a date object and will transform that
	 * date object into a time only string
	 * @param {Date} date
	 *  JavaScript date object that we would like to transform in a 
	 *  time string
	 * @return {String}
	 *  Fomatted time string, following the format as specified in
	 *  Config.L10N.TimeFormat
	 */
	$.L10N.transformTime = function(date){
		var sdf = new SimpleDateFormat(Config.L10N.TimeFormat);
		return sdf.format(date);
	};
	
	/**
	 * Function that will take in a date object and will transform that
	 * date object into a date and time string
	 * @param {Date} date
	 *  JavaScript date object that we would like to transform in a 
	 *  date and time string
	 * @return {String}
	 *  Fomatted date and time string, following the format as specified in
	 *  Config.L10N.DateTimeFormat
	 */
	$.L10N.transformDateTime = function(date){
		var sdf = new SimpleDateFormat(Config.L10N.DateTimeFormat);
		return sdf.format(date);
	};
	
	/**
	 * Function that will take in a date object and will transform that
	 * date object into a GMT date object. This should always be done before
	 * we try to save a date back to a file or the database. The timezone
	 * we are currently in will be determined from our timezone set in the
	 * personal preferences page
	 * @param {Date} date
	 *  JavaScript date object that we would like to transform in a 
	 *  GMT date object
	 * @return {Date}
	 *  Date object, that will have transformed the given date and time into
	 *  GMT date and time
	 */
	$.L10N.toGMT = function(date){
		date.setHours(date.getHours() - sdata.me.locale.timezone.GMT);
		return date;
	};
	
	/**
	 * Function that will take in a GMT date object and will transform that
	 * date object into a local date object. This should always be done after
	 * we load a date back from a file or the database. The timezone
	 * we are currently in will be determined from our timezone set in the
	 * personal preferences page
	 * @param {Date} date
	 *  JavaScript GMT date object that we would like to transform to a local date object
	 * @return {Date}
	 *  Date object, that will have transformed the given GMT date and time into
	 *  a local date and time
	 */
	$.L10N.fromGMT = function(date){
		date.setHours(date.getHours() + sdata.me.locale.timezone.GMT);
		return date;
	};
	
	/**
	 * Function that will take in a JavaScript Number and will transform it into
	 * a localised number string that complies with decimal points and character used as separator
	 * as specified in the config file
	 * @param {Number} number
	 * Number we want to localise (eg 10000000.442)
	 * @return {String}
	 * Localised string of the number given to this function (eg "10.000.000,442")
	 */
	$.L10N.transformNumber = function(number){
		var string = number.toString();
		var splitted = string.split(".");
		var result = "";
		
		var part1 = splitted[0];
		var start = part1.length % 3;
		result += part1.substring(0, start);
		part1 = part1.substring(start);
		if (part1){
			result += Config.L10N.NumberSeparator;
		}
		while (part1){
			result += part1.substring(0,3);
			part1 = part1.substring(3);
			if (part1){
				result += Config.L10N.NumberSeparator;
			}
		}
		
		if (splitted.length > 1){
			return result + Config.L10N.DecimalPoint + splitted[1];
		} else {
			return result;
		}
	};
	
})(jQuery);


/////////////////////////////
// SimpleDateFormat Plugin //
/////////////////////////////

/**
 * Copyright 2007 Tim Down.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
/**
 * simpledateformat.js
 *
 * A faithful JavaScript implementation of Java's SimpleDateFormat's format
 * method. All pattern layouts present in the Java implementation are
 * implemented here except for z, the text version of the date's time zone.
 *
 * Thanks to Ash Searle (http://hexmen.com/blog/) for his fix to my
 * misinterpretation of pattern letters h and k.
 * 
 * See the official Sun documentation for the Java version:
 * http://java.sun.com/j2se/1.5.0/docs/api/java/text/SimpleDateFormat.html
 *
 * Author: Tim Down <tim@timdown.co.uk>
 * Last modified: 6/2/2007
 * Website: http://www.timdown.co.uk/code/simpledateformat.php
 */
 
/* ------------------------------------------------------------------------- */

var SimpleDateFormat;

(function() {
	function isUndefined(obj) {
		return typeof obj == "undefined";
	}

	var regex = /('[^']*')|(G+|y+|M+|w+|W+|D+|d+|F+|E+|a+|H+|k+|K+|h+|m+|s+|S+|Z+)|([a-zA-Z]+)|([^a-zA-Z']+)/;
	var monthNames = ["January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"];
	var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var TEXT2 = 0, TEXT3 = 1, NUMBER = 2, YEAR = 3, MONTH = 4, TIMEZONE = 5;
	var types = {
		G : TEXT2,
		y : YEAR,
		M : MONTH,
		w : NUMBER,
		W : NUMBER,
		D : NUMBER,
		d : NUMBER,
		F : NUMBER,
		E : TEXT3,
		a : TEXT2,
		H : NUMBER,
		k : NUMBER,
		K : NUMBER,
		h : NUMBER,
		m : NUMBER,
		s : NUMBER,
		S : NUMBER,
		Z : TIMEZONE
	};
	var ONE_DAY = 24 * 60 * 60 * 1000;
	var ONE_WEEK = 7 * ONE_DAY;
	var DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK = 1;
	
	var i18nMonthsAndDays = function(){
		monthNames = [$.i18n.getValueForKey("JANUARY"), $.i18n.getValueForKey("FEBRUARY"), $.i18n.getValueForKey("MARCH"), 
		$.i18n.getValueForKey("APRIL"), $.i18n.getValueForKey("MAY"), $.i18n.getValueForKey("JUNE"),
		$.i18n.getValueForKey("JULY"), $.i18n.getValueForKey("AUGUST"), $.i18n.getValueForKey("SEPTEMBER"), 
		$.i18n.getValueForKey("OCTOBER"), $.i18n.getValueForKey("NOVEMBER"), $.i18n.getValueForKey("DECEMBER")];
		dayNames = [$.i18n.getValueForKey("SUNDAY"), $.i18n.getValueForKey("MONDAY"), $.i18n.getValueForKey("TUESDAY"), 
		$.i18n.getValueForKey("WEDNESDAY"), $.i18n.getValueForKey("THURSDAY"), $.i18n.getValueForKey("FRIDAY"), 
		$.i18n.getValueForKey("SATURDAY")];
	};

	var newDateAtMidnight = function(year, month, day) {
		var d = new Date(year, month, day, 0, 0, 0);
		d.setMilliseconds(0);
		return d;
	};

	Date.prototype.getDifference = function(date) {
		return this.getTime() - date.getTime();
	};

	Date.prototype.isBefore = function(d) {
		return this.getTime() < d.getTime();
	};

	Date.prototype.getUTCTime = function() {
		return Date.UTC(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(),
				this.getSeconds(), this.getMilliseconds());
	};

	Date.prototype.getTimeSince = function(d) {
		return this.getUTCTime() - d.getUTCTime();
	};

	Date.prototype.getPreviousSunday = function() {
		// Using midday avoids any possibility of DST messing things up
		var midday = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 12, 0, 0);
		var previousSunday = new Date(midday.getTime() - this.getDay() * ONE_DAY);
		return newDateAtMidnight(previousSunday.getFullYear(), previousSunday.getMonth(),
				previousSunday.getDate());
	};

	Date.prototype.getWeekInYear = function(minimalDaysInFirstWeek) {
		if (isUndefined(this.minimalDaysInFirstWeek)) {
			minimalDaysInFirstWeek = DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK;
		}
		var previousSunday = this.getPreviousSunday();
		var startOfYear = newDateAtMidnight(this.getFullYear(), 0, 1);
		var numberOfSundays = previousSunday.isBefore(startOfYear) ?
			0 : 1 + Math.floor(previousSunday.getTimeSince(startOfYear) / ONE_WEEK);
		var numberOfDaysInFirstWeek =  7 - startOfYear.getDay();
		var weekInYear = numberOfSundays;
		if (numberOfDaysInFirstWeek < minimalDaysInFirstWeek) {
			weekInYear--;
		}
		return weekInYear;
	};

	Date.prototype.getWeekInMonth = function(minimalDaysInFirstWeek) {
		if (isUndefined(this.minimalDaysInFirstWeek)) {
			minimalDaysInFirstWeek = DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK;
		}
		var previousSunday = this.getPreviousSunday();
		var startOfMonth = newDateAtMidnight(this.getFullYear(), this.getMonth(), 1);
		var numberOfSundays = previousSunday.isBefore(startOfMonth) ?
			0 : 1 + Math.floor((previousSunday.getTimeSince(startOfMonth)) / ONE_WEEK);
		var numberOfDaysInFirstWeek =  7 - startOfMonth.getDay();
		var weekInMonth = numberOfSundays;
		if (numberOfDaysInFirstWeek >= minimalDaysInFirstWeek) {
			weekInMonth++;
		}
		return weekInMonth;
	};

	Date.prototype.getDayInYear = function() {
		var startOfYear = newDateAtMidnight(this.getFullYear(), 0, 1);
		return 1 + Math.floor(this.getTimeSince(startOfYear) / ONE_DAY);
	};

	/* ----------------------------------------------------------------- */

	SimpleDateFormat = function(formatString) {
		i18nMonthsAndDays();
		this.formatString = formatString;
	};

	/**
	 * Sets the minimum number of days in a week in order for that week to
	 * be considered as belonging to a particular month or year
	 */
	SimpleDateFormat.prototype.setMinimalDaysInFirstWeek = function(days) {
		this.minimalDaysInFirstWeek = days;
	};

	SimpleDateFormat.prototype.getMinimalDaysInFirstWeek = function(days) {
		return isUndefined(this.minimalDaysInFirstWeek)	?
			DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK : this.minimalDaysInFirstWeek;
	};

	SimpleDateFormat.prototype.format = function(date) {
		var formattedString = "";
		var result;

		var padWithZeroes = function(str, len) {
			while (str.length < len) {
				str = "0" + str;
			}
			return str;
		};

		var formatText = function(data, numberOfLetters, minLength) {
			return (numberOfLetters >= 4) ? data : data.substr(0, Math.max(minLength, numberOfLetters));
		};

		var formatNumber = function(data, numberOfLetters) {
			var dataString = "" + data;
			// Pad with 0s as necessary
			return padWithZeroes(dataString, numberOfLetters);
		};

		var searchString = this.formatString;
		while ((result = regex.exec(searchString))) {
			var matchedString = result[0];
			var quotedString = result[1];
			var patternLetters = result[2];
			var otherLetters = result[3];
			var otherCharacters = result[4];

			// If the pattern matched is quoted string, output the text between the quotes
			if (quotedString) {
				if (quotedString == "''") {
					formattedString += "'";
				} else {
					formattedString += quotedString.substring(1, quotedString.length - 1);
				}
			} else if (otherLetters) {
				// Swallow non-pattern letters by doing nothing here
			} else if (otherCharacters) {
				// Simply output other characters
				formattedString += otherCharacters;
			} else if (patternLetters) {
				// Replace pattern letters
				var patternLetter = patternLetters.charAt(0);
				var numberOfLetters = patternLetters.length;
				var rawData = "";
				switch (patternLetter) {
					case "G":
						rawData = "AD";
						break;
					case "y":
						rawData = date.getFullYear();
						break;
					case "M":
						rawData = date.getMonth();
						break;
					case "w":
						rawData = date.getWeekInYear(this.getMinimalDaysInFirstWeek());
						break;
					case "W":
						rawData = date.getWeekInMonth(this.getMinimalDaysInFirstWeek());
						break;
					case "D":
						rawData = date.getDayInYear();
						break;
					case "d":
						rawData = date.getDate();
						break;
					case "F":
						rawData = 1 + Math.floor((date.getDate() - 1) / 7);
						break;
					case "E":
						rawData = dayNames[date.getDay()];
						break;
					case "a":
						rawData = (date.getHours() >= 12) ? "PM" : "AM";
						break;
					case "H":
						rawData = date.getHours();
						break;
					case "k":
						rawData = date.getHours() || 24;
						break;
					case "K":
						rawData = date.getHours() % 12;
						break;
					case "h":
						rawData = (date.getHours() % 12) || 12;
						break;
					case "m":
						rawData = date.getMinutes();
						break;
					case "s":
						rawData = date.getSeconds();
						break;
					case "S":
						rawData = date.getMilliseconds();
						break;
					case "Z":
						rawData = date.getTimezoneOffset(); // This is returns the number of minutes since GMT was this time.
						break;
				}
				// Format the raw data depending on the type
				switch (types[patternLetter]) {
					case TEXT2:
						formattedString += formatText(rawData, numberOfLetters, 2);
						break;
					case TEXT3:
						formattedString += formatText(rawData, numberOfLetters, 3);
						break;
					case NUMBER:
						formattedString += formatNumber(rawData, numberOfLetters);
						break;
					case YEAR:
						if (numberOfLetters <= 3) {
							// Output a 2-digit year
							var dataString = "" + rawData;
							formattedString += dataString.substr(2, 2);
						} else {
							formattedString += formatNumber(rawData, numberOfLetters);
						}
						break;
					case MONTH:
						if (numberOfLetters >= 3) {
							formattedString += formatText(monthNames[rawData], numberOfLetters, numberOfLetters);
						} else {
							// NB. Months returned by getMonth are zero-based
							formattedString += formatNumber(rawData + 1, numberOfLetters);
						}
						break;
					case TIMEZONE:
						var isPositive = (rawData > 0);
						// The following line looks like a mistake but isn't
						// because of the way getTimezoneOffset measures.
						var prefix = isPositive ? "-" : "+";
						var absData = Math.abs(rawData);

						// Hours
						var hours = "" + Math.floor(absData / 60);
						hours = padWithZeroes(hours, 2);
						// Minutes
						var minutes = "" + (absData % 60);
						minutes = padWithZeroes(minutes, 2);

						formattedString += prefix + hours + minutes;
						break;
				}
			}
			searchString = searchString.substr(result.index + result[0].length);
		}
		return formattedString;
	};
})();