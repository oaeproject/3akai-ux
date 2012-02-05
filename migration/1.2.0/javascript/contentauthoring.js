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

        $("#migration_convert_url").live("click", function(){
            var url = $("#migration_input_url").val();
            sakai.api.Server.loadJSON(url, function(success, data){
                if (success){
                     $("#migration_output").val($.toJSON(sakai.api.Content.Migrators.migratePageStructure(data)));
                } else {
                    alert("No valid JSON structure was entered");
                }
            });
        });

        $("#migration_convert_structure").live("click", function(){
            var block = {};
            try {
                block = eval('(' + $("#migration_input_block").val() + ')');
                $("#migration_output").val($.toJSON(sakai.api.Content.Migrators.migratePageStructure(block)));
            } catch (err){
                alert("An error has occured. Please replace variables by dummy values.\n" + err);
            }
        });
        
    };

    sakai.api.Widgets.Container.registerForLoad("contentauthoring");
});
