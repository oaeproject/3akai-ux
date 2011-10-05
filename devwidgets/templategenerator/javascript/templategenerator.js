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
     * @name sakai.templategenerator
     *
     * @class templategenerator
     *
     * @description
     * WIDGET DESCRIPTION
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.templategenerator = function (tuid, showSettings) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////
        var $rootel = $("#" + tuid);

        // Data Items in the Form
        var $templategeneratorTitle = $('#templategenerator', $rootel);

        // Page Structure Elements
        var $templategeneratorContainer = $('#templategenerator_container', $rootel);
        var $templategeneratorDialog = $('.templategenerator_dialog', $rootel);
        var $templategeneratorForm = $("#templategenerator_form", $rootel);
        var $templategeneratorExportButton = $("#templategenerator_export_button");
        var $templategeneratorTitle = $('#templategenerator_title');
        var $templategeneratorUsedFor = $('#templategenerator_used_for');

		// Template Data Storage
		var templategeneratorData = {};
		
		// Main template structure
		var templategeneratorDataTemplate = {
			id: "",
			title: "",
			img: "",
			fullImg: "",
			perfectFor: "",
			roles: [],
			docs: [],
			structure: [],
			joinRole: "",
			creatorRole: ""
		};

        ////////////////////
        // Event Handlers //
        ////////////////////
        var bindEvents = function() {
			$templategeneratorExportButton.die("click");
			$templategeneratorExportButton.live("click", function() {
				if(templategeneratorData.templatesLoaded){
					// create a new 'empty' template for export
					templategeneratorData.exportData = $.extend({}, templategeneratorDataTemplate)
					
					// 1. Create the heading of the template file
					templategeneratorData.exportData.title = $templategeneratorTitle.val();
					templategeneratorData.exportData.perfectFor = $templategeneratorUsedFor.val();
					templategeneratorData.exportData.id = templategeneratorData.exportData.title.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');
					
					// 2. Roles
					templategeneratorData.exportData.roles = templategeneratorData.roles.roleData;
					templategeneratorData.exportData.joinRole = templategeneratorData.roles.joinRole;
				
					// 3. Pages
					
					
					// output
					console.log(JSON.stringify(templategeneratorData.exportData, null, "\t"));
					
					// i should implement the validation at some point
					/*$templategeneratorForm.validate({
						submitHandler: function(form) {
							
							$worldsettingsForm.submit();
						}
					});*/
				}
			});
        };
        
        /**
         *	Retrieve all the data from the server
         */
        var getTemplateData = function(){
        	templategeneratorData.templateName = sakai_global.group.groupData.name;
        	templategeneratorData.docstructureUrl = "~" + templategeneratorData.templateName + "/docstructure.infinity.json";
 			templategeneratorData.rolesUrl = "/system/userManager/group/" + templategeneratorData.templateName + ".infinity.json";
 			
 			// show the current title in the input field
 			$templategeneratorTitle.val(templategeneratorData.templateName);
 			
 			// create a list of batchRequests
 			var batchRequests = [];
 				batchRequests.push({
							"url": templategeneratorData.docstructureUrl,
			                "method": "GET",
			                "parameters": {}
			            });
				batchRequests.push({
							"url": templategeneratorData.rolesUrl,
			                "method": "GET",
			                "parameters": {}
			            });
 			
 			// process the batchRequests to collect both the docstructure and the roles
        	sakai.api.Server.batch(batchRequests, function(success, data){
            	if(success) {
 					
 					// 1. Docstructure
                	templategeneratorData.docstructure = $.parseJSON(data.results[0].body);
									
 					// retrieve the url for each page in the docstructure
 					templategeneratorData.pageUrls = [];
 					$.each($.parseJSON(templategeneratorData.docstructure.structure0), function(docstructureIndex, docstructureElement){
						templategeneratorData.pageUrls.push({
							"url": "p/" + docstructureElement._pid + ".infinity.json",
			                "method": "GET",
			                "parameters": {}
			            });
	 				});
	 				
	 				// grab the data for each page
	 				sakai.api.Server.batch(templategeneratorData.pageUrls, function(success, data){
		                if (success) {
							templategeneratorData.pageContent = [];
							
							// create a dataObject for each page
							$.each(data.results, function(pageIndex, pageElement){
								var page = {};
									page.pageData = $.parseJSON(pageElement.body);
									page.structure = $.parseJSON(page.pageData.structure0);
									
								templategeneratorData.pageContent.push(page);
							});
		 				}else {
		 					templategeneratorData.templatesLoaded = false;
		 				}
		            });
		 
		 			// 2. Roles
		 			var roleData = $.parseJSON(data.results[1].body);
		 			templategeneratorData.roles = {};
					templategeneratorData.roles.roleData = $.parseJSON(roleData.properties["sakai:roles"]);
					templategeneratorData.roles.joinRole = roleData.properties["sakai:joinRole"];
									
					// extra check to make sure that the pageData is loaded
					templategeneratorData.templatesLoaded = true;
 				}else{
 					templategeneratorData.templatesLoaded = false;
 				}
			});
        };
        

        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        /**
         * Initialization function DOCUMENTATION
         */
        var doInit = function() {
			bindEvents();
            getTemplateData();
            
            // jqModal
            $templategeneratorDialog.jqm({
                modal: true,
                overlay: 20,
                toTop: true
            });
            $templategeneratorDialog.jqmShow();
        };

        // run the initialization function when the widget object loads
        $(window).bind("init.templategenerator.sakai", function(e) {
            doInit();
        });
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("templategenerator");
});
