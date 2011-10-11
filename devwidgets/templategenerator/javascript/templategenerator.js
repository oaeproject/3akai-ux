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
        var $templategeneratorExport = $('#templategenerator_export');
        
        var $templategeneratorSuccesful = $("#templategenerator_form_successful");
		var $templategeneratorError = $("#templategenerator_form_error");

		// Defines the width of the exported content (in characters)
		var exportWidth = 80;
		
		// Template Data Storage
		var templategeneratorData = {
			roles: {},
			docstructure: {},
			pages: [],
			output: "",
			generatingTemplate: false
		};
		
		// Main template structure
		var templategeneratorDataTemplate = {
			id: "",
			title: "",
			img: "",
			fullImg: "",
			perfectFor: "",
			roles: [],
			docs:{},
			structure: [],
			joinRole: "",
			creatorRole: ""
		};
		
		// The userID of the person that should add the generated templates to the config files
		var templategeneratorTargetUser = "admin";
		var templategeneratorMessageSubject = "";
		

        ////////////////////
        // Event Handlers //
        ////////////////////
        
        /**
         * Fired when sending a message
         */
        var handleSentMessage = function(success){
            if(success){
				sakai.api.Util.notification.show("", $templategeneratorSuccesful.text() , sakai.api.Util.notification.type.INFORMATION);
				templategeneratorData.generatingTemplate = false;
            } else {
				sakai.api.Util.notification.show("", $templategeneratorError.text() , sakai.api.Util.notification.type.INFORMATION);
            }
        };
        
        /**
         * Bind the event handlers
         */
        var bindEvents = function() {
        	// bind validation to the form
			$templategeneratorForm.validate({
				submitHandler: function(form, validator){
					generateTemplateFromData();
				}
			});
        };
        
        /**
         * Generates the actual string for the configuration file
         */
        var generateTemplateFromData = function(){
        	
        	// The actual template creation
			if(templategeneratorData.templatesLoaded && !templategeneratorData.generatingTemplate){
			
				// create a new 'empty' template for export
				//templategeneratorData.generatingTemplate = true;
				templategeneratorData.exportData = $.extend({}, templategeneratorDataTemplate);
				
				// 1. Heading
				templategeneratorData.exportData.title = $templategeneratorTitle.val();
				templategeneratorData.exportData.perfectFor = $templategeneratorUsedFor.val();
				templategeneratorData.exportData.id = templategeneratorData.exportData.title.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');
				
				// 2. Roles
				templategeneratorData.exportData.roles = templategeneratorData.roles.roleData;
				templategeneratorData.exportData.joinRole = templategeneratorData.roles.joinRole;
				templategeneratorData.exportData.creatorRole = templategeneratorData.roles.creatorRole;
			
				console.log(templategeneratorData);
			
				// 3. Docs (the actual pages)
				var pageId, refId;
					pageId = refId = 0;
				
				// this is the main loop to create the structure for the pages
				$.each(templategeneratorData.docstructure.structure, function(docstructureIndex, docstructureElement){
						
					// creates a unique page id
					var pid = '${pid}' + pageId;
					docstructureElement._pid = pid;
					
					// creates the general page structure
					var page = {};
						page[pid] = {};
						page[pid].structure0 = $.extend(true, {}, templategeneratorData.pages.structures[pageId]);					
				
					// create the individual pages and add all the content
					$.each(page[pid].structure0, function(pageIndex, pageElement){
						
						// store the old reference so we use its id to trace the data
						var oldRef = pageElement._ref;
					
						// create the actual page structure
						var newRef = '${refid}' + refId;
						pageElement._ref = newRef;
						pageElement.main._ref = newRef;
						
						// create a new unique reference for each page
						page[pid][newRef] = {};
						
						// find widgets within the page data
						var myPageContent = $(templategeneratorData.pages[pageId].pageData[oldRef].page);
						$templategeneratorExport.append(myPageContent);
						
						var widgetElements = $templategeneratorExport.find(".widget_inline");
						$(widgetElements).each(function(widgetIndex, widgetElement){
							refId++;
							
							// create a unique reference for each widget
							var widgetRef = '${refid}' + refId;
							
							// store the old widget and add the new reference
							var oldWidgetReference = $(widgetElement).attr('id');
							
							// create a reference for the widget
							page[pid][widgetRef] = {};
							
							// get the content
							oldWidgetReference = oldWidgetReference.split('_');		
							
							// replace the reference in the page content				
							$(widgetElements[widgetIndex]).attr('id', 'widget_' + oldWidgetReference[1] + '_' + widgetRef);
							
							// create a new object matching the widgets name
							page[pid][widgetRef][oldWidgetReference[1]] = {};
							
							// store the data (just for simplicity)
							var oldWidgetData = templategeneratorData.pages[pageId].pageData[oldWidgetReference[(oldWidgetReference.length)-1]][oldWidgetReference[1]];
							var newWidgetData = page[pid][widgetRef][oldWidgetReference[1]];
							
							// check for valid properties and add them to our widget
							$.each(oldWidgetData, function(widgetPropertyKey, widgetPropertyElement){
								var firstCharacter = widgetPropertyKey.charAt(0);
								if(firstCharacter === '_'){
									// system properties
								}else{
									// the actual data keys
									newWidgetData[widgetPropertyKey] = widgetPropertyElement;
								}
							});
						});
						
						// insert the generated structure into the page
						$templategeneratorExport.append(myPageContent);
						var generatedHTML = $templategeneratorExport.html();
							generatedHTML = $.trim(generatedHTML);
							generatedHTML = generatedHTML.replace(/"/g, '\'');
							
						$templategeneratorExport.empty();
						
						page[pid][newRef].page = generatedHTML;
						refId++;
					});

					pageId++;
					$.extend(templategeneratorData.exportData.docs, page);
				});
				
				// 4. Structure
				var structure = $.extend(true, {},  templategeneratorData.docstructure.structure);
				$.each(structure, function(structureIndex, structureElement){
					structureElement['_docref'] = structureElement._pid;
					delete structureElement._pid;
				});
				templategeneratorData.exportData.structure = structure;
		
				// Stringify (this creates the actual string and manipulates the escaping)
				templategeneratorData.output = JSON.stringify(templategeneratorData.exportData, null, "\t");
				templategeneratorData.output = templategeneratorData.output.replace(/\\/g, '');
				
				createTemplateFile();
			}
        }
        
        /**
         * Creates a template file on the fileSystem
         */
        var createTemplateFile = function(){
        	
        	// upload our template file to the server
			var body = "--AAAAA\r\n"
			body = body + "Content-Disposition: form-data; name=\"*\"; filename=\"" + templategeneratorData.exportData.id + ".txt\" \r\n";
			body = body + "Content-Type: text/plain \r\n";
			body = body + "Content-Transfer-Encoding: binary\r\n\r\n";
			body = body + templategeneratorData.output + "\r\n";
			body = body + "--AAAAA--\r\n";

			$.ajax({
				url: "/system/pool/createfile",
				data: body,
				type: "POST",
				beforeSend : function(xmlReq){
					xmlReq.setRequestHeader("Content-type", "multipart/form-data; boundary=AAAAA");
				},
				success: function(data){
					var fileData =  JSON.parse(data);
						fileData = fileData[templategeneratorData.exportData.id + '.txt'];
 						
 					// set the permissions of the file to private
					sakai.api.Content.setFilePermissions([{"hashpath": fileData.poolId,"permissions": "private"}], function(){
						
						// remove the file from the user's library and move it to the admin user
						$.ajax({
							url: "/p/" + fileData["_path"] + ".members.json",
                			type: "POST",
                			data: {
                    			":manager": templategeneratorTargetUser
                			},
							success: function () {
								$.ajax({
				        	        url: "/p/" + fileData.poolId + ".members.json",
				              		type: "POST",
					                data: {
				        	            ":manager@Delete": sakai.data.me.user.userid
				                	},
	                				success: function () {
	                					var filePath = 'http://' + window.location.host + '/p/' + fileData.poolId + '/' + fileData.item['sakai:pooled-content-file-name'];
	                					
										// Sends a link with the template file to the admin user
										sakai.api.Communication.sendMessage(templategeneratorTargetUser, sakai.data.me,
											"User " + sakai.data.me.user.userid + " created a new template", sakai.api.i18n.Widgets.getValueForKey("templategenerator","","TEMPLATEGENERATOR_ADMIN_MESSAGE") + "\n\n" + filePath ,
											"message", false, handleSentMessage, true, "new_message");
										
										// Sends a message to the user that created the template
										sakai.api.Communication.sendMessage(templategeneratorTargetUser, sakai.data.me,
											"Your new template", sakai.api.i18n.Widgets.getValueForKey("templategenerator","","TEMPLATEGENERATOR_USER_MESSAGE") + "\n\n" + filePath ,
											"message", false, null, true, "new_message");
									},
									error: function() {
										
									}
								});
							},
							error: function(){
								
							}
	    				});
					});
     			},
     			error : function(err){
		
     			}
			});
			
        	// Hide the widget
			$templategeneratorDialog.jqmHide();
        }
        
        /**
         * Retrieve all the data from the server and manipulate it in a way that it can be converted easily
         * for export
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
 					templategeneratorData.docstructure.docstructureData = $.parseJSON(data.results[0].body);
 					templategeneratorData.docstructure.structure = $.parseJSON(templategeneratorData.docstructure.docstructureData.structure0);

 					// retrieve the url for each page in the docstructure and convert the elements within the structure to json
 					templategeneratorData.pageUrls = [];
 					$.each(templategeneratorData.docstructure.structure, function(docstructureIndex, docstructureElement){
 						docstructureElement._view = $.parseJSON(docstructureElement._view);
 						docstructureElement._edit = $.parseJSON(docstructureElement._edit);
 						
						templategeneratorData.pageUrls.push({
							"url": "p/" + docstructureElement._pid + ".infinity.json",
			                "method": "GET",
			                "parameters": {}
			            });
			 
			 			// get the creatorRole, this will need a more consistent approach
			 			var creatorRole = docstructureElement._edit[0];
			 			templategeneratorData.roles.creatorRole = creatorRole.replace('-','');
	 				});
	 				// grab the data for each page
	 				templategeneratorData.pages.structures = [];
	 				sakai.api.Server.batch(templategeneratorData.pageUrls, function(success, data){
		                if (success) {
							// create a dataObject for each page
							$.each(data.results, function(pageIndex, pageElement){
								var page = {};
									page.pageData = $.parseJSON(pageElement.body);
									page.structure = $.parseJSON(page.pageData.structure0);
								
								templategeneratorData.pages.push(page);
								templategeneratorData.pages.structures.push(page.structure);
						
								// extra check to make sure that the pageData is loaded
								templategeneratorData.templatesLoaded = true;
							});
		 				}else {
		 					templategeneratorData.templatesLoaded = false;
		 				}
		            });
		 
		 			// 2. Roles
		 			var roleData = $.parseJSON(data.results[1].body);
					templategeneratorData.roles.roleData = $.parseJSON(roleData.properties["sakai:roles"]);
					templategeneratorData.roles.joinRole = roleData.properties["sakai:joinRole"];
					
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
