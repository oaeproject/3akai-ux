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

/**
 * Definitions of the js and html files inside the /dev folder to test
 */
require(["jquery", "sakai/sakai.api.core"], function($, sakai){
    sakai_global = sakai_global|| {};
    sakai_global.qunit = sakai_global.qunit || {};
    sakai_global.qunit.devfilesdone = false;



    sakai_global.qunit.devJsFiles = [
        "/dev/javascript/acknowledgements.js",
        "/dev/javascript/category.js",
        "/dev/javascript/content_profile.js",
        "/dev/javascript/createnew.js",
        "/dev/javascript/createnewaccount.js",
        "/dev/javascript/explore.js",
        "/dev/javascript/group.js",
        "/dev/javascript/logout.js",
        "/dev/javascript/profile_edit.js",
        "/dev/javascript/sakai.403.js",
        "/dev/javascript/sakai.404.js",
        "/dev/javascript/sakai.500.js",
        "/dev/javascript/search.js",
        "/dev/javascript/search_sakai2.js",
        "/dev/javascript/search_util.js",
        "/dev/javascript/user.js",
        "/dev/javascript/history/search_history.js",
        "/dev/lib/sakai/sakai.api.communication.js",
        "/dev/lib/sakai/sakai.api.content.js",
        "/dev/lib/sakai/sakai.api.core.js",
        "/dev/lib/sakai/sakai.api.groups.js",
        "/dev/lib/sakai/sakai.api.i18n.js",
        "/dev/lib/sakai/sakai.api.l10n.js",
        "/dev/lib/sakai/sakai.api.server.js",
        "/dev/lib/sakai/sakai.api.user.js",
        "/dev/lib/sakai/sakai.api.util.js",
        "/dev/lib/sakai/sakai.api.widgets.js",
        "/dev/lib/sakai/sakai.dependencies.js",
        "/dev/lib/sakai/sakai.jquery-extensions.js",
        "/dev/s23/javascript/s23_site.js",
        "/dev/admin/javascript/admin_widgets.js",
        "/dev/configuration/config.js",
        "/dev/configuration/config_custom.js",
        "/dev/configuration/sakaidoc.js"
    ];

    sakai_global.qunit.devHtmlFiles = [
        "/dev/403.html",
        "/dev/404.html",
        "/dev/500.html",
        "/dev/acknowledgements.html",
        "/dev/allcategories.html",
        "/dev/category.html",
        "/dev/content_profile.html",
        "/dev/create_new_account.html",
        "/dev/explore.html",
        "/dev/group.html",
        "/dev/layout1.html",
        "/dev/layout2.html",
        "/dev/logout.html",
        "/dev/search.html",
        "/dev/search_sakai2.html",
        "/dev/user.html",
        "/dev/s23/s23_site.html",
        "/dev/admin/widgets.html"
    ];

    sakai_global.qunit.devfilesdone = true;
    $(window).trigger("devfilesdone.qunit.sakai");

});
