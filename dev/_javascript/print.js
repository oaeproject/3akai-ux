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


/*global $, Config */

var sakai = sakai || {};
sakai.print = function(){
    
    var init = function() {
      var json = {};

      $.ajax({
          url: "/_user" + sakai.data.me.profile.path + "/private/print.json",
          cache: false,
          success: function(data){
              json = $.evalJSON(data);
              $(".content_container").html(json.content);
              var css = json.css.substr(0,json.css.length-1).split(",");
              for (var i = 0; i < css.length; i++){
                  $.Load.requireCSS(css[i]);
              }
          }
      });
    }
    
    init();
    $(function() {
      window.print();
    });

};

sdata.container.registerForLoad("sakai.print");