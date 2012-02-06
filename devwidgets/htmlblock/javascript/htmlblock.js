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

/*tinyMCE.init({
  mode : "textareas",
  theme : "advanced",
  plugins : "pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,autoresize",
  theme_advanced_buttons1 : "save,newdocument,|,bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,|,styleselect,formatselect,fontselect,fontsizeselect",
  theme_advanced_buttons2 : "cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo,|,link,unlink,anchor,image,cleanup,help,code,|,insertdate,inserttime,preview,|,forecolor,backcolor",
  theme_advanced_buttons3 : "tablecontrols,|,hr,removeformat,visualaid,|,sub,sup,|,charmap,emotions,iespell,media,advhr,|,print,|,ltr,rtl,|,fullscreen",
  theme_advanced_buttons4 : "insertlayer,moveforward,movebackward,absolute,|,styleprops,|,cite,abbr,acronym,del,ins,attribs,|,visualchars,nonbreaking,template,pagebreak",
  theme_advanced_toolbar_location : "external",
  theme_advanced_toolbar_align : "left",
  theme_advanced_statusbar_location : "none",
  theme_advanced_resizing : false
});*/

// load the master sakai object to access all Sakai OAE API methods
require(["jquery", "sakai/sakai.api.core"], function($, sakai) {
     
    /**
     * @name sakai.htmlblock
     *
     * @class htmlblock
     *
     * @description
     * WIDGET DESCRIPTION
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.htmlblock = function (tuid, showSettings, widgetData) {

        var $rootel = $("#" + tuid);

        var autoSavePoll = false;
        var lastData = "";
        if (widgetData && widgetData.htmlblock){
            lastData = widgetData.htmlblock.content;
        }

        sakai_global.htmlblock.updateHeights = function(element){
            var elements = element ? [$("#" + element + "_ifr")] : $(".mceIframeContainer iframe:visible");
            $.each(elements, function(index, item){
                try {
                    var docHt = 0, sh, oh;
                    var frame = $(item)[0];
                    $(item).contents().scrollTop(0);
                    var innerDoc = (frame.contentDocument) ? frame.contentDocument : frame.contentWindow.document;
                    $(item).css("height", "25px");
                    docHt = sh = innerDoc.body.scrollHeight; docHt = oh = innerDoc.body.offsetHeight;
                    if (sh && oh) {
                        //docHt = Math.max(sh, oh);
                        docHt = oh;
                    } else {
                        docHt = sh;
                    }
                    if (docHt < 25){
                        docHt = 25;
                    }
                    if ($(item).height() !== docHt) {
                        $(item).css("height", docHt + "px");
                    }
                } catch (err){
                    return false;
                }
            });
        };

        var $rootel = $("#" + tuid);
        var $toolbar = false;
        var id = false;

        var updateHeightInit = function(ui){
            id = ui.id;
            $editor = $("#" + id + "_ifr");
            $toolbar = $("#" + id + "_external");
            $("#inserterbar_widget #inserterbar_tinymce_container").append($toolbar);
            setTimeout(sakai_global.htmlblock.updateHeights, 500, id);

            // Start the autosave
            if (autoSavePoll){
                clearInterval(autoSavePoll);
                autoSavePoll = false;
            }
            autoSavePoll = setInterval(autoSave, 5000);
            $(window).bind("save.contentauthoring.sakai", function(){
                var currentText = tinyMCE.get(id).getContent();
                $("#htmlblock_view_container", $rootel).html(currentText);
                sakai.api.Util.renderMath($rootel);
            });
        };
        
        var stopAutosave = function(){
            if (autoSavePoll){
                clearInterval(autoSavePoll);
                autoSavePoll = false;
            }
            $(window).unbind("save.contentauthoring.sakai");
        }
        
        var autoSave = function(){
            var currentText = tinyMCE.get(id).getContent();
            if (currentText !== lastData){
                lastData = currentText;
                sakai.api.Widgets.saveWidgetData(tuid, {"content": currentText});
            }
        };

        var updateHeight = function(ev, ui){
            if ($editor && (!ev || !ev.type || ev.type === "click" || ev.type === "keyup" || ev.type === "mouseup" || ev.type === "paste")) {
                if (ui && ui.id){
                    sakai_global.htmlblock.updateHeights(ui.id);
                } else {
                    sakai_global.htmlblock.updateHeights();
                }
            }
            return true;
        };

        /**
         * Initialization function DOCUMENTATION
         */
        var doInit = function () {
            if (showSettings){
                
            } else {
                var $textarea = $("textarea", $rootel).attr("name", tuid).addClass(tuid);
                if (widgetData && widgetData.htmlblock) {
                    var processedContent = sakai.api.i18n.General.process(widgetData.htmlblock.content);
                    $("#htmlblock_view_container", $rootel).html(processedContent);
                    sakai.api.Util.renderMath($rootel);
                    // Fill up the textarea
                    $textarea.val(widgetData.htmlblock.content);
                }
                $textarea.css("height", $("#htmlblock_view_container", $rootel).height());
                if (window["tinyMCE"]) {
                    tinyMCE.init({
                        mode: "textareas",
                        theme: "advanced",
                        skin: "sakai",
                        content_css: "/dev/css/sakai/main.css,/dev/css/sakai/sakai.corev1.css",
                        plugins: "table,advlink,contextmenu,paste,directionality",
                        theme_advanced_buttons1: "bold,italic,underline,|,justifyleft,justifycenter,justifyright,justifyfull,|,formatselect,fontsizeselect,|,bullist,numlist,|,forecolor,|,table,code",
                        theme_advanced_buttons2: "",
                        theme_advanced_buttons3: "",
                        theme_advanced_toolbar_location: "external",
                        theme_advanced_toolbar_align: "left",
                        theme_advanced_statusbar_location: "none",
                        theme_advanced_resizing: false,
                        editor_selector: tuid,
                        handle_event_callback: updateHeight,
                        init_instance_callback: updateHeightInit,
                        remove_instance_callback: stopAutosave,
                        setup : function(ed) {
                            ed.onClick.add(function(ed, e) {
                                $(this.contentAreaContainer).parents(".contentauthoring_cell_element").find(".contentauthoring_cell_element_actions").hide();
                            });
                        }
                    });
                }
            }
        };
        
        // run the initialization function when the widget object loads
        doInit();
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("htmlblock");
});
