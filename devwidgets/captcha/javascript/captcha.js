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


/*global Config, $, */


var sakai = sakai || {};

sakai.captcha = function(tuid, showSettings) {
    
    var $rootel = $("#" + tuid);
    
    
    /**
     *@returns {Object} Data that should be used in a request to send to a captcha validator.
     */
    sakai.captcha.getProperties = function() {
        var values = {};
        values["recaptcha-challenge"] = Recaptcha.get_challenge();
        values["recaptcha-response"] = Recaptcha.get_response();
        return values;
    };
    
    /**
     *Invalidates the current captcha
     */
    sakai.captcha.destroy = function() {
      Recaptcha.destroy();  
    };
    
    /**
     * Performs an AJAX request to the captcha service and fetches all the properties.
     * We assume that we always use reCAPTCHA
     */
    sakai.captcha.init = function() {
        $.ajax({
            "url" : sakai.config.URL.CAPTCHA_SERVICE,
            "type" : "GET",
            "success" : function (data, status) {
                var captchaContainer = $("#captcha_container", $rootel).get()[0];
                Recaptcha.create(data["public-key"], captchaContainer,
                    {
                        theme: "red"
                    }
                );
            }
        });
    };
    
    sakai.captcha.init();
        
};

sakai.api.Widgets.widgetLoader.informOnLoad("captcha");