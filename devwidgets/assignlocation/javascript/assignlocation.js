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
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 */

require(['jquery', 'sakai/sakai.api.core', 'jquery-jstree'], function($, sakai) {

    /**
     * @name sakai_global.assignlocation
     *
     * @class assignlocation
     *
     * @description
     * Assign location widget<br />
     * This widget is used to assign a location to a piece of content
     * The content can then be found under that location through the directory page
     * or by searching on the tags of the location
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.assignlocation = function(tuid, showSettings) {
        // Containers
        var $rootel = $( '#' + tuid );
        var $assignlocationContainer = $('#assignlocation_container', $rootel);
        var $assignlocationJSTreeContainer = $('#assignlocation_jstree_container');
        var $assignlocationJSTreeSelectedContainer = $('#assignlocation_jstree_selected_container');

        // Templates
        var assignlocationJSTreeSelectedTemplate = 'assignlocation_jstree_selected_template';

        // Variables
        var alreadyAssignedLocations = [];
        var initiallySelected = [],
            initiallyRendered = [],
            initial = 0,
            saveCallback = false;

        // i18n
        var assignlocationLocationSaved = $('#assignlocation_location_saved');
        var assignlocationLocationSuccessfullySaved = $('#assignlocation_location_successfully_saved');

        // Actions
        var $assignlocationSaveButton = $('#assignlocation_save_button');
        var $assignlocationActions = $('#assignlocation_actions');

        var renderSelected = function() {
            var locations = {
                'selections' : initiallyRendered,
                sakai: sakai
            };
            $assignlocationJSTreeSelectedContainer.html(sakai.api.Util.TemplateRenderer(assignlocationJSTreeSelectedTemplate, locations));

            // add event binding to the items
            $('.assignlocation_close_image').on('click', function(ev) {
                // get the id for the node (list item id)
                var id = $(this).parent().attr('id').split('/').pop();
                // unchecked the node
                $assignlocationJSTreeContainer.jstree('uncheck_node', $('#'+id));
                return false;
            });
        };

        var addTreeBinding = function() {
            $assignlocationJSTreeContainer.on('change_state.jstree', function( e ) {
                if (initial > 0) {
                    initial--;
                } else {
                    initiallyRendered = [];
                    $('.jstree-checked>a').each(function(index, val) {
                        initiallyRendered.push({
                            id: $(val).attr('data-id'),
                            path: $(val).attr('data-path'),
                            title: $(val).attr('title'),
                            value: $(val).attr('data-long-title'),
                            parent: $(val).attr('data-parent'),
                            category: true
                        });
                    });
                    renderSelected();
                    $assignlocationSaveButton.removeAttr('disabled');
                }
            });
        };

        var saveLocations = function() {
            if ( saveCallback ) {
                saveCallback( initiallyRendered );
            }
            sakai.api.Util.Modal.close($assignlocationContainer);
        };

        var addWidgetBinding = function() {
            $assignlocationSaveButton.off('click');
            $assignlocationSaveButton.on('click', function() {
                saveLocations();
            });
        };

        var showContainer = function(hash) {
            initTree();
            addTreeBinding();
            addWidgetBinding();
            hash.w.show();
            renderSelected(true);
        };

        var closeContainer = function() {
            $assignlocationActions.show();
            $assignlocationAjaxLoader.hide();
        };

        var determineInitiallySelected = function( _initiallySelected ) {
            initiallySelected = [];
            initiallyRendered = [];
            if ( _initiallySelected ) {
                $.each( _initiallySelected, function( i, val ) {
                    initiallySelected.push( val.id );
                    initiallyRendered.push({
                        id: val.id,
                        value: val.value
                    });
                });
            }
            initial = initiallySelected.length;
        };

        var initTree = function() {
            // set up new jstree for directory
            var jsonData = sakai.api.Util.getDirectoryStructure();
            var pluginArray = ['themes', 'json_data', 'search', 'checkbox', 'ui'];
            $assignlocationJSTreeContainer.jstree('destroy');
            $assignlocationJSTreeContainer.jstree({
                'plugins': pluginArray,
                'core': {
                    'animation': 0,
                    'html_titles': true
                },
                'cookies': {
                    'save_selected': true
                },
                'json_data': {
                    'data': jsonData
                },
                'themes': {
                    'dots': false,
                    'icons': false,
                    'url': '/dev/lib/jquery/plugins/jsTree/themes/default/style.css'
                },
                'search' : {
                    'case_insensitive' : true
                },
                'ui': {
                    'initially_select': initiallySelected,
                    'preventDefault': true
                },
                'checkbox': {
                    'two_state': true
                }
            });
        };

        var doInit = function() {

            $( window ).on( 'init.assignlocation.sakai', function( e, _initiallySelected, originalEvent, _saveCallback ) {
                if ( $.isFunction( _saveCallback ) ) {
                    saveCallback = _saveCallback;
                }
                if ( _initiallySelected ) {
                    determineInitiallySelected( _initiallySelected );
                }
                // Need a larget zIndex if this was triggered from another overlay
                var $target = $( originalEvent.target );
                var zIndex = 4000;
                if ( $target.parents( '.s3d-dialog' ).length ) {
                    zIndex = 5000;
                }
                sakai.api.Util.Modal.setup($assignlocationContainer, {
                    modal: true,
                    toTop: true,
                    onShow: showContainer,
                    onClose: closeContainer,
                    zIndex: zIndex
                });
                sakai.api.Util.Modal.open($assignlocationContainer);
                $assignlocationSaveButton.attr('disabled', 'disabled');
            });
        };
        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad('assignlocation');
});
