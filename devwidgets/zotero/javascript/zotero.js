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

// load the master sakai object to access all Sakai OAE API methods
require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.zotero
     *
     * @class zotero
     *
     * @description
     * Zotero is a dashboard widget that dyplay the content of a Zotero's library
     * 
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.zotero = function (tuid, showSettings) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var DEFAULT_INPUT = '';

        // DOM jQuery Objects
        var $rootel = $("#" + tuid);  // unique container for each widget instance
        var $mainContainer = $("#zotero_main", $rootel);
        var $itemsContainer = $("#zotero_items", $rootel);
        var $collectionsContainer = $("#zotero_collections", $rootel);
        var $settingsContainer = $("#zotero_settings", $rootel);
        var $settingsForm = $("#zotero_settings_form", $rootel);
        var $cancelSettings = $("#zotero_cancel_settings", $rootel);
        var $userID = $("#zotero_user_id", $rootel);
        var $userKey = $("#zotero_user_key", $rootel);


        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Checks if the provided input argument is non-empty and returns the input (user's ID or key)
         * if not empty; if empty, returns the DEFAULT_INPUT
         *
         * @param {String} input The input entered by the user
         */
        var checkInput = function (input) {
            // check if color exists and is not an empty string
            return (input && $.trim(input)) ? $.trim(input) : DEFAULT_INPUT;
        };
        

		 /**
         * Gets the userID and the userKey from the server using an asynchronous request
         *
         * @param {Object} callback Function to call when the request returns. This
         * function will be sent a String with the preferred profile.
         */
        var getPreferredInput = function(callback) {
            // get the data associated with this widget
            sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
                if (success) {
                    // fetching the data succeeded, send it to the callback function
                    callback(checkInput(data.userID), checkInput(data.userKey));
                } else {
                    // fetching the data failed, we use the DEFAULT_COLOR
                    callback(DEFAULT_INPUT, true);
                }
            });
        };
        
        /**
         * Feeds the items' list sending a request to the Zotero's server throught a proxy.
         * Displays the list after building an HTML for the server's response. 
         *
         * @param link The link to get the items for the collections chosen by a user.
         */
        var showItemsList = function(link) {
        	// reset the html for the itemsContainer
			$itemsContainer.html("");
			$itemsContainer.append("<ul>");
			
			// sending the request to the server
			$.ajax({
				type: "GET",
				url: link,
				dataType: "xml",
				complete : function(data, status) {
					// fetching the data contained in the server's response
					var response = data.responseXML;
					// fetching the entry tags because it contains the information to display
					$(response).find('entry').each(function(){
						var title = $(this).find('title').text();
						var content = $(this).find('content').find('div');
						var link;
						var item_key;
						// fetching the link which allows users finding the item on a Zotero's webpage
						$(this).find('link').each(function(){
							// just the tag 'link' with the attribut 'self' is fetched
							if($(this).attr('rel') == 'self'){
								item_key = $(this).attr('href');
								link = item_key + '?format=bib';
								item_key = item_key.split("/");
								item_key = item_key[item_key.length-1];
							}
						});
						
						// removes the default style for the tag 'tr'
						$(content).find('table').find('tr').each(function(){
							$(this).find('th').removeAttr('style');
						});
						
						// adds an items into the list
						$("#zotero_items ul").append("<li id="+item_key+"><a href = "+link+" onclick=\"window.open(this.href); return false;\">"+title+"</a>");
						$("#"+ item_key).append(content);
					});
					
				// adds a class attribut for all items' content to apply css	
				$itemsContainer.find('div').addClass("zotero_content_item");	
				}});
        };
        
        /**
         * Feeds the collection' list sending a request to the Zotero's server throught a proxy.
         * Displays the list after building an HTML for the server's response. 
         *
         * @param userId The user's ID of the Zotero's account.
         */
        var showCollectionsList = function(userId) {
        	// sending the request to the server
			$.ajax({
				type: "GET",
				url: "http://localhost:8080/var/proxy/zotero/collections.json?user="+userId,
				dataType: "xml",
				complete : function(data, status) {
					// fetching the data contained in the server's response
					var response = data.responseXML;
					// fetching the entry tags because it contains the information to display
					$(response).find('entry').each(function(){
						var title = $(this).find('title').text();
						var collectionString = $(this).find('id').text().split("/");
						var collectionKey = collectionString[collectionString.length-1];
						// fetching the link which allows getting the items' list for the chosen collection
						var link = "http://localhost:8080/var/proxy/zotero/collectionContent?user="+userId+"&collection="+collectionKey;
						// adds the collection into the list
						$collectionsContainer.append("<a href=#><li id="+link+">"+title+"</li></a>");
					});
				}});
        };
        
        
        /////////////////////////
        // Main View functions //
        /////////////////////////

        /**
         * Shows the Main view that contains the collection and their content for the
         * provided account.
         *
         * @param {String} userId The user's ID of the Zotero's account.
         * @param {String} userKey The user's key of the Zotero's account.
         */
        var showMainView = function(userId, userKey) {
        	// displays all the content for the current user
          	showItemsList("http://localhost:8080/var/proxy/zotero/items.json?user="+userId);
          	// displays all the collections for the current user
          	showCollectionsList(userId);
          	$mainContainer.show();
        }


        /////////////////////////////
        // Settings View functions //
        /////////////////////////////

        /**
         * Sets the Settings view to the right settings
         *
         * @param {String} userId The user's ID entered by the user
         * @param {String} userKey The user's key entered by the user
         */
        var renderSettings = function(userId, userKey) {
            $userID.val(checkInput(userId));
            $userKey.val(checkInput(userKey));
        };

        ////////////////////
        // Event Handlers //
        ////////////////////
        
		/** Clicks on a collection item */
		$collectionsContainer.on("click", function(ev) {
			// ups to date the itemsContainer
			showItemsList($(ev.target).attr('id'));
			// disables the redirection to the link
			return false;
		});
		
        /** Binds Settings form */
        $settingsForm.on("submit", function (ev) {
            // get the selected color
            var userId = $userID.val();
            var userKey = $userKey.val();

           // save the userID and the userKey
            sakai.api.Widgets.saveWidgetData(tuid, {
                userID: userId,
                userKey: userKey
            },
                function (success, data) {
                    if (success) {
                        // Settings finished, switch to Main view
                        sakai.api.Widgets.Container.informFinish(tuid, "zotero");
                    }
                }
            );
            return false;
        });

        $cancelSettings.on('click', function() {
            sakai.api.Widgets.Container.informFinish(tuid, 'zotero');
        });


        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        /**
         * Initialization function that is run when the widget is loaded. Determines
         * which mode the widget is in (settings or main), loads the necessary data
         * and shows the correct view.
         */
        var doInit = function () {
            if (showSettings) {
                // set up Settings view
                // get the previous settings
                getPreferredInput(renderSettings);
                $settingsContainer.show();
            } else {
                // set up Main view with the settings information
                getPreferredInput(showMainView);
            }
        };

        // run the initialization function when the widget object loads
        doInit();
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("zotero");
});