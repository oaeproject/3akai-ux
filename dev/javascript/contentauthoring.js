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

require(["jquery","sakai/sakai.api.core"], function($, sakai) {

    sakai_global.contentauthoring = function(){

        // Highlight on drag entering drop zone.
        $(".contentauthoring_cell_element, .contentauthoring_cell_content").live('dragenter', function(ev) {
            $(".ui-state-highlight.external_content").remove();
            if($(this).hasClass("contentauthoring_cell_element")){
                $(this).after($("<div class='ui-state-highlight external_content'></div>"));
            } else {
                $(this).append($("<div class='ui-state-highlight external_content'></div>"));
            }
            return false;
        });

        // Un-highlight on drag leaving drop zone.
        $(".contentauthoring_cell_element, .contentauthoring_cell_content").live('dragleave', function(ev) {
            return false;
        });

        // Decide whether the thing dragged in is welcome.
        $(".contentauthoring_cell_element, .contentauthoring_cell_content").live('dragover', function(ev) {
            return false;
        });

        // Handle the final drop
        $(".contentauthoring_cell_element, .contentauthoring_cell_content").live('drop', function(ev) {
            ev.preventDefault();
            $(".ui-state-highlight.external_content").remove();
            var dt = ev.originalEvent.dataTransfer;
            var content = "";
            if(dt.files.length){
                content = dt.files;
            } else {
                content = dt.getData("Text");
            }
            $(window).trigger("sakai.contentauthoring.droppedexternal", {
                content: content,
                target: $(this)
            });
            return false;
        });
    };

    sakai.api.Widgets.Container.registerForLoad("contentauthoring");
});
