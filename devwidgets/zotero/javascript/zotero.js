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
        var $showMoreButton = $("#zotero_show_more", $rootel);
        var $showMoreArrow = $("#zotero_show_more_arrow", $rootel);
        var $showLessArrow = $("#zotero_show_less_arrow", $rootel);
		var $selectedCollection;
		var $initURL = "http://localhost:8080/var/proxy/zotero";

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
                    // fetching the data failed, we use the DEFAULT_INPUT
                    callback(DEFAULT_INPUT, true);
                }
            });
        };
        
        
        /**
         * Feeds the items' list sending a request to the Zotero's server throught a proxy.
         * Displays the list after building an HTML for the server's response. 
         *
         * @param {String} itemsURL The url for getting the items for the collections chosen by a user.
         * @param {String} userKey The user's key of the Zotero's account.
         */
        var showItemsList = function(itemsURL, userKey) {
        	// reset the html of the itemsContainer's node
			$itemsContainer.html("");
			// sending the request to the server
			$.ajax({
				type: "POST",
				url: itemsURL,
				dataType: "xml",
				complete : function(data, status) {
					// fetching the data contained in the server's response
					var response = data.responseXML;
					var entries = $(response).find('entry');
					// tests if there are items in the selected collection
					if($(entries).length > 0) {
						$itemsContainer.append("<ul>");
						// fetching the entry tags to display the information it contains
						entries.each(function(){
							var title = $(this).find('title').text();
							var content = $(this).find('content').find('div');
							var link;
							var item_key;
							// fetching the link which allows users finding the item on a Zotero's webpage
							$(this).find('link').each(function(){
								// only the tag 'link' with an attribute 'rel' at 'self' is fetched
								if($(this).attr('rel') == 'self'){
									item_key = $(this).attr('href');
									// builds the href to allowed user to display the item into the browser
									if(userKey == "") {
										link = item_key + "?format=bib";
									}
									else {
										link = item_key + "?key="+userKey+"&format=bib";
									}
									// fetching the item's ID
									item_key = item_key.split("/");
									item_key = item_key[item_key.length-1];
								}
							});
							
							// removes the default style of the table
							$(content).find('table').find('tr').each(function(){
								$(this).find('th').removeAttr('style');
							});
							
							// adds the current item into the list
							var initLi = "<li id=zotero_" + item_key + ">";
							var arrowButton = "<div class=\"zotero_see_more_button\">" + 
													"<button type=\"button\" id=\"zotero_show_more\" class=\"s3d-button s3d-link-button s3d-action\">" +
			        									"<div class=\"zotero_useless\" id=\"zotero_see_more\"><span id=\"zotero_show_more_arrow\"></span></div>" +
			        	 								"<div class=\"zotero_useless\" id=\"zotero_see_less\"><span id=\"zotero_show_less_arrow\" style=\"display: none;\"></span></div>" +
			       									"</button>"+
			       								"</div>";
			       			var itemTitle = "<div class=\"zotero_content_title\">"+
			       								"<a class=\"recentchangedcontent_item_link s3d-widget-links s3d-bold\" href = " + link + " onclick=\"window.open(this.href); return false;\">" + title + "</a>"
			       							"</div>";
													
							$("#zotero_items ul").append(initLi + arrowButton + itemTitle + "</li>");
							
							// add the item's content	
							$("#zotero_"+ item_key).append(content);
						});
						
						// adds a class attribut for all items' content to apply css	
						$itemsContainer.find('div').each(function(){
							if($(this).attr('class') == undefined) {
								$(this).addClass("zotero_content_item");
							}	
						});
							
						// creates event handlers on each item's arrow	
						$itemsContainer.find("#zotero_show_more").each(function(){
							$(this).bind('click',function(event){
								arrowsBinding(event);
			       			});
			       		});
			       	}
			        else {
			        	// inform the user that there is no content into the selected collection
			        	$itemsContainer.append("<center><p class=\"zotero_error_message\">This collection is empty !</p></center>");
			        }
				},
				statusCode: { // displays a message for each kind of error
					400: function() {
     					appendErrorMessage($itemsContainer, "Bad request");
     				},
     				403: function() {
     					appendErrorMessage($itemsContainer, "Forbidden");
     				},
    				404: function() {
    					appendErrorMessage($itemsContainer, "Not found");
     				},
     				405: function() {
     					appendErrorMessage($itemsContainer, "Method not allowed");
     				},
     				417: function() {
     					appendErrorMessage($itemsContainer, "Expectation Failed");
     				},
     				500: function() {
     					appendErrorMessage($itemsContainer, "Internal Server Error");
     				},
     				503: function() {
     					appendErrorMessage($itemsContainer, "Service Unavailable");
     				}
     			}});
        };
        
        
        /**
         * Feeds the collection' list sending a request to the Zotero's server throught a proxy.
         * Displays the list after building an HTML for the server's response. 
         *
         * @param {String} userId The user's ID of the Zotero's account.
         * @param {String} userKey The user's key of the Zotero's account.
         */
        var showCollectionsList = function(userId, userKey) {
        	var urlCollection;
        	var urlItems;
        	 
        	// testing if the user want to display a Zotero library protected by a key or not  
        	if(userKey==""){
        		urlCollection = $initURL + "/collections.json?user="+userId;
        		urlItems = $initURL + "/items.json?user="+userId;
        	}
        	else {
        		urlCollection = $initURL + "/key_collections.json?user="+userId+"&key="+userKey;
        		urlItems = $initURL + "/key_items.json?user="+userId+"&key="+userKey;
        	}
        	
        	// sending the request to the server
			$.ajax({
				type: "POST",
				url: urlCollection,
				dataType: "xml",
				complete : function(data, status) {
					// fetching the data contained in the server's response
					var response = data.responseXML;
					// fetching the entry tags to display the information it contains
					$(response).find('entry').each(function(){
						var title = $(this).find('title').text();
						
						// fetching the id of the current collection
						var collectionString = $(this).find('id').text().split("/");
						var collectionKey = collectionString[collectionString.length-1];
					
						// fetching the link which allows getting the content of the chosen collection
						// testing if the library is protected by a key or not  
						var link;
						if(userKey=="") { 
							link = $initURL + "/collectionContent?user="+userId+"&collection="+collectionKey;
						}
						else {
							link = $initURL + "/key_collectionContent?user="+userId+"&key="+userKey+"&collection="+collectionKey;
						}
						
						// adds the collection into the list
						$collectionsContainer.append("<a class=\"lhnavigation_subnav_item_content\" href=#><li id="+link+">"+title+"</li></a>");							
					});
						
					// Displaying the whole library for the specified account 
					showItemsList(urlItems,userKey);
							
					// creating event handlers on each collection of the list
					$collectionsContainer.bind('click', function(event){
						// ups to date the class attribute for the selected collection
						collectionBinding(event);
						// ups to date the itemsContainer
						showItemsList($(event.target).attr('id'), userKey);
						// disables the redirection to the link
						return false;
					});
				},
				statusCode: {
					400: function() {
     					appendErrorMessage($collectionsContainer, "Bad request");
     				},
     				403: function() {
     					appendErrorMessage($collectionsContainer, "Forbidden");
     				},
    				404: function() {
    					appendErrorMessage($collectionsContainer, "Not found");
     				},
     				405: function() {
     					appendErrorMessage($collectionsContainer, "Method not allowed");
     				},
     				417: function() {
     					appendErrorMessage($collectionsContainer, "Expectation Failed");
     				},
     				500: function() {
     					appendErrorMessage($collectionsContainer, "Internal Server Error");
     				},
     				503: function() {
     					appendErrorMessage($collectionsContainer, "Service Unavailable");
     				}
  				}
  			});
        };
        
        
        /**
         * Displays an message about the error which occurred.
         *
         * @param node The node where the message will be appended.
         * @param {String} error The error which occured.
         */
        var appendErrorMessage = function(node, error) {
        	node.html("");
        	node.append("<center><p class=\"zotero_error_message\">An error occurred : "+ error +" </p></center>");
        };
        
        	
       	/**
         * Ups do date the class of the selected collection for applying a specific css. 
         *
         * @param ev The event handled.
         */
       	var collectionBinding = function(ev) {
       		if($selectedCollection != undefined) {
				$selectedCollection.removeAttr('class');
			}
			// ups to date the itemsContainer
			$selectedCollection = $(ev.target);
			$(ev.target).addClass('is-selected');
       	};
       	
       	
       	/**
         * Ups do date the css properties according to the situation after that 
         * a click event on an item's arrow has been handled. 
         *
         * @param ev The event handled.
         */
        var arrowsBinding = function(ev) {
        	var liNode;
        	var displayMoreArrow = "inline-block";
        	var displayLessArrow = "none";
        	var displayContentItem = "none";
        	
        	if($.browser.mozilla){
        		liNode = $($(ev.target).parent()).parent();
				if($(ev.target).find('#zotero_show_less_arrow').css('display') == 'none'){
					displayMoreArrow = "none";
					displayLessArrow = "inline-block";
					displayContentItem =  "block";
				}
			}
			
			else { 
				liNode= $($($($(ev.target).parent()).parent()).parent()).parent();
				if($(ev.target).attr('id') == 'zotero_show_more_arrow') {
					displayMoreArrow = "none";
					displayLessArrow = "inline-block";
					displayContentItem =  "block";
				}
			}
			
			modifiesDisplayProperty(liNode, "#zotero_show_more_arrow",  displayMoreArrow);
			modifiesDisplayProperty(liNode, "#zotero_show_less_arrow", displayLessArrow);
			modifiesDisplayProperty(liNode, ".zotero_content_item", displayContentItem);
        };
        
        
        /**
         * Modifies the given display property. 
         *
         * @param mainNode The main node which is a parent of the given child node.
         * @param node A child node of the main one on which the css property will be applied.
         * @param value The value of the given css property.
         */
        var modifiesDisplayProperty = function(mainNode, node, value) {
        	$("#"+ $(mainNode).attr('id') + " " + node).css({display: value});
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
          	// displays all the collections for the current user
          	showCollectionsList(userId, userKey);
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