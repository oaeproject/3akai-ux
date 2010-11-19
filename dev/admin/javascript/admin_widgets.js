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
/*global $, fluid, window */

var sakai = sakai || {};

sakai.admin_widgets = function(tuid, showSettings){

    // CSS IDs
    var adminWidgets = "admin_widgets";
    var adminWidgetsID = "#admin_widgets";
    var adminWidgetsClass = ".admin_widgets";

    var adminWidgetsDialog = adminWidgetsClass + "_dialog";
    var adminWidgetsWidget = adminWidgetsClass + "_widget_";
    var adminWidgetsWidgetName = adminWidgetsWidget + "name_";
    var adminWidgetsButton = adminWidgetsClass + "_button";
    var adminWidgetsButtonDisable = adminWidgetsButton + "_disable";
    var adminWidgetsButtonEnable = adminWidgetsButton + "_enable";
    var adminWidgetsButtonDelete = adminWidgetsButton + "_delete";
    var adminWidgetsButtonDisableConfirm = adminWidgetsButtonDisable + "_confirm";
    var adminWidgetsButtonEnableConfirm = adminWidgetsButtonEnable + "_confirm";
    var adminWidgetsButtonDeleteConfirm = adminWidgetsButtonDelete + "_confirm";
    
    var adminWidgetsDisable = adminWidgetsID + "_disable_";
    var adminWidgetsEnable = adminWidgetsID + "_enable_";
    var adminWidgetsDelete = adminWidgetsID + "_delete_";
    var adminWidgetsNofication = adminWidgetsID + "_notication";
    var adminWidgetsNoficationDisableSuccess = adminWidgetsNofication + "_disable_success";
    var adminWidgetsNoficationDisableError = adminWidgetsNofication + "_disable_error";
    var adminWidgetsNoficationEnableSuccess = adminWidgetsNofication + "_enable_success";
    var adminWidgetsNoficationEnableError = adminWidgetsNofication + "_enable_error";
    var adminWidgetsNoficationDeleteSuccess = adminWidgetsNofication + "_delete_success";
    var adminWidgetsNoficationDeleteError = adminWidgetsNofication + "_delete_error";
    var adminWidgetsNoficationInstallSuccess = adminWidgetsNofication + "_install_success";
    var adminWidgetsNoficationInstallError = adminWidgetsNofication + "_install_error";
    var adminWidgetsDisableDialog = adminWidgetsDisable + "dialog";
    var adminWidgetsEnableDialog = adminWidgetsEnable + "dialog";
    var adminWidgetsDeleteDialog = adminWidgetsDelete + "dialog";
    var adminWidgetsDisableConfirmWidgetTitle = adminWidgetsDisable + "confirm_widget_title";
    var adminWidgetsEnableConfirmWidgetTitle = adminWidgetsEnable + "confirm_widget_title";
    var adminWidgetsDeleteConfirmWidgetTitle = adminWidgetsDelete + "confirm_widget_title";
    var adminWidgetsInstallUrl = adminWidgetsID + "_install_url";
    var adminWidgetsInstallUrlSubmit = adminWidgetsInstallUrl + "_submit";

    // Containers
    var coreWidgetsTemplateContainer = adminWidgetsID + "_core_template_container";
    var sakaiWidgetsTemplateContainer = adminWidgetsID + "_sakai_template_container";
    var contribWidgetsTemplateContainer = adminWidgetsID + "_contrib_template_container";

    // Templates
    var coreWidgetsTemplate = "#admin_widgets_core_template";
    var sakaiWidgetsTemplate = "#admin_widgets_sakai_template";
    var contribWidgetsTemplate = "#admin_widgets_contrib_template";

    /**
     * Callback function to sort widgets
     */
    var sortWidgets = function(a, b){
        if (a.name && b.name) {
            return a.name > b.name ? 1 : -1;
        } else if (a.id && b.name) {
            return a.id > b.name ? 1 : -1;
        } else if (a.name && b.id) {
            return a.name > b.id ? 1 : -1;
        }
        return a.id > b.id ? 1 : -1;
    };

    /**
     * Render the widgets on the page
     */
    var renderCurrentWidgets = function(){
        // Vars for the different widget types
        var coreWidgets = {}; coreWidgets.items = [];
        var sakaiWidgets = {}; sakaiWidgets.items = [];
        var contribWidgets = {}; contribWidgets.items = [];

        // Fill in the widget types
        for (var i in sakai.widgets.widgets){
            if (i) {
                var widget = sakai.widgets.widgets[i];
                if (widget.type && widget.type.toLowerCase() === "core") {
                    coreWidgets.items.push(widget);
                } else if (widget.type && widget.type.toLowerCase() === "sakai") {
                    sakaiWidgets.items.push(widget);
                } else {
                    contribWidgets.items.push(widget);
                }
            }
        }

        // Sort widgets alphabetically
        coreWidgets.items.sort(sortWidgets);
        sakaiWidgets.items.sort(sortWidgets);
        contribWidgets.items.sort(sortWidgets);

        $(coreWidgetsTemplateContainer).html($.TemplateRenderer(coreWidgetsTemplate, coreWidgets));
        $(sakaiWidgetsTemplateContainer).html($.TemplateRenderer(sakaiWidgetsTemplate, sakaiWidgets));
        $(contribWidgetsTemplateContainer).html($.TemplateRenderer(contribWidgetsTemplate, contribWidgets));
    };

    /**
     * Disable the specified widget
     * @param {String} widgetId - the widget ID to disable
     */
    var disableWidget = function(widgetId){
        var disableButtonId = adminWidgetsDisable + widgetId;
        var enableButtonId = adminWidgetsEnable + widgetId;

        // ajax call to service

        // on success
        $(disableButtonId).hide();
        $(enableButtonId).show();
        $(adminWidgetsDisableDialog).jqmHide();
                    sakai.api.Util.notification.show($(adminWidgetsNofication).html(),
                                                     "&quot;" + widgetId + "&quot; " + $(adminWidgetsNoficationDisableSuccess).html(),
                                                     sakai.api.Util.notification.type.INFORMATION);

        // on error
        /*        $(adminWidgetsDisableDialog).jqmHide();
                    sakai.api.Util.notification.show($(adminWidgetsNofication).html(),
                                                     $(adminWidgetsNoficationDisableError).html() + " - " + widgetId,
                                                     sakai.api.Util.notification.type.ERROR);*/
    };

    /**
     * Enable the specified widget
     * @param {String} widgetId - the widget ID to enable
     */
    var enableWidget = function(widgetId){
        var disableButtonId = adminWidgetsDisable + widgetId;
        var enableButtonId = adminWidgetsEnable + widgetId;

        // ajax call to service

        // on success
        $(enableButtonId).hide();
        $(disableButtonId).show();
        $(adminWidgetsEnableDialog).jqmHide();
                    sakai.api.Util.notification.show($(adminWidgetsNofication).html(),
                                                     "&quot;" + widgetId + "&quot; " + $(adminWidgetsNoficationEnableSuccess).html(),
                                                     sakai.api.Util.notification.type.INFORMATION);

        // on error
        /*        $(adminWidgetsEnableDialog).jqmHide();
                    sakai.api.Util.notification.show($(adminWidgetsNofication).html(),
                                                     $(adminWidgetsNoficationEnableError).html() + " - " + widgetId,
                                                     sakai.api.Util.notification.type.ERROR);*/
    };

    /**
     * Delete the specified widget
     * @param {String} widgetId - the widget ID to delete
     */
    var deleteWidget = function(widgetId){
        var widgetSection = adminWidgetsWidget + widgetId;

        // ajax call to service

        // on success
                $(adminWidgetsDeleteDialog).jqmHide();
                $(widgetSection).hide();
                    sakai.api.Util.notification.show($(adminWidgetsNofication).html(),
                                                     "&quot;" + widgetId + "&quot; " + $(adminWidgetsNoficationDeleteSuccess).html(),
                                                     sakai.api.Util.notification.type.INFORMATION);

        // on error
        /*        $(adminWidgetsDeleteDialog).jqmHide();
                    sakai.api.Util.notification.show($(adminWidgetsNofication).html(),
                                                     $(adminWidgetsNoficationDeleteError).html() + " - " + widgetId,
                                                     sakai.api.Util.notification.type.ERROR);*/
    };

    /**
     * Positions the dialog box at the users scroll position
     */
    var installFromUrl = function(){
        var widgetUrl = $(adminWidgetsInstallUrl).val();
        $(adminWidgetsInstallUrl).attr("disabled", "disabled");
        $(adminWidgetsInstallUrlSubmit).attr("disabled", "disabled");
        
        // ajax call to service

        // on success
                var widgetId = "widgetId";
                $(adminWidgetsInstallUrl).removeAttr("disabled");
                $(adminWidgetsInstallUrlSubmit).removeAttr("disabled");
                    sakai.api.Util.notification.show($(adminWidgetsNofication).html(),
                                                     "&quot;" + widgetId + "&quot; " + $(adminWidgetsNoficationInstallSuccess).html(),
                                                     sakai.api.Util.notification.type.INFORMATION);

        // on error
        /*        $(adminWidgetsInstallUrl).removeAttr("disabled");
                $(adminWidgetsInstallUrlSubmit).removeAttr("disabled");
                    sakai.api.Util.notification.show($(adminWidgetsNofication).html(),
                                                     $(adminWidgetsNoficationInstallError).html(),
                                                     sakai.api.Util.notification.type.ERROR);*/
    };

    /**
     * Positions the dialog box at the users scroll position
     */
    var positionDialog = function(){
        // position dialog box at users scroll position
        var htmlScrollPos = $("html").scrollTop();
        var docScrollPos = $(document).scrollTop();
        if (htmlScrollPos > 0) {
            $(adminWidgetsDialog).css({"top": htmlScrollPos + 130 + "px"});
        } else if (docScrollPos > 0) {
            $(adminWidgetsDialog).css({"top": docScrollPos + 130 + "px"});
        }
    };

    // Init disable dialog
    $(adminWidgetsDisableDialog).jqm({
        modal: true,
        trigger: $('.admin_widgets_disable_dialog'),
        overlay: 20,
        toTop: true
    });

    // Init enable dialog
    $(adminWidgetsEnableDialog).jqm({
        modal: true,
        trigger: $('.admin_widgets_enable_dialog'),
        overlay: 20,
        toTop: true
    });

    // Init delete dialog
    $(adminWidgetsDeleteDialog).jqm({
        modal: true,
        trigger: $('.admin_widgets_delete_dialog'),
        overlay: 20,
        toTop: true
    });

    ///////////////////////
    // BINDING FUNCTIONS //
    ///////////////////////

    /**
     * Add binding to the page elements
     */
    var addBinding = function(){
        // Clicking to upload widget
        $("#admin_widgets_upload_link").click(function(ev) {
            // will need to mod fileupload to take a config object or use something else
            $(window).trigger("sakai-fileupload-init");
        });

        // Listen for sakai-fileupload-complete event (from the fileupload widget)
        // to refresh widget listing
        $(window).bind("sakai-fileupload-complete", function() {
            // re render contrib widgets list
            // notification of success or error
        });

        // Bind the disable buttons
        $(adminWidgetsButtonDisable).live("click", function(){
            var widgetId = this.id.substring(adminWidgetsDisable.length - 1);
            $(adminWidgetsButtonDisableConfirm).attr("id", widgetId);
            $(adminWidgetsDisableConfirmWidgetTitle).html("&quot;" + $(adminWidgetsWidgetName + widgetId).html() + "&quot;");
            positionDialog();
            $(adminWidgetsDisableDialog).jqmShow();
        });

        // Bind the confirm disable button
        $(adminWidgetsButtonDisableConfirm).live("click", function(){
            var widgetId = this.id;
            disableWidget(widgetId);
        });

        // Bind the enable buttons
        $(adminWidgetsButtonEnable).live("click", function(){
            var widgetId = this.id.substring(adminWidgetsEnable.length - 1);
            $(adminWidgetsButtonEnableConfirm).attr("id", widgetId);
            $(adminWidgetsEnableConfirmWidgetTitle).html("&quot;" + $(adminWidgetsWidgetName + widgetId).html() + "&quot;");
            positionDialog();
            $(adminWidgetsEnableDialog).jqmShow();
        });

        // Bind the confirm enable button
        $(adminWidgetsButtonEnableConfirm).live("click", function(){
            var widgetId = this.id;
            enableWidget(widgetId);
        });

        // Bind the delete buttons
        $(adminWidgetsButtonDelete).live("click", function(){
            var widgetId = this.id.substring(adminWidgetsDelete.length - 1);
            $(adminWidgetsButtonDeleteConfirm).attr("id", widgetId);
            $(adminWidgetsDeleteConfirmWidgetTitle).html("&quot;" + $(adminWidgetsWidgetName + widgetId).html() + "&quot;");
            positionDialog();
            $(adminWidgetsDeleteDialog).jqmShow();
        });

        // Bind the confirm delete button
        $(adminWidgetsButtonDeleteConfirm).live("click", function(){
            var widgetId = this.id;
            deleteWidget(widgetId);
        });

        // Bind the install from url button
        $(adminWidgetsInstallUrlSubmit).live("click", function(){
            installFromUrl();
        });
    };

    /**
     * Initialize page functionality
     */
    var doInit = function(){
        // redirect to 500 error page if not admin
        if (sakai.data.me.user.userid !== "admin") {
            document.location = "/dev/500.html";
        } else {
            renderCurrentWidgets();
            addBinding();
        }
    };

    doInit();
};

sakai.api.Widgets.Container.registerForLoad("sakai.admin_widgets");