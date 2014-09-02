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

define(['jquery', 'oae.api.util', 'oae.api.i18n', 'oae.api.push', 'annotator', 'jquery.autosize'], function (jQuery, oaeUtil, i18nAPI, pushAPI) {
    (function() {
        var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
            __hasProp = {}.hasOwnProperty,
            __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        Annotator.Plugin.Sidebar = (function(_super) {
            __extends(Sidebar, _super);

            // Bind the events associated to the Sidebar
            Sidebar.prototype.events = {
                'annotationCreated': 'onAnnotationCreated',
                'annotationDeleted': 'onAnnotationDeleted',
                'annotationsLoaded': 'annotationsLoaded',
                'annotationViewerShown': 'onAnnotationViewerShown',
                'beforeAnnotationCreated': 'beforeAnnotationCreated',
                '.documentpreview-annotation-delete click': 'onDeleteClick',
                '.documentpreview-annotation-edit click': 'onEditClick',
                '.documentpreview-annotation-reply click': 'onReplyClick',
                '.annotator-save click': 'saveAnnotation'
            };

            // Set default values for field, editor, input and options
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

            // Set the HTML structure for the adder button
            Annotator.prototype.html.adder = '<div class="documentpreview-annotator-adder annotator-adder"><button class="btn btn-link"><i class="fa fa-edit"><span class="sr-only">Annotate</span></i></button></div>';

            /**
             * Override keyboard events so that only the escape key is captured
             *
             * @param  {Event}    ev    Standard jQuery keyboard event
             */
            Annotator.Editor.prototype.processKeypress = function(ev) {
                if (ev.keyCode === 27) {
                    return this.hide();
                }
            };

            /**
             * Check if the selection occured inside of the annotator container and show the
             * adder pop-over if it did.
             *
             * @param  {Event}    ev    Standard jQuery `mouseup` event
             */
            Annotator.prototype.checkForEndSelection = function(ev) {
                // If the selection didn't happen inside of the annotator container, ignore it
                if (!$(ev.target).closest('#documentpreview-content-container').length) {
                    return;
                }

                this.mouseIsDown = false;
                this.selectedRanges = this.getSelectedRanges();
                ranges = this.selectedRanges;
                for (var i = 0; i < ranges.length; i++) {
                    var range = ranges[i];
                    var container = range.commonAncestor;
                    if ($(container).hasClass('annotator-hl')) {
                        container = $(container).parents('[class!=annotator-hl]')[0];
                    }
                    if (this.isAnnotator(container)) {
                        return;
                    }
                }
                if (ev && this.selectedRanges.length) {
                    return this.adder.css(Annotator.Util.mousePosition(ev, this.wrapper[0])).show();
                } else {
                    return this.adder.hide();
                }
            };

            /**
             * Validate the provided Sidebar options and bind events to custom Sidebar functions
             *
             * @param  {jQuery}    element    The element to which the annotator is applied
             * @param  {Object}    options    The configuration options passed into the Sidebar
             */
            function Sidebar(element, options) {
                console.log(element, options);
                if (!options.container) {
                    throw new Error('A valid side bar container should be provided');
                }
                if (!options.viewTemplate) {
                    throw new Error('A valid view template should be provided');
                }
                if (!options.editTemplate) {
                    throw new Error('A valid edit template should be provided');
                }

                this.onAnnotationCreated = __bind(this.onAnnotationCreated, this);
                this.onAnnotationDeleted = __bind(this.onAnnotationDeleted, this);
                this.annotationsLoaded = __bind(this.annotationsLoaded, this);
                this.onAnnotationViewerShown = __bind(this.onAnnotationViewerShown, this);
                this.beforeAnnotationCreated = __bind(this.beforeAnnotationCreated, this);
                this.onDeleteClick = __bind(this.onDeleteClick, this);
                this.onEditClick = __bind(this.onEditClick, this);
                this.onReplyClick = __bind(this.onReplyClick, this);
                this.saveAnnotation = __bind(this.saveAnnotation, this);
                this.onEditorSubmit = __bind(this.onEditorSubmit, this);
                this.onAdderClick = __bind(this.onAdderClick, this);

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
                renderAnnotationsList();
                hideAnnotationsList();

                // Hide the annotations panel when the 'x' is clicked
                $('body').on('click', '#documentpreview-annotator-close', hideAnnotationsList);

                // Toggle the annotations list when the edit button is clicked
                $('body').on('click', '#documentpreview-toggle-annotator', toggleAnnotationsList);

                // Hook into push events
                setUpPushNotifications();
            };


            ////////////////////////
            // PUSH NOTIFICATIONS //
            ////////////////////////

            /**
             * Add the newly created annotation, coming in over websocket, to the page
             *
             * @param  {Object}    annotation     Object representing the created annotation
             * @param  {User}      userProfile    A user object representing the user that created the annotation
             */
            var annotationCreated = function(annotation, userProfile) {
                var annotatorRoot = $('.annotator-wrapper')[0];
                var normedRanges = [];
                for (var i = 0; i < annotation.ranges.length; i++) {
                    normedRanges.push(Annotator.Range.sniff(annotation.ranges[i]).normalize(annotatorRoot));
                }
                annotation.quote = [];
                annotation.ranges = [];
                annotation.highlights = [];
                for (var ii = 0; ii < normedRanges.length; ii++) {
                    normedRange = normedRanges[ii];
                    annotation.ranges.push(normedRange.serialize(annotatorRoot, '.annotator-hl'));
                    $.merge(annotation.highlights, Annotator.prototype.highlightRange(normedRange));
                }

                $(annotation.highlights).data('annotation', annotation);

                Sidebar.prototype.createAnnotationReference(annotation);
            };

            /**
             * Update the annotation, coming in over websocket, in the page
             *
             * @param  {Object}    annotation    Object representing the updated annotation
             */
            var annotationUpdated = function(annotation) {
                $('.annotator-hl.' + annotation.oaeId).data('annotation', annotation);
            };

            /**
             * Remove the deleted annotation, coming in over websocket, from the page
             *
             * @param  {Object}    annotation    Object representing the deleted annotation
             */
            var annotationDeleted = function(annotation) {
                annotation = $('.annotator-hl.' + annotation.oaeId).data('annotation');
                if (annotation && annotation.highlights !== null) {
                    for (var i = 0; i < annotation.highlights.length; i++) {
                        var highlight = annotation.highlights[i];
                        if (highlight.parentNode === null) {
                            continue;
                        }
                        $(highlight).replaceWith(highlight.childNodes);
                    }
                }
            };

            /**
             * Set up push notifications
             */
            var setUpPushNotifications = function() {
                var contentId = Annotator.Plugin.Sidebar.prototype.options.contentProfile.id;
                var signature = Annotator.Plugin.Sidebar.prototype.options.contentProfile.signature;

                // Subscribe to push notifications for the content item
                pushAPI.subscribe(contentId, 'activity', signature, 'internal', false, function(activity) {
                    // If the activity was generated by the current user we ignore it
                    // TODO: Change `activity.object.fullannotation` to whatever the backend will eventually return as the full annotation object
                    var annotation = activity.object.fullannotation;
                    var userProfile = Annotator.Plugin.Sidebar.prototype.options.userProfile;

                    if (annotation.createdBy.id === userProfile.id) {
                        return;
                    }

                    if (activity['oae:activityType'] === 'annotation-create') {
                        annotationCreated(annotation, userProfile);
                    } else if (activity['oae:activityType'] === 'annotation-update') {
                        annotationUpdated(annotation);
                    } else if (activity['oae:activityType'] === 'annotation-delete') {
                        annotationDeleted(annotation);
                    }
                });
            };


            ///////////////
            // UTILITIES //
            ///////////////

            /**
             * Add a unique oae ID to the annotations when they are loaded
             *
             * @param  {Object[]}    annotations     Array of annotations that are loaded
             */
            Sidebar.prototype.annotationsLoaded = function(annotations) {
                $.each(annotations, function(i, annotation) {
                    $(annotation.highlights).addClass(annotation.oaeId);
                });
            };

            /**
             * Toggle the annotations list
             */
            var toggleAnnotationsList = function() {
                if ($('#documentpreview-sidebar').is(':visible')) {
                    hideAnnotationsList();
                } else {
                    showAnnotationsList();
                }
            };

            /**
             * Hide the annotations list
             */
            var hideAnnotationsList = function() {
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
            var showAnnotationsList = function() {
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
                        showAnnotationsList();
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
             * @param  {Event}     ev      Standard jQuery click event
             * @param  {String}    type    The type of button that was clicked on. One of 'delete' or 'edit'
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
            Sidebar.prototype.onEditorHide = function() {
                var $annotationItem = $($(this).closest('li'));
                $('.documentpreview-annotation-edit-container', $annotationItem).hide();
                $('.documentpreview-annotation-text', $annotationItem).show();
                $('.documentpreview-annotation-actions', $annotationItem).show();
            };

            /**
             * Render the annotations list when the annotation viewer is shown and no editing or
             * creating of annotations is going on.
             *
             * @param  {Viewer}      viewer          Instance of the annotation viewer
             * @param  {Object[]}    annotations     Array of annotations that are loaded
             */
            Sidebar.prototype.onAnnotationViewerShown = function(viewer, annotations) {
                // Hide the default viewer
                viewer.hide();

                // If we're editing or creating a new annotation we don't do anything
                if (!$('#documentpreview-sidebar textarea').is(':visible')) {
                    // Render the list of annotations
                    renderAnnotationsList(annotations);
                    // Show the list of annotations
                    showAnnotationsList();
                }
            };

            /**
             * Render the annotations in the sidebar
             *
             * @param  {Object[]}    annotations     Array of annotations that are loaded
             */
            renderAnnotationsList = function(annotations) {
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

                $('.documentpreview-annotations-list li').on('mouseover', function() {
                    var annotation = $(this).data('annotation');
                    $('.annotator-hl.' + annotation.oaeId).addClass('annotator-hl-hover');
                });

                $('.documentpreview-annotations-list li').on('mouseout', function() {
                    var annotation = $(this).data('annotation');
                    $('.annotator-hl.' + annotation.oaeId).removeClass('annotator-hl-hover');
                });
            };


            ////////////////////
            // NEW ANNOTATION //
            ////////////////////

            /**
             * Generate a unique ID for the annotation to be identified with.
             *
             * @param  {Object}    annotation    Object representing the annotation to generate a unique ID for
             */
            Sidebar.prototype.beforeAnnotationCreated = function(annotation) {
                annotation.oaeId = oaeUtil.generateId();
                return annotation;
            };

            /**
             * Apply the annotation's unique ID to its highlights
             *
             * @param  {Object}    annotation    Object representing the annotation to add the unique ID to in the DOM
             */
            Sidebar.prototype.createAnnotationReference = function(annotation) {
                $(annotation.highlights).addClass(annotation.oaeId);
            };

            /**
             * Right after the annotation is created we need to add a unique reference ID
             * to the generated HTML.
             *
             * @param  {Object}    annotation    Object representing the created annotation
             */
            Sidebar.prototype.onAnnotationCreated = function(annotation) {
                annotation.createdBy = require('oae.core').data.me;
                annotation.created = Date.now();
                this.createAnnotationReference(annotation);
                renderAnnotationsList([annotation]);
            };

            /**
             * Show the editor in the sidebar
             *
             * @param  {Object}    annotation    Object representing the annotation to show the editor for
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

                // Clean up after canceling or saving
                var cleanup = (function(_this) {
                    return function() {
                        // Show the new annotation container and hide the list
                        $('.documentpreview-new-annotation-container').hide();
                        $('.documentpreview-annotations-list').show();
                        _this.unsubscribe('annotationEditorHidden', cancel);
                        return _this.unsubscribe('annotationEditorSubmit', save);
                    };
                })(this);

                // Save the editor's fields
                var save = (function(_this) {
                    return function() {
                        cleanup();
                        $(annotation.highlights).removeClass('annotator-hl-temporary');
                        return _this.publish('annotationCreated', [annotation]);
                    };
                })(this);

                // Cancel editing
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
             * @param  {Object}    annotation    Object representing the annotation to create
             */
            Sidebar.prototype.onEditorSubmit = function(annotation) {
                // Update the list item associated to the annotation
                $('li[data-id="' + annotation.oadId + '"] .documentpreview-annotation-text').html(oaeUtil.security().encodeForHTMLWithLinks(annotation.text).replace(/\n/g, '<br/>'));
                // Render the annotions list with the updated annotation
                renderAnnotationsList([annotation]);
                return this.publish('annotationUpdated', [annotation]);
            };

            /**
             * Catch the `edit` button click in the Sidebar
             *
             * @param  {Event}    ev    Standard jQuery click event
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

            /**
             * Set up the editor and show it in the sidebar when the reply icon is clicked for
             * an annotation.
             *
             * @param  {Event}    ev    Standard jQuery click event
             */
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

                var tempId = oaeUtil.generateId();

                /**
                 * Wrap the most inner child of the selected text to annotate into a span and apply the
                 * annotator temporary classes to it to achieve the same styling.
                 *
                 * @param  {[type]} highlights [description]
                 */
                var wrapInnerChild = function(highlights) {
                    $.each($(highlights), function(index, highlight) {
                        if ($(highlight).children().length) {
                            // Drill down further
                            wrapInnerChild($(highlight).children());
                        } else {
                            // We're down to the deepest level, wrap the element
                            $(highlight).wrapInner('<span class="annotator-hl annotator-hl-temporary ' + tempId + '">');
                        }
                    });
                };

                wrapInnerChild(annotation.highlights);

                // Get the correct highlights after wrapping the original ones
                annotation.highlights = $('.' + tempId);

                // Clean up after canceling or saving
                var cleanup = (function(_this) {
                    return function() {
                        // Show the new annotation container and hide the list
                        $('span.annotator-hl-temporary').removeClass('annotator-hl-temporary');
                        $('.documentpreview-new-annotation-container').hide();
                        $('.documentpreview-annotations-list').show();
                        _this.unsubscribe('annotationEditorHidden', cancel);
                        return _this.unsubscribe('annotationEditorSubmit', save);
                    };
                })(this);

                // Save the editor's fields
                var save = (function(_this) {
                    console.log('save');
                    return function() {
                        console.log('save it');
                        cleanup();
                        return _this.publish('annotationCreated', [annotation]);
                    };
                })(this);

                // Cancel editing
                var cancel = (function(_this) {
                    return function() {
                        // Unwrap the highlights after cancelling
                        $(annotation.highlights).unwrap();
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
             * @param  {Event}    ev    Standard jQuery click event
             */
            Sidebar.prototype.onDeleteClick = function(ev) {
                return this.onButtonClick(ev, 'delete');
            };

            /**
             * Remove a deleted annotation from the annotations list
             *
             * @param  {Object}    annotation     Object representing the deleted annotation
             */
            Sidebar.prototype.onAnnotationDeleted = function(annotation) {
                var annotationItem = $('li[data-id="' + annotation.oaeId + '"]');
                annotationItem.remove();
            };

            return Sidebar;

        })(Annotator.Plugin);

    }).call(this);
});
