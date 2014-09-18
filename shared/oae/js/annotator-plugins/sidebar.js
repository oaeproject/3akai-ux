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
        var __bind = function(fn, me) { return function() { return fn.apply(me, arguments); }; },
            __hasProp = {}.hasOwnProperty,
            __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
            __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        Annotator.Plugin.Sidebar = (function(_super) {
            __extends(Sidebar, _super);

            // Used to be able to provide the right context in events that don't have it. e.g. delete/edit/reply functionality
            var that = null;
            // Keep track of the zoom level to be able to reverse scale the adder
            var documentZoomLevel = 1;

            // Bind the events associated to the Sidebar
            Sidebar.prototype.events = {
                'annotationDeleted': 'onAnnotationDeleted',
                'annotationsLoaded': 'annotationsLoaded',
                'annotationEditorShown': 'onAnnotationEditorShown',
                'annotationEditorHidden': 'onAnnotationEditorHidden',
                'annotationViewerShown': 'onAnnotationViewerShown',
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
                                                      '<button type="button" class="btn btn-primary pull-right annotator-save annotator-focus" disabled>' + i18nAPI.translate('__MSG__SAVE__') + '</button>' +
                                                  '</div>' +
                                              '</form>';

            // We don't need orientation checking, the controls should always be below the textarea
            // when the editor is shown
            Annotator.Editor.prototype.checkOrientation = function() {
                var list = this.element.find('ul');
                var controls = this.element.find('.annotator-controls');
                controls.insertAfter(list);
                return this;
            };

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

            // Set the HTML structure for the adder button
            Annotator.prototype.html.adder = '<div class="documentpreview-annotator-adder annotator-adder"><button class="btn btn-link"><i class="fa fa-edit"><span class="sr-only">' + i18nAPI.translate('__MSG__ANNOTATE__') + '</span></i></button></div>';

            // Override the `onHighlightMouseover` function to not show the viewer on mouse over
            Annotator.prototype.onHighlightMouseover = function() {
                return;
            };

            // Override the `startViewerHideTimer` function as we don't have a mouseover
            Annotator.prototype.startViewerHideTimer = function() {
                return;
            };

            /**
             * Check if the selection occured inside of the annotator container and show the
             * adder pop-over if it did.
             *
             * @param  {Event}    ev    Standard jQuery `mouseup` event
             */
            Annotator.prototype.checkForEndSelection = function(ev) {
                // The mouseup event also fires for clicks on the adder button so we
                // need to filter these out
                if (!$(ev.target).closest('.annotator-adder').length) {
                    var isViewer = Annotator.Plugin.Sidebar.prototype.options.contentProfile.isViewer;
                    var isManager = Annotator.Plugin.Sidebar.prototype.options.contentProfile.isManager;

                    // If the selection didn't happen inside of the annotator wrapper or it
                    // was made by a non-member user, ignore it
                    if (!$(ev.target).closest('.annotator-wrapper').length ||
                        $(ev.target).closest('.annotator-wrapper')[0] === $(ev.target)[0] ||
                        (!isViewer && !isManager)) {
                        this.adder.hide();
                        return;
                    }

                    this.mouseIsDown = false;
                    this.selectedRanges = this.getSelectedRanges();
                    ranges = this.selectedRanges;
                    console.log(ranges);
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


                    // If the selection contains a valid range, show the adder button
                    if (ev && this.selectedRanges.length) {
                        // Add a dummy span before the text that will help calculating the position of the adder on the x axis
                        $(this.selectedRanges[0].start).before('<span id="annotator-selection-helper">');

                        // Calculate the scale of the adder button based on the document zoom level
                        var adderScale = 1 / parseFloat(documentZoomLevel, 10);
                        var adderCSS = Annotator.Util.mousePosition(ev, this.wrapper[0]);
                        adderCSS.left = ($('#annotator-selection-helper').offset().left - $(this.adder).parent().offset().left) * adderScale;
                        adderCSS.top = ($(this.selectedRanges[0].start.parentElement).offset().top - $($(ev.target).closest('.pf')).offset().top) * adderScale;
                        adderCSS.transform = 'scale(' + adderScale + ')';

                        // Remove the temporary helper span
                        $('#annotator-selection-helper').remove();

                        // Apply the CSS and show the adder button
                        return this.adder.css(adderCSS).show();
                    } else {
                        // No valid ranges where specified, hide the adder button
                        return this.adder.hide();
                    }
                }
            };

            /**
             * Validate the provided Sidebar options and bind Sidebar functions
             *
             * @param  {jQuery}    element    The element to which the annotator is applied
             * @param  {Object}    options    The configuration options passed into the Sidebar
             */
            function Sidebar(element, options) {
                if (!options.container) {
                    throw new Error('A valid side bar container should be provided');
                }
                if (!options.contentProfile) {
                    throw new Error('A valid content profile should be provided');
                }
                if (!options.editTemplate) {
                    throw new Error('A valid edit template should be provided');
                }
                if (!options.userProfile) {
                    throw new Error('A valid user profile should be provided');
                }
                if (!options.viewTemplate) {
                    throw new Error('A valid view template should be provided');
                }

                this.onAnnotationDeleted = __bind(this.onAnnotationDeleted, this);
                this.annotationsLoaded = __bind(this.annotationsLoaded, this);
                this.onAnnotationViewerShown = __bind(this.onAnnotationViewerShown, this);
                this.saveAnnotation = __bind(this.saveAnnotation, this);
                this.onEditorSubmit = __bind(this.onEditorSubmit, this);
                this.onAdderClick = __bind(this.onAdderClick, this);

                that = this;

                $.extend(Annotator.Plugin.Sidebar.prototype.options, options);
                Sidebar.__super__.constructor.apply(this, arguments);
            }

            /**
             * Initialize the Sidebar plugin
             */
            Sidebar.prototype.pluginInit = function() {
                // Don't run anything if the Annotator is not supported
                if (!Annotator.supported()) {
                    return;
                }

                // Render the initial, empty, annotations list
                renderAnnotationsList();

                // Hide the annotations panel when the 'x' is clicked
                $('body').off('click', '#documentpreview-annotator-close').on('click', '#documentpreview-annotator-close', hideAnnotationsList);

                // Toggle the annotations list when the edit button is clicked
                $('body').off('click', '#documentpreview-toggle-annotator').on('click', '#documentpreview-toggle-annotator', toggleAnnotationsList);

                // Show an annotation when it's clicked
                $('body').off('click', '.annotator-hl').on('click', '.annotator-hl', showClickedAnnotations);

                // Delete an annotation when the delete button is clicked, passing the `that` context which isn't available in the function
                $('body').off('click', '.documentpreview-annotation-delete').on('click', '.documentpreview-annotation-delete', function(ev) {
                    that.onDeleteClick.call(that, ev);
                });

                // Edit an annotation when the edit button is clicked, passing the `that` context which isn't available in the function
                $('body').off('click', '.documentpreview-annotation-edit').on('click', '.documentpreview-annotation-edit', function(ev) {
                    that.onEditClick.call(that, ev);
                });

                // Reply to an annotation when the reply button is clicked, passing the `that` context which isn't available in the function
                $('body').off('click', '.documentpreview-annotation-reply').on('click', '.documentpreview-annotation-reply', function(ev) {
                    that.onReplyClick.call(that, ev);
                });

                // Keep track of the zoom level and hide the adder button when the document is zoomed
                $(document).off('oae.documentpreview.zoom').on('oae.documentpreview.zoom', function(ev, data) {
                    $('.annotator-adder').hide();
                    documentZoomLevel = data.zoom;
                });

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
                // Only add the annotation when the page it's on has been loaded
                if ($('.documentpreview-content-page[data-page-number="' + annotation.pageNumber + '"]').length && !$('.annotator-hl.' + annotation.id).length) {
                    var annotatorRoot = $('.annotator-wrapper')[0];
                    var normedRanges = [];
                    for (var i = 0; i < annotation.ranges.length; i++) {
                        normedRanges.push(Annotator.Range.sniff(annotation.ranges[i]).normalize(annotatorRoot));
                    }

                    annotation.ranges = [];
                    annotation.highlights = [];
                    // Parse the highlights for the annotation and add them to the document
                    for (var ii = 0; ii < normedRanges.length; ii++) {
                        normedRange = normedRanges[ii];
                        annotation.ranges.push(normedRange.serialize(annotatorRoot, '.annotator-hl'));
                        $.merge(annotation.highlights, Annotator.prototype.highlightRange(normedRange));
                    }

                    // Apply the annotation to the highlights
                    $(annotation.highlights).data('annotation', annotation);

                    // Create a reference to the annotation
                    createAnnotationReference(annotation);
                }
            };

            /**
             * Update the annotation, coming in over websocket, in the page
             *
             * @param  {Object}    annotation    Object representing the updated annotation
             */
            var annotationUpdated = function(annotation) {
                // Update the annotation data in the document
                $('.annotator-hl.' + annotation.id).data('annotation', annotation);
                // Update the annotation data in the list
                $('li[data-id="' + annotation.id + '"]').data('annotation', annotation);
                // If the annotation is currently shown in the list, update it
                if ($('li[data-id="' + annotation.id + '"]').length) {
                    $('li[data-id="' + annotation.id + '"] .documentpreview-annotation-text').html(oaeUtil.security().encodeForHTMLWithLinks(annotation.text).replace(/\n/g, '<br/>'));
                }
            };

            /**
             * Remove the deleted annotation, coming in over websocket, from the page
             */
            var annotationDeleted = function() {
                // Get the deleted annotation object
                var annotation = $('.annotator-hl.' + annotation.id).data('annotation');

                // Replace the annotation highlights with the text
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
                pushAPI.subscribe(contentId, 'activity', signature, 'internal', true, function(activity) {
                    // If the activity was generated by the current user or it's not for the page this
                    // instance of the annotator is set up for, we ignore it
                    var userProfile = Annotator.Plugin.Sidebar.prototype.options.userProfile;
                    if (activity.actor.id === userProfile.id) {
                        return;
                    }

                    var annotation = activity.object['oae:annotation'];
                    if (activity['oae:activityType'] === 'annotation-create') {
                        annotationCreated(annotation, userProfile);
                    } else if (activity['oae:activityType'] === 'annotation-update') {
                        annotationUpdated(annotation);
                    } else if (activity['oae:activityType'] === 'annotation-delete') {
                        annotationDeleted();
                    }
                });
            };


            ///////////////
            // UTILITIES //
            ///////////////

            /**
             * Show the appropriate error notification when Store operations go wrong.
             *
             * @param  {Object}    err    Error object containing more information on what went wrong
             */
            Annotator.Plugin.Store.prototype._onError = function(err) {
                var notificationTitle = null;
                var notificationBody = null;

                if (err._action === 'read') {
                    notificationTitle = i18nAPI.translate('__MSG__ANNOTATIONS_NOT_RETRIEVED__');
                    notificationBody = i18nAPI.translate('__MSG__ANNOTATIONS_COULD_NOT_BE_RETRIEVED__');
                } else if (err._action === 'create') {
                    notificationTitle = i18nAPI.translate('__MSG__ANNOTATION_NOT_CREATED__');
                    notificationBody = i18nAPI.translate('__MSG__ANNOTATION_COULD_NOT_BE_CREATED__');
                } else if (err._action === 'update') {
                    notificationTitle = i18nAPI.translate('__MSG__ANNOTATION_NOT_UPDATED__');
                    notificationBody = i18nAPI.translate('__MSG__ANNOTATION_COULD_NOT_BE_UPDATED__');
                } else if (err._action === 'destroy') {
                    notificationTitle = i18nAPI.translate('__MSG__ANNOTATION_NOT_DELETED__');
                    notificationBody = i18nAPI.translate('__MSG__ANNOTATION_COULD_NOT_BE_DELETED__');
                }

                return oaeUtil.notification(notificationTitle, notificationBody, 'error');
            };

            /**
             * Add the annotation's unique ID to the highlights and apply the user's color
             *
             * @param  {Object[]}    annotations     Array of annotations that have been loaded
             */
            Sidebar.prototype.annotationsLoaded = function(annotations) {
                $.each(annotations, function(i, annotation) {
                    // Add the annotations unique ID as a class to the highlights
                    $(annotation.highlights).addClass(annotation.id);
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
                // Only attempt to hide the sidebar when its currently shown
                if ($('#documentpreview-sidebar').is(':visible')) {
                    // Deactivate the toggle button in the toolbar
                    $('#documentpreview-toggle-annotator #documentpreview-annotator-status').toggleClass('active');
                    // Make sure not annotations are being edited or created before we close
                    if ($('#documentpreview-sidebar textarea').is(':visible')) {
                        $('.annotator-cancel').click();
                    }

                    // Reduce the width of the sidebar to zero % so the document can take up all the space
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
                    }, 100);
                }
            };

            /**
             * Show the annotations list
             */
            var showAnnotationsList = function() {
                // Only attempt to show the sidebar when its currently hidden
                if (!$('#documentpreview-sidebar').is(':visible')) {
                    // Activate the toggle button in the toolbar
                    $('#documentpreview-toggle-annotator #documentpreview-annotator-status').toggleClass('active');
                    $('#documentpreview-sidebar').show();

                    // Reduce the width of the document container to 78% to allow the sidebar to take up space
                    $('#documentpreview-content-container').animate({
                        'width': '78%'
                    });
                    setTimeout(function() {
                        $('#documentpreview-sidebar').animate({
                            'opacity': '1',
                            'width': '22%'
                        });
                    }, 100);
                }
            };

            /**
             * Get the child elements of a clicked annotation in the DOM. Multiple annotations made on the same
             * piece of text create a nested structure of span elements.
             *
             * @param  {jQuery}      $highlight    target of jQuery click event that is an `annotator-hl` element
             * @return {Object[]}                  Returns an array of child annotations
             */
            var getAnnotationChildren = function($highlight) {
                var annotations = {};
                var childAnnotations = $highlight.find('.annotator-hl');

                // If there are child annotations, add them to the temporary annotations
                // object that will later be converted into an array. Using an object
                // makes it easy to keep the items unique
                if (childAnnotations.length) {
                    $.each(childAnnotations, function(ii, childAnnotationElement) {
                        var childAnnotation = $(childAnnotationElement).data('annotation');
                        annotations[childAnnotation.id] = childAnnotation;
                    });
                }

                // Convert the object to an Array and return it
                return _.toArray(annotations);
            };

            /**
             * Get the parent elements of a clicked annotation
             *
             * @param  {jQuery}    $highlight    target of jQuery click event that is an `annotator-hl` element
             * @return {Object[]}                Returns an array of parent annotations
             */
            var getAnnotationParents = function($highlight) {
                var annotations = {};
                var parentAnnotations = $highlight.parents('.annotator-hl');

                // If there are parent annotations, add them to the temporary annotations
                // object that will later be converted into an array. Using an object
                // makes it easy to keep the items unique
                if (parentAnnotations.length) {
                    $.each(parentAnnotations, function(ii, parentAnnotationElement) {
                        var parentAnnotation = $(parentAnnotationElement).data('annotation');
                        annotations[parentAnnotation.id] = parentAnnotation;
                    });
                }

                // Convert the object to an Array and return it
                return _.toArray(annotations);
            };

            /**
             * Get the child and parent annotations for the clicked annotation and render them in the list
             *
             * @param {Event}    ev    Standard jQuery click event
             */
            var showClickedAnnotations = function(ev) {
                console.log('clicked highlight');
                // Stop propagation of the click event to only handle one click. This is
                // required as multiple annotations on the same piece of text create
                // a nested structure in the DOM.
                ev.stopPropagation();
                // Get the clicked annotation
                var clickedAnnotation = $(ev.target).data('annotation');
                // Get the children of the clicked annotation
                var childAnnotations = getAnnotationChildren($(ev.target));
                // Get the parents of the clicked annotation
                var parentAnnotations = getAnnotationParents($(ev.target));
                // Render the list of annotations
                renderAnnotationsList(_.union(parentAnnotations, [clickedAnnotation], childAnnotations));
                // Show the list of annotations
                showAnnotationsList();
            };

            /**
             * Get the custom fields for the annotation editor
             */
            var getEditorFields = function() {
                return {
                    type: 'textarea',
                    label: i18nAPI.translate('__MSG__ADD_A_COMMENT__'),
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
                    var annotation = $annotationItem.data('annotation');
                    delete annotation.prototype;

                    // Finally delete the annotation
                    return this.annotator.deleteAnnotation(annotation);
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
                // Get the list item in the sidebar that's was edited
                var $annotationItem = $($(this).closest('li'));
                // Hide the edit container
                $('.documentpreview-annotation-edit-container', $annotationItem).hide();
                // Show the annotation text
                $('.documentpreview-annotation-text', $annotationItem).show();
                // Show the annotation actions
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

                // Don't render and show the list if we're editing or creating a new annotation
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
                var viewTemplate = Annotator.Plugin.Sidebar.prototype.options.viewTemplate;
                var userProfile = Annotator.Plugin.Sidebar.prototype.options.userProfile;
                var contentProfile = Annotator.Plugin.Sidebar.prototype.options.contentProfile;
                oaeUtil.template().render(viewTemplate, {
                    'annotations': annotations,
                    'contentProfile': contentProfile,
                    'userProfile': userProfile
                }, $container);

                // Store the annotation data on the list items for future reference
                $container.find('li').each(function(index, listItem) {
                    $(listItem).data('annotation', annotations[index]);
                });

                // Add a mouseover event to highlight the hovered annotation
                $('.documentpreview-annotations-list li').on('mouseover', function() {
                    var annotation = $(this).data('annotation');
                    $('.annotator-hl.' + annotation.id).addClass('annotator-hl-hover');
                });

                // Add a mouseout event to remove the highlights from the hovered annotation
                $('.documentpreview-annotations-list li').on('mouseout', function() {
                    var annotation = $(this).data('annotation');
                    $('.annotator-hl.' + annotation.id).removeClass('annotator-hl-hover');
                });

                // Remove any lingering highlights that might have stuck around after an update/edit/...
                $('.annotator-hl-hover').removeClass('annotator-hl-hover');
            };


            ////////////////////
            // NEW ANNOTATION //
            ////////////////////

            /**
             * Persist a new annotation to the database and update the UI
             *
             * @param  {Object}    annotation    Object representing the annotation to be created
             */
            Annotator.Plugin.Store.prototype.annotationCreated = function(annotation) {
                this.registerAnnotation(annotation);
                delete annotation.prototype;
                return this._apiRequest('create', annotation, (function(_this) {
                    return function(data) {
                        // Internall update the annotation object
                        _this.updateAnnotation(annotation, data);
                        __extends(annotation, data);
                        // Create a reference to the annotation
                        createAnnotationReference(annotation);
                        // New annotations won't have child annotations in the DOM so only fetch
                        // the parents and render the list
                        var parentAnnotations = getAnnotationParents($(annotation.highlights[0]));
                        renderAnnotationsList(_.union(parentAnnotations, [annotation]));
                        // Scroll the sidebar down to the newly added annotation
                        return $('#documentpreview-sidebar').animate({
                            scrollTop: $('#documentpreview-sidebar li[data-id="' + annotation.id + '"]').offset().top
                        }, 500);
                    };
                })(this));
            };

            /**
             * Apply the annotation's unique ID to its highlights
             *
             * @param  {Object}    annotation    Object representing the annotation to add the unique ID to in the DOM
             */
            var createAnnotationReference = function(annotation) {
                $(annotation.highlights).addClass(annotation.id);
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

            Sidebar.prototype.onAnnotationEditorShown = function(editor, annotation) {
                console.log('annotation editor shown', editor, annotation);
                $(editor.element).on('keyup', 'textarea', function() {
                    if ($(this).val()) {
                        $('form .annotator-controls button.annotator-save').prop('disabled', false);
                    } else {
                        $('form .annotator-controls button.annotator-save').prop('disabled', true);
                    }
                });
            };

            Sidebar.prototype.onAnnotationEditorHidden = function(editor, annotation) {
                $('form .annotator-controls button.annotator-save').prop('disabled', true);
            };

            /**
             * Set up the editor and show it in the sidebar when the adder button is clicked
             * after selecting text to annotate
             */
            Annotator.prototype.onAdderClick = function() {
                // Set up the editor for the new annotation
                this._setupEditor();

                // Hide the adder button
                this.adder.hide();

                // Create the initial annotation object
                var annotation = this.setupAnnotation(this.createAnnotation());
                annotation.pageNumber = $($(annotation.highlights).closest('.documentpreview-content-page')).data('page-number');

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

                /**
                 * Cancel creating a new annotation when the document is clicked
                 *
                 * @param  {Event}    ev    Standard jQuery click event
                 */
                var cancelEditAfterClick = function(ev) {
                    if (!$(ev.target).closest('.documentpreview-new-annotation-container').length &&
                        !$(ev.target).closest('.annotator-adder').length) {
                        cancel.apply(that);
                        $(document).off('click', cancelEditAfterClick);
                    }
                };

                this.subscribe('annotationEditorHidden', cancel);
                this.subscribe('annotationEditorSubmit', save);
                $(document).off('click', cancelEditAfterClick).on('click', cancelEditAfterClick);

                // Show the editor
                return this.showEditor(annotation);
            };


            ///////////////////////
            // UPDATE ANNOTATION //
            ///////////////////////

            /**
             * Update the annotation highlights after an annotation has been updated
             *
             * @param  {Object}    annotation    The annotation object before the update
             * @param  {Object}    data          The annotation object after the update
             */
            Annotator.Plugin.Store.prototype.updateAnnotation = function(annotation, data) {
                $.extend(annotation, data);
                return $(annotation.highlights).data('annotation', annotation);
            };

            /**
             * Store the updated annotation
             *
             * @param  {Object}    annotation    The updated annotation object to be stored
             */
            Annotator.Plugin.Store.prototype.annotationUpdated = function(annotation) {
                delete annotation.prototype;
                return this._apiRequest('update', annotation, (function(_this) {
                    return function(data) {
                        _this.updateAnnotation(annotation, data);
                        __extends(annotation, data);
                        // Create a reference to the annotation
                        createAnnotationReference(annotation);
                        // Get the parents of the clicked annotation and render the updated list
                        var parentAnnotations = getAnnotationParents($(annotation.highlights[0]));
                        return renderAnnotationsList(_.union(parentAnnotations, [annotation]));
                    };
                })(this));
            };

            /**
             * Update the associated annotation after the editor has been submitted
             *
             * @param  {Object}    annotation    Object representing the annotation to create/update
             */
            Sidebar.prototype.onEditorSubmit = function(annotation) {
                // Update the list item associated to the annotation
                $('li[data-id="' + annotation.oadId + '"] .documentpreview-annotation-text').html(oaeUtil.security().encodeForHTMLWithLinks(annotation.text).replace(/\n/g, '<br/>'));
                // Render the annotions list with the updated annotation
                renderAnnotationsList([annotation]);
                return this.publish('annotationUpdated', [annotation]);
            };

            /**
             * Catch the `edit` button click in the Sidebar and kick off showing the editor
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
                annotation.pageNumber = $($(replyToAnnotation.highlights).closest('.documentpreview-content-page')).data('page-number');

                /**
                 * Wrap the most inner child of the selected text to annotate into a span and apply the
                 * annotator temporary classes to it to achieve the same styling.
                 *
                 * @param  {Object[]}    highlights    The highlights to wrap into a span element
                 */
                var wrapInnerChild = function(highlights) {
                    $.each($(highlights), function(index, highlight) {
                        if ($(highlight).children().length) {
                            // Drill down further
                            wrapInnerChild($(highlight).children());
                        } else {
                            // We're down to the deepest level, wrap the element
                            $(highlight).wrapInner('<span class="annotator-hl annotator-hl-temporary">');
                        }
                    });
                };

                wrapInnerChild(annotation.highlights);

                // Get the correct highlights after wrapping the original ones
                annotation.highlights = $('.annotator-hl-temporary');

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
                    return function() {
                        cleanup();
                        return _this.publish('annotationCreated', [annotation]);
                    };
                })(this);

                // Cancel editing
                var cancel = (function(_this) {
                    return function() {
                        // Unwrap the highlights after cancelling
                        $(annotation.highlights).contents().unwrap();
                        cleanup();
                        return _this.annotator.deleteAnnotation(annotation);
                    };
                })(this);

                this.subscribe('annotationEditorHidden', cancel);
                this.subscribe('annotationEditorSubmit', save);

                // Show the editor
                return this.annotator.showEditor(annotation);
            };


            ///////////////////////
            // DELETE ANNOTATION //
            ///////////////////////

            /**
             * Delete the annotation through the Store and update cached references
             *
             * @param  {Object}    annotation    The deleted annotation object
             */
            Annotator.Plugin.Store.prototype.annotationDeleted = function(annotation) {
                if (annotation.text) {
                    return this._apiRequest('destroy', annotation, ((function(_this) {
                        return function() {
                            return _this.unregisterAnnotation(annotation);
                        };
                    })(this)));
                }
            };

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
                var $annotationItem = $('li[data-id="' + annotation.id + '"]');
                $annotationItem.remove();
            };

            return Sidebar;

        })(Annotator.Plugin);
    }).call(this);
});
