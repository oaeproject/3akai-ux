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

        ////////////////////
        // Event Handlers //
        ////////////////////
        var bindEvents = function() {
			$templategeneratorExportButton.die("click");
			$templategeneratorExportButton.live("click", function() {
				$templategeneratorForm.validate({submitHandler: function(form) {
					
				}});
			});
        };
        
        /**
         *	Retrieve
         */
        var getTemplateInfo = function(){
        	
        };

        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        /**
         * Initialization function DOCUMENTATION
         */
        var doInit = function(worldId) {
            bindEvents(worldId);
            getTemplateInfo();
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
