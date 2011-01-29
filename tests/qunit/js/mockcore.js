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
 * MockCore - Default mocking for sakai unit tests
 */
require(["jquery", "../../../../tests/qunit/js/jquery.mockjax.js"], function($){
    $.mockjax(function(settings) {
      var url = settings.url.match(/\/dev\/(.*)$/);
      if ( url ) {
        return { responseTime:10, proxy: '../../../../dev/' + url[1] };
      } else {
          var widgetURL = settings.url.match(/\/devwidgets\/(.*)$/);
          if ( widgetURL ) {
              return { responseTime:10, proxy: '../../../../devwidgets/' + widgetURL[1] };
          }
          return null;
      }
      return null;
    }); 
});