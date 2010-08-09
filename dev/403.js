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

var sakai = sakai || {};
sakai.nopermissions = function(tuid, showSettings) {
    
    var permissionsErrorLoggedOutTemplate = "permission_error_logged_out_template";
    var permissionsErrorLoggedInTemplate = "permission_error_logged_in_template";
    var permissionsError = ".permissions_error";

    var doInit = function(){
        if (sakai.data.me.user.anon){
            // the user is anonymous and should be able to log in
            var renderedTemplate = $.TemplateRenderer(permissionsErrorLoggedOutTemplate, sakai.data.me.user).replace(/\r/g, '');
            $(permissionsError).append(renderedTemplate);
        } else {
            // Remove the sakai.index stylesheet as it would mess up the design
            $("LINK[href*='/dev/_css/sakai/sakai.index.css']").remove();
            // the user is logged in and should get a page in Sakai itself
            var renderedTemplate = $.TemplateRenderer(permissionsErrorLoggedInTemplate, sakai.data.me.user).replace(/\r/g, '');
            $(permissionsError).append(renderedTemplate);
        }
    }

    doInit();

};
sakai.api.Widgets.Container.registerForLoad("sakai.nopermissions");