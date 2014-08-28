/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['jquery', 'oae.api.util', 'oae.api.i18n', 'annotator', 'jquery.autosize'], function (jQuery, oaeUtil, i18nAPI) {
    (function() {
        var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
            __hasProp = {}.hasOwnProperty,
            __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        Annotator.Plugin.Sidebar = (function(_super) {
            __extends(Sidebar, _super);

            /**
             * Bind the events associated to the Sidebar
             */
            Sidebar.prototype.events = {
                'annotationDeleted': 'onAnnotationDeleted',
                'annotationViewerShown': 'onAnnotationViewerShown',
                '.documentpreview-annotation-delete click': 'onDeleteClick',
                '.documentpreview-annotation-edit click': 'onEditClick',
                '.documentpreview-annotation-reply click': 'onReplyClick',
                '.annotator-save click': 'saveAnnotation',
                'textarea keydown': 'processKeypress'
            };

            /**
             * Set default values for field, editor, input and options
             */
            Sidebar.prototype.field = null;
            Sidebar.prototype.input = null;
            Sidebar.prototype.options = {};
            // Set the HTML structure for the editor
            Annotator.Editor.prototype.html = '<form>' +
                                                  '<ul class="annotator-listing"></ul>' +
                                                  '<div class="annotator-controls">' +
                                                      '<button type="button" class="btn btn-link annotator-cancel">' + i18nAPI.translate('__MSG__CANCEL__') + '</button>' +
                                                      '<button type="button" class="btn btn-primary pull-right annotator-save annotator-focus">' + i18nAPI.translate('__MSG__SAVE__') + '</button>' +
                                                  '</div>' +
                                              '</form>';

            /**
             * Override keyboard events so that only the escape key is captured
             *
             * @param  {[type]} ev [description]
             */
            Annotator.Editor.prototype.processKeypress = function(ev) {
                if (ev.keyCode === 27) {
                    return this.hide();
                }
            };

            /**
             * Bind events to the Sidebar and create the annotations panel
             */
            function Sidebar(element, options) {
                if (!options.container) {
                    throw new Error('A valid side bar container should be provided');
                }
                if (!options.viewTemplate) {
                    throw new Error('A valid view template should be provided');
                }
                if (!options.editTemplate) {
                    throw new Error('A valid edit template should be provided');
                }

                this.onDeleteClick = __bind(this.onDeleteClick, this);
                this.onEditClick = __bind(this.onEditClick, this);
                this.onReplyClick = __bind(this.onReplyClick, this);
                this.onEditorSubmit = __bind(this.onEditorSubmit, this);
                this.onAdderClick = __bind(this.onAdderClick, this);
                this.processKeypress = __bind(this.processKeypress, this);
                $.extend(Annotator.Plugin.Sidebar.prototype.options, options);
                Sidebar.__super__.constructor.apply(this, arguments);
            }

            /**
             * Initialize the Sidebar plugin
             */
            Sidebar.prototype.pluginInit = function() {
                if (!Annotator.supported()) {
                    return;
                }

                // Render the initial, empty, annotations list
                this.renderAnnotationsList();
                this.hideAnnotationsList();

                // Hide the annotations panel when the 'x' is clicked
                $('body').on('click', '#documentpreview-annotator-close', this.hideAnnotationsList);

                // Toggle the annotations list when the edit button is clicked
                $('body').on('click', '#documentpreview-toggle-annotator', this.toggleAnnotationsList);
            };


            ///////////////
            // UTILITIES //
            ///////////////

            Sidebar.prototype.toggleAnnotationsList = function() {
                if ($('#documentpreview-sidebar').is(':visible')) {
                    Annotator.Plugin.Sidebar.prototype.hideAnnotationsList();
                } else {
                    Annotator.Plugin.Sidebar.prototype.showAnnotationsList();
                }
            };

            /**
             * Hide the annotations list
             */
            Sidebar.prototype.hideAnnotationsList = function() {

                if ($('#documentpreview-sidebar').is(':visible')) {
                    $('#documentpreview-toggle-annotator #documentpreview-annotator-status').toggleClass('active');
                    // If we're editing or creating annotations we need to stop that before closing
                    if ($('#documentpreview-sidebar textarea').is(':visible')) {
                        $('.annotator-cancel').click();
                    }

                    $('#documentpreview-sidebar').animate({
                        'opacity': '0',
                        'width': '0%'
                    });
                    setTimeout(function() {
                        $('#documentpreview-content-container').animate({
                            'width': '100%'
                        }, function() {
                            $('#documentpreview-sidebar').hide();
                        });
                    }, 10);
                }
            };

            /**
             * Show the annotations list
             */
            Sidebar.prototype.showAnnotationsList = function() {
                if (!$('#documentpreview-sidebar').is(':visible')) {
                    $('#documentpreview-toggle-annotator #documentpreview-annotator-status').toggleClass('active');
                    $('#documentpreview-sidebar').show();
                    $('#documentpreview-content-container').animate({
                        'width': '78%'
                    });
                    setTimeout(function() {
                        $('#documentpreview-sidebar').animate({
                            'opacity': '1',
                            'width': '22%'
                        });
                    }, 10);
                }
            };

            /**
             * Get the custom fields for the annotation editor
             */
            var getEditorFields = function() {
                return {
                    type: 'textarea',
                    label: i18nAPI.translate('__MSG__ADD_A_COMMENT__', 'documentpreview'),
                    load: function(field, annotation) {
                        Sidebar.prototype.showAnnotationsList();
                        $(field).find('textarea').val(annotation.text || '');
                        // Wait until the current call stack has cleared before auto-resizing
                        setTimeout(function() {
                            $(field).find('textarea').autosize().trigger('autosize.resize');
                        }, 1);
                        return;
                    },
                    submit: function(field, annotation) {
                        // Update the cached annotation
                        annotation.text = $(field).find('textarea').val();
                        return annotation.text;
                    }
                };
            };

            /**
             * Set up a custom editor for the annotator
             */
            Annotator.prototype._setupEditor = function() {
                this.editor = new Annotator.Editor();
                this.editor.hide().on('hide', this.onEditorHide).on('save', this.onEditorSubmit).addField(getEditorFields());
                return this;
            };

            /**
             * Set up a custom editor for the Sidebar
             */
            Sidebar.prototype._setupEditor = function() {
                this.editor = new Annotator.Editor();
                this.editor.hide().on('hide', this.onEditorHide).on('save', this.onEditorSubmit).addField(getEditorFields());
                return this;
            };

            /**
             * Catch button click events that are defined in the Sidebar events list
             *
             * @param  {[type]} ev   [description]
             * @param  {[type]} type [description]
             */
            Sidebar.prototype.onButtonClick = function(ev, type) {
                var $annotationItem = $($(ev.target).closest('li'));
                if (type === 'delete') {
                    return this.annotator.deleteAnnotation($annotationItem.data('annotation'));
                } else if (type === 'edit') {
                    // Add the editor to the annotation's edit container
                    var $editContainer = $($annotationItem.find('.documentpreview-annotation-edit-container'));
                    var $annotationText = $($annotationItem.find('.documentpreview-annotation-text'));
                    this.editor.element.appendTo($editContainer);

                    // Show the edit container and hide the annotation text
                    $editContainer.show();
                    $annotationText.hide();

                    this.editor.show();
                }
            };

            /**
             * Submit every field of the editor when the annotation is saved
             */
            Sidebar.prototype.saveAnnotation = function() {
                var editor = this.editor;
                if (!editor) {
                    editor = this.annotator.editor;
                }

                for (i = 0; i < editor.fields.length; i++) {
                    var field = editor.fields[i];
                    field.submit(field.element, editor.annotation);
                }

                editor.publish('save', [editor.annotation]);
            };

            /**
             * Hide the editor container and show the annotation text when the edit from is hidden
             */
            Sidebar.prototype.onEditorHide = function(ev) {
                var $annotationItem = $($(this).closest('li'));
                $('.documentpreview-annotation-edit-container', $annotationItem).hide();
                $('.documentpreview-annotation-text', $annotationItem).show();
                $('.documentpreview-annotation-actions', $annotationItem).show();
            };

            /**
             * Render the annotations list when the annotation viewer is shown and no editing or
             * creating of annotations is going on.
             *
             * @param  {[type]} viewer     [description]
             * @param  {[type]} annotation [description]
             */
            Sidebar.prototype.onAnnotationViewerShown = function(viewer, annotations) {
                // Hide the default viewer
                viewer.hide();

                // If we're editing or creating a new annotation we don't do anything
                if (!$('#documentpreview-sidebar textarea').is(':visible')) {
                    // Render the list of annotations
                    this.renderAnnotationsList(viewer, annotations);
                    // Show the list of annotations
                    this.showAnnotationsList();
                }
            };

            /**
             * Render the annotations in the sidebar and show them
             *
             * @param  {[type]} viewer      [description]
             * @param  {[type]} annotations [description]
             */
            Sidebar.prototype.renderAnnotationsList = function(viewer, annotations) {
                // Get the template and target container and render the template
                $container = $(Annotator.Plugin.Sidebar.prototype.options.container);
                viewTemplate = Annotator.Plugin.Sidebar.prototype.options.viewTemplate;
                oaeUtil.template().render(viewTemplate, {
                    'annotations': annotations
                }, $container);

                // Store the annotation data on the list items for future reference
                $container.find('li').each(function(index, listItem) {
                    $(listItem).data('annotation', annotations[index]);
                });
            };


            ////////////////////
            // NEW ANNOTATION //
            ////////////////////

            /**
             * Show the editor in the sidebar
             *
             * @param  {[type]} annotation [description]
             */
            Annotator.prototype.showEditor = function(annotation) {
                // Show the new annotation container and hide the list
                $('.documentpreview-new-annotation-container').show();
                $('.documentpreview-annotations-list').hide();

                // Add the editor to the container
                $('.documentpreview-new-annotation-container').html(this.editor.element);

                // Load the annotation into the container
                this.editor.load(annotation);

                this.publish('annotationEditorShown', [this.editor, annotation]);
                return this;
            };

            /**
             * Set up the editor and show it in the sidebar when the 'adder' icon is clicked
             * after selecting text to annotate.
             */
            Annotator.prototype.onAdderClick = function() {
                // Set up the editor for the new annotation
                this._setupEditor();

                // Hide the adder button
                this.adder.hide();

                // Create the initial annotation object
                var annotation = this.setupAnnotation(this.createAnnotation());

                // Add a class to the selected quote to indicate it's being annotated
                $(annotation.highlights).addClass('annotator-hl-temporary');

                var cleanup = (function(_this) {
                    return function() {
                        // Show the new annotation container and hide the list
                        $('.documentpreview-new-annotation-container').hide();
                        $('.documentpreview-annotations-list').show();
                        _this.unsubscribe('annotationEditorHidden', cancel);
                        return _this.unsubscribe('annotationEditorSubmit', save);
                    };
                })(this);

                var save = (function(_this) {
                    return function() {
                        cleanup();
                        $(annotation.highlights).removeClass('annotator-hl-temporary');
                        return _this.publish('annotationCreated', [annotation]);
                    };
                })(this);

                var cancel = (function(_this) {
                    return function() {
                        cleanup();
                        return _this.deleteAnnotation(annotation);
                    };
                })(this);

                this.subscribe('annotationEditorHidden', cancel);
                this.subscribe('annotationEditorSubmit', save);

                // Show the editor
                return this.showEditor(annotation);
            };


            ///////////////////////
            // UPDATE ANNOTATION //
            ///////////////////////

            /**
             * Send out the `annotationUpdated` event which will update the annotation in the database
             *
             * @param  {[type]} annotation [description]
             */
            Sidebar.prototype.onEditorSubmit = function(annotation) {
                // Update the list item associated to the annotation
                $('li[data-id="' + annotation.id + '"] .documentpreview-annotation-text').html(oaeUtil.security().encodeForHTMLWithLinks(annotation.text).replace(/\n/g, '<br/>'));
                return this.publish('annotationUpdated', [annotation]);
            };

            /**
             * Catch the `edit` button click in the Sidebar
             *
             * @param  {[type]} ev [description]
             */
            Sidebar.prototype.onEditClick = function(ev) {
                // Set up the editor for this annotation
                this._setupEditor();

                // Stash the annotation object
                this.editor.annotation = $($(ev.target).closest('li')).data('annotation');

                // Load the editor fields
                for (i = 0; i < this.editor.fields.length; i++) {
                    var field = this.editor.fields[i];
                    field.load(field.element, this.editor.annotation);
                }

                // Hide the annotation controls before going into edit mode
                $(ev.target).closest('.documentpreview-annotation-actions').hide();

                // Continue the event chain
                return this.onButtonClick(ev, 'edit');
            };


            /////////////////////////
            // REPLY TO ANNOTATION //
            /////////////////////////

            Sidebar.prototype.onReplyClick = function(ev) {
                // Get the annotation that's being replied to
                var replyToAnnotation = $(ev.target).closest('li').data('annotation');

                // Set up the editor for the reply
                this.annotator._setupEditor();

                // Create the initial annotation object
                var annotation = this.annotator.setupAnnotation(this.annotator.createAnnotation());

                // Apply the same highlights, ranges and quote to the reply
                annotation.highlights = replyToAnnotation.highlights;
                annotation.ranges = replyToAnnotation.ranges;
                annotation.quote = replyToAnnotation.quote;

                // Add a class to the selected quote to indicate it's being annotated
                $(annotation.highlights).addClass('annotator-hl-temporary');

                var cleanup = (function(_this) {
                    return function() {
                        // Show the new annotation container and hide the list
                        $('.documentpreview-new-annotation-container').hide();
                        $('.documentpreview-annotations-list').show();
                        _this.unsubscribe('annotationEditorHidden', cancel);
                        return _this.unsubscribe('annotationEditorSubmit', save);
                    };
                })(this);

                var save = (function(_this) {
                    return function() {
                        cleanup();
                        $(annotation.highlights).removeClass('annotator-hl-temporary');
                        return _this.publish('annotationCreated', [annotation]);
                    };
                })(this);

                var cancel = (function(_this) {
                    return function() {
                        cleanup();
                        return _this.deleteAnnotation(annotation);
                    };
                })(this);

                this.subscribe('annotationEditorHidden', cancel);
                this.subscribe('annotationEditorSubmit', save);

                // Show the editor
                return this.annotator.showEditor(annotation);
            };

            ////////////
            // DELETE //
            ////////////

            /**
             * Catch the `delete` button click in the Sidebar
             *
             * @param  {[type]} ev [description]
             */
            Sidebar.prototype.onDeleteClick = function(ev) {
                return this.onButtonClick(ev, 'delete');
            };

            /**
             * Remove a deleted annotation from the annotations list
             *
             * @param  {[type]} annotation [description]
             */
            Sidebar.prototype.onAnnotationDeleted = function(annotation) {
                var annotationItem = $('li[data-id="' + annotation.id + '"]');
                annotationItem.remove();
            };

            return Sidebar;

        })(Annotator.Plugin);

    }).call(this);
});
