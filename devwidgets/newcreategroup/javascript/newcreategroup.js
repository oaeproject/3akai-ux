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

/*
 * Dependencies
 *
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 * /dev/lib/jquery/plugins/jquery.validate.sakai-edited.js (validate)
 */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.newcreategroup
     *
     * @class newcreategroup
     *
     * @description
     * newcreategroup widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.newcreategroup = function(tuid, showSettings){

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    // Containers
    var $newcreategroupContainer = $("#newcreategroup_container");

    // Elements
    var $newcreategroupCreateSimpleGroupButton = $(".newcreategroup_create_simple_group");
    var $newcreategroupGroupTitle = $("#newcreategroup_title");
    var $newcreategroupSuggestedURL = $("#newcreategroup_suggested_url");
    var $newcreategroupGroupDescription = $("#newcreategroup_description");
    var $newcreategroupGroupTags = $("#newcreategroup_tags");
    var $newcreategroupSuggestedURLBase = $("#newcreategroup_suggested_url_base");
    var $newcreategroupCanBeFoundIn = $("#newcreategroup_can_be_found_in");
    var $newcreategroupGroupMembership = $("#newcreategroup_membership");
    var $newcreategroupAddPeople = $(".newcreategroup_add_people");

    // Forms
    var $newcreategroupGroupForm = $("#newcreategroup_group_form");

    /**
     * Create a simple group and execute the tagging and membership functions
     */
    var doCreateSimpleGroup = function(){
        var grouptitle = $newcreategroupGroupTitle.val() || "";
        var groupdescription = $newcreategroupGroupDescription.val() || "";
        var groupid = sakai.api.Util.makeSafeURL($newcreategroupSuggestedURL.val(), "-");
        var grouptags = $newcreategroupGroupTags.val().split(",");
        sakai.api.Groups.createGroup(groupid, grouptitle, groupdescription, sakai.data.me, function(success, nameTaken){
            if (success) {
                var groupProfileURL = "/~" + groupid + "/public/authprofile";
                // Tag group
                sakai.api.Util.tagEntity(groupProfileURL, grouptags, [], false);
                // Set permissions on group
                var joinable = $newcreategroupGroupMembership.val();
                var visible = $newcreategroupCanBeFoundIn.val();
                sakai.api.Groups.setPermissions(groupid, joinable, visible);
            } else {
                if(nameTaken){
                    sakai.api.Util.notification.show(sakai.api.i18n.Widgets.getValueForKey("newcreategroup","","GROUP_TAKEN"), sakai.api.i18n.Widgets.getValueForKey("newcreategroup","","THIS_GROUP_HAS_BEEN_TAKEN"));
                }
                $newcreategroupGroupForm.find("select, input, textarea").removeAttr("disabled");
            }
        });
    };

    /**
     * Add binding to the elements and validate the forms on submit
     */
    var addBinding = function(){
        $newcreategroupCreateSimpleGroupButton.bind("click", function(){
            $newcreategroupGroupForm.validate({
                submitHandler: function(form){
                    $newcreategroupGroupForm.find("select, input, textarea").attr("disabled","disabled");
                    doCreateSimpleGroup();
                }
            });
            $newcreategroupGroupForm.submit();
        });

        $newcreategroupGroupTitle.bind("keyup", function(){
            var suggestedURL = sakai.api.Util.makeSafeURL($(this).val(), "-");
            $newcreategroupSuggestedURL.val(suggestedURL);
        });

        $newcreategroupSuggestedURL.bind("blur", function(){
            var suggestedURL = sakai.api.Util.makeSafeURL($(this).val(), "-");
            $newcreategroupSuggestedURL.val(suggestedURL);
        });

        $newcreategroupAddPeople.bind("click", function(){
            $(window).trigger("init.addpeople.sakai");
        });
    };

    /**
     * Initialize the create group widget
     */
    var doInit = function(){
        $newcreategroupSuggestedURLBase.text(window.location.protocol + "//" + window.location.host + "/~");
        $newcreategroupContainer.show();
        addBinding();
    };

    $(window).bind("sakai.newcreategroup.init", function(){
        doInit();
    });

    $(window).trigger("newcreategroup.ready");

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("newcreategroup");

});