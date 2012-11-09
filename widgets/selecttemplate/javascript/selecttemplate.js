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
 */

require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai_global.newcreategroup
     *
     * @class newcreategroup
     *
     * @description
     * selecttemplate widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.selecttemplate = function(tuid, showSettings) {

        var $rootel = $('#' + tuid);

        var doInit = function() {
            sakai.api.Util.getTemplates(function(success, templates) {
                if (success) {
                    var templatesToRender = false;
                    for (var i = 0; i < templates.length; i++) {
                        if (templates[i].id === tuid) {
                            templatesToRender = templates[i];
                            break;
                        }
                    }
                    if (templatesToRender) {
                        if (templatesToRender.templates.length === 1) {
                            renderCreateWorld(templatesToRender.id, templatesToRender.templates[0].id, true);
                        } else {
                            renderTemplateList(templatesToRender);
                        }
                    }
                } else {
                    debug.error('Could not get the group templates');
                }
            });
        };

        $rootel.on('click', '.selecttemplate_use_button', function() {
            var clicked = $(this);
            if (clicked.data('templateid')) {
                renderCreateWorld(tuid, clicked.data('templateid'), false);
            }
        });

        var renderTemplateList = function(templates) {
            $('#selecttemplate_container', $rootel).show();
            templates.sakai = sakai;
            templates.templates = templates.templates.sort(function(a,b) {
                return a.order - b.order;
            });
            $('#selecttemplate_templatelist_container', $rootel).html(sakai.api.Util.TemplateRenderer('selecttemplate_templatelist_template', templates));
            $('#selecttemplate_type_name', $rootel).text(sakai.api.i18n.getValueForKey(templates.menuLabel || templates.title));
            $('#selecttemplate_createworld_container', $rootel).hide();

            $('.selecttemplate_preview_button', $rootel).on('click', function() {
                var clicked = $(this);
                if (clicked.data('templateid')) {
                    renderPreview(tuid, clicked.data('templateid'), templates);
                }
            });
        };

        var renderCreateWorld = function(category, id, singleTemplate) {
            $('#selecttemplate_container', $rootel).hide();
            var tuid = sakai.api.Util.generateWidgetId();
            var toPassOn = {};
            toPassOn[tuid] = {
                'category': category,
                'id': id,
                'singleTemplate': singleTemplate
            };
            toPassOn[tuid + 'addpeople'] = {
                'category': category,
                'id': id
            };
            $('#selecttemplate_createworld_container', $rootel).html(sakai.api.Util.TemplateRenderer('selecttemplate_createworld_template', {'tuid' : tuid}));
            sakai.api.Widgets.widgetLoader.insertWidgets('selecttemplate_createworld_' + tuid, false, false, toPassOn);
            $('#selecttemplate_createworld_container', $rootel).show();
        };

        var renderPreview = function(category, id, templates) {
            var $selecttemplatePreviewDialog = $('#selecttemplate_preview_dialog', $rootel);
            var $selecttemplatePreviewDialogContainer = $('#selecttemplate_preview_dialog_container', $rootel);
            var selecttemplatePreviewDialogTemplate = 'selecttemplate_preview_dialog_template';

            $selecttemplatePreviewDialog.jqm({
                modal: true,
                overlay: 20,
                toTop: true,
                top: '50px'
            });

            var template;
            for (var t in templates.templates) {
                if (templates.templates.hasOwnProperty(t)) {
                    if (id === templates.templates[t].id) {
                        template = templates.templates[t];
                        break;
                    }
                }
            }
            $selecttemplatePreviewDialog.jqmShow();
            var json = {
                'template': template,
                'sakai': sakai
            };
            sakai.api.Util.TemplateRenderer(selecttemplatePreviewDialogTemplate, json, $selecttemplatePreviewDialogContainer);
            $('.selecttemplate_use_button', '#selecttemplate_preview_dialog').on('click', function() {
                var clicked = $(this);
                if (clicked.data('templateid')) {
                    renderCreateWorld(tuid, clicked.data('templateid'), false);
                    $selecttemplatePreviewDialog.jqmHide();
                }
            });
        };

        $(window).on('hashchange', function() {
            doInit();
        });

        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad('selecttemplate');

});
