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
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 */

/*global $ */

require(["jquery", "sakai/sakai.api.core", "/devwidgets/documentviewer/lib/document-viewer/assets/viewer.js"], function($, sakai) {

    /**
     * @name sakai.documentviewer
     *
     * @class documentviewer
     *
     * @description
     * Initialize the documentviewer widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.documentviewer = function(tuid,showSettings,widgetData){

        var renderDocumentPreview = function(){
            var sakData = widgetData.data;
            var pdfDoc = {
                id: sakData['jcr:name'],
                title: sakData['sakai:pooled-content-file-name'],
                pages: sakData['sakai:pagecount'],
                resources: {
                    pdf: widgetData.url,
                    page: {
                        image: 'http://' + window.location.host + "/p/" + sakData['jcr:name'] + ".page{page}-{size}.jpg"
                    }
                }
            };
            DV.load(pdfDoc, {
                container: '#documentviewer_document_preview',
                width: 900,
                height: 500,
                sidebar: false,
                text: false
            });
        };

        renderDocumentPreview();

        // Indicate that the widget has finished loading
        sakai_global.documentviewer.isReady = true;
        $(window).trigger("ready.documentviewer.sakai", {});

    };
    sakai.api.Widgets.widgetLoader.informOnLoad("documentviewer");
});
