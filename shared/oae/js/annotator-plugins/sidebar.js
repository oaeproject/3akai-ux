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

            // Used to be able to provide the right context in events that don't have it. e.g. delete/edit functionality
            var that = null;
            // Keep track of the zoom level to be able to reverse scale the adder
            var documentZoomLevel = 1;
            // Whether or not the annotator is fully supported on the device
            var sidebarSupported = !(oaeUtil.isHandheldDevice() || oaeUtil.isIos());

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
             * Check if the start of the selection occured inside of the document and set the
             * appropriate variables
             *
             * @param  {Event}    ev    Standard jQuery mousedown event
             */
            Annotator.prototype.checkForStartSelection = function(ev) {
                if (!(ev && this.isAnnotator(ev.target))) {
                    this.startViewerHideTimer();
                }

                this.mouseIsDown = !!$(ev.target).closest('.pc').length;
            };

            /**
             * Check if the selection occured inside of the annotator container and show the
             * adder pop-over if it did.
             *
             * @param  {Event}    ev    Standard jQuery `mouseup` event
             */
            Annotator.prototype.checkForEndSelection = function(ev) {
                // If the mouseup event was triggered after a mousedown event was triggered on an
                // element that isn't inside of the document preview, don't do any checking
                // for end of selection as it would result in unwanted showing of the adder button
                if (!this.mouseIsDown) {
                    this.adder.hide();
                    return;
                }

                // The mouseup event also fires for clicks on the adder button so we
                // need to filter these out
                if (!$(ev.target).closest('.annotator-adder').length) {
                    var isViewer = Annotator.Plugin.Sidebar.prototype.options.contentProfile.isViewer;
                    var isManager = Annotator.Plugin.Sidebar.prototype.options.contentProfile.isManager;

                    // If the user making the selection isn't allowed to annotate, don't show the
                    // adder button
                    if (!isViewer && !isManager) {
                        this.adder.hide();
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


                    // If the selection contains a valid range, show the adder button
                    if (ev && this.selectedRanges.length) {

                        var adderCSS = Annotator.Util.mousePosition(ev, this.wrapper[0]);
                        // Calculate the scale of the adder button based on the document zoom level
                        var adderScale = 1 / parseFloat(documentZoomLevel, 10);
                        adderCSS.transform = 'scale(' + adderScale + ')';
                        adderCSS.left = adderCSS.left * adderScale;
                        adderCSS.top = adderCSS.top * adderScale;

                        // If the mouse was released inside of the document, position the adder button
                        // where the mouse was released
                        if ($(ev.target).closest('.pc').length) {
                            return this.adder.css(adderCSS).show();
                        // If the mouse was released outside of the document, position the
                        // adder over the last piece of selected text
                        } else {
                            adderCSS.transform = 'scale(' + adderScale + ')';

                            // Apply the CSS and show the adder button
                            return this.adder.css(adderCSS).show();
                        }
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
                if (!options.contentProfile) {
                    throw new Error('A valid content profile should be provided');
                }
                if (!options.userProfile) {
                    throw new Error('A valid user profile should be provided');
                }

                this.onAnnotationDeleted = __bind(this.onAnnotationDeleted, this);
                this.annotationsLoaded = __bind(this.annotationsLoaded, this);
                this.onAnnotationEditorShown = __bind(this.onAnnotationEditorShown, this);
                this.onAnnotationEditorHidden = __bind(this.onAnnotationEditorHidden, this);
                this.onAnnotationViewerShown = __bind(this.onAnnotationViewerShown, this);
                this.saveAnnotation = __bind(this.saveAnnotation, this);
                this.onEditorSubmit = __bind(this.onEditorSubmit, this);

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

                // Depending on the device some actions aren't supported
                if (sidebarSupported) {
                    // Hide the annotations panel when the 'x' is clicked
                    $('#documentpreview-sidebar').off('click', '#documentpreview-annotator-close').on('click', '#documentpreview-annotator-close', hideAnnotationsList);

                    // Toggle the annotations list when the toggle is clicked
                    $('body').off('click', '#documentpreview-toggle-annotator').on('click', '#documentpreview-toggle-annotator', toggleAnnotationsList);

                    // Delete an annotation when the delete button is clicked, passing the `that` context which isn't available in the function
                    $('body').off('click', '#deleteannotation-delete').on('click', '#deleteannotation-delete', function(ev) {
                        that.onDeleteClick.call(that, ev);
                    });

                    // Deselect the selected annotation and close the sidebar when the user clicks outside of the document
                    $('body').off('click', '#documentpreview-content').on('click', '#documentpreview-content', function(ev) {
                        var clickedSidebar = !!$(ev.target).closest('#documentpreview-sidebar').length;
                        var clickedDocument = !!$(ev.target).closest('.pc').length;
                        var clickedAdder = !!$(ev.target).closest('.annotator-adder').length;

                        if (!clickedSidebar && !clickedDocument && !clickedAdder) {
                            hideAnnotationsList();
                        }
                    });

                    // Edit an annotation when the edit button is clicked, passing the `that` context which isn't available in the function
                    $('#documentpreview-sidebar').off('click', '.documentpreview-annotation-edit').on('click', '.documentpreview-annotation-edit', function(ev) {
                        that.onEditClick.call(that, ev);
                    });

                    // Add a new comment in with the same highlights when the `add comment` button is clicked
                    $('#documentpreview-sidebar').off('click', '#documentpreview-annotator-comment').on('click', '#documentpreview-annotator-comment', function(ev) {
                        that.onCommentClick.call(that, ev);
                    });

                    // Keep track of the zoom level and hide the adder button when the document is zoomed
                    $(document).off('oae.documentpreview.zoom').on('oae.documentpreview.zoom', function(ev, data) {
                        $('.annotator-adder').hide();
                        documentZoomLevel = data.zoom;
                    });
                }

                // Show an annotation when it's clicked
                $('body').off('click', '.annotator-hl:not(.annotator-hl-temporary)').on('click', '.annotator-hl:not(.annotator-hl-temporary)', showClickedAnnotations);

                // When a notification link for an annotation has been clicked, the id of it needs to be pushed into the state
                $(document).off('click', '.annotation-activity-link').on('click', '.annotation-activity-link', function(ev) {
                    // Push the new query to a new History.js state. We make sure to take the
                    // existing state data parameters with us and construct a new URL based on
                    // the existing base URL, allowing for page refreshing and bookmarking.
                    var newState = $.extend({}, History.getState().data, {
                        'a': $(ev.target).data('annotationid')
                    });

                    // We cannot rely on the "current" url as that can be different depending on the browser.
                    // Most browsers will display `/me/library`, IE9 will be display `/me#library` however.
                    // The cleanUrl in the History.js state will always be `/me/library`.
                    var url = $.url(History.getState().cleanUrl).attr('path') + '?a=' + $(ev.target).data('annotationid');
                    History.pushState(newState, 'Annotation', url);
                });

                // When the state changes, the id of the annotation in the state is used to display the annotation
                $(window).on('statechange', function() {
                    // Get the annotation id from the state
                    var annotationId = History.getState().data.a;

                    // Only attempt to show the annotation when the state has the annotation id
                    if (annotationId) {
                        var annotations = $($('.documentpreview-content-page')[0]).data('annotator').plugins.Store.annotations;

                        // Find the annotation that was clicked in the Store's cache
                        var stateAnnotation = _.find(annotations, function(annotation) {
                            return annotation.id === annotationId;
                        });

                        // Re-use the documentpreview page form to scroll to the relevant page
                        // This will also take page loading out of our hands
                        $('#documentpreview-page-num').val(stateAnnotation.pageNumber);
                        $('#documentpreview-page-controls').submit();

                        // Render the annotation that was clicked into the list
                        renderAnnotationsList([stateAnnotation]);
                        // Show the annotations list
                        showAnnotationsList();
                    }
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
             * @param  {Object}    activity       Object representing the activity
             * @param  {Object}    annotation     Object representing the created annotation
             * @param  {User}      userProfile    A user object representing the user that created the annotation
             */
            var annotationCreated = function(activity, annotation, userProfile) {
                // Push the newly created annotation into the store's cache
                $($('.documentpreview-content-page')[0]).data('annotator').plugins.Store.annotations.push(annotation);

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

                    // Apply the annotation to the highlights for later reference
                    $(annotation.highlights).data('annotation', annotation);

                    // Create a reference to the annotation
                    createAnnotationReference(annotation);
                }

                // Show a notification about the annotation, including a link to the annotation
                var notificationBody = oaeUtil.template().render($('#documentpreview-new-annotation-notifications-template'), {
                    'actorURL': oaeUtil.profilePath(annotation.createdBy.profilePath),
                    'actor': oaeUtil.security().encodeForHTML(annotation.createdBy.displayName),
                    'annotationid': annotation.id
                });
                oaeUtil.notification(null, notificationBody, null, activity['oae:activityType'] + '#' + activity.published);
            };

            /**
             * Update the annotation, coming in over websocket, in the page
             *
             * @param  {Object}    annotation    Object representing the updated annotation
             */
            var annotationUpdated = function(annotation) {
                var annotations = $($('.documentpreview-content-page')[0]).data('annotator').plugins.Store.annotations;

                // Find the annotation that was updated
                var updatedAnnotation = _.find(annotations, function(_annotation) {
                    return _annotation.id === annotation.id;
                });

                // Only attempt to update the annotation if it's present
                if (updatedAnnotation && annotation) {
                    // Update the annotation text in the Store's Array
                    updatedAnnotation.text = annotation.text;

                    // Update the annotation data in the document
                    $('.annotator-hl.' + updatedAnnotation.id).data('annotation', updatedAnnotation);
                    // Update the annotation data in the list
                    $('li[data-id="' + updatedAnnotation.id + '"]').data('annotation', updatedAnnotation);
                    // If the annotation is currently shown in the list, update it
                    if ($('li[data-id="' + updatedAnnotation.id + '"]').length) {
                        $('li[data-id="' + updatedAnnotation.id + '"] .documentpreview-annotation-text').html(oaeUtil.security().encodeForHTMLWithLinks(updatedAnnotation.text).replace(/\n/g, '<br/>'));
                    }
                }
            };

            /**
             * Remove the deleted annotation, coming in over websocket, from the page
             *
             * @param  {Object}    annotation    Object representing the deleted annotation
             */
            var annotationDeleted = function(annotation) {
                // Get the deleted annotation object
                annotation = $('.annotator-hl.' + annotation.id).data('annotation');

                // Only attempt to delete the annotation if it's present
                if (annotation) {
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

                    // Delete the anotation from the store's cache
                    $($('.documentpreview-content-page')[0]).data('annotator').plugins.Store.annotations = _.reject($($('.documentpreview-content-page')[0]).data('annotator').plugins.Store.annotations, function(_annotation) {
                        return _annotation.id === annotation.id;
                    });

                    // Delete the annotation from the sidebar
                    deleteAnnotationFromSidebar(annotation);
                }

            };

            /**
             * Set up push notifications
             */
            var setUpPushNotifications = function() {
                var contentId = Annotator.Plugin.Sidebar.prototype.options.contentProfile.id;
                var signature = Annotator.Plugin.Sidebar.prototype.options.contentProfile.signature;

                // Subscribe to push notifications for the content item
                pushAPI.subscribe(contentId, 'activity', signature, 'internal', false, false, function(activities) {
                    var activity = activities[0];
                    // If the activity was generated by the current user or it's not for the page this
                    // instance of the annotator is set up for, we ignore it
                    var userProfile = Annotator.Plugin.Sidebar.prototype.options.userProfile;
                    if (activity.actor.id === userProfile.id) {
                        return;
                    }

                    var annotation = activity.object['oae:annotation'];

                    if (annotation) {
                        if (activity['oae:activityType'] === 'annotation-create') {
                            annotationCreated(activity, annotation, userProfile);
                        } else if (activity['oae:activityType'] === 'annotation-update') {
                            annotationUpdated(annotation);
                        } else if (activity['oae:activityType'] === 'annotation-delete') {
                            annotationDeleted(annotation);
                        }
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
                    renderAnnotationsList();
                    showAnnotationsList();
                }
            };

            /**
             * Hide the annotations list
             */
            var hideAnnotationsList = function() {
                // Only attempt to hide the sidebar when its currently shown
                if ($('#documentpreview-sidebar').is(':visible')) {
                    // Remove the selected class from any other elements that were previously selected
                    $('.annotator-hl-selected').removeClass('annotator-hl-selected');
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
                    }, function() {
                        $('#documentpreview-sidebar').hide();
                    });
                    setTimeout(function() {
                        $('#documentpreview-content-container').animate({
                            'width': '100%'
                        });
                    }, 100);
                }
            };

            /**
             * Show the annotations list
             */
            var showAnnotationsList = function() {
                // Only attempt to show the sidebar when its supported and currently hidden
                if (sidebarSupported && !$('#documentpreview-sidebar').is(':visible')) {
                    // Activate the toggle button in the toolbar
                    $('#documentpreview-toggle-annotator #documentpreview-annotator-status').toggleClass('active');

                    // Reduce the width of the document container to 78% to allow the sidebar to take up space
                    $('#documentpreview-content-container').animate({
                        'width': '78%'
                    });
                    setTimeout(function() {
                        $('#documentpreview-sidebar').animate({
                            'opacity': '1',
                            'width': '22%'
                        });
                        $('#documentpreview-sidebar').show();
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
             * Set up the editor for the annotator create functionality
             */
            Annotator.prototype._setupEditor = function() {
                this.editor = new Annotator.Editor();
                this.editor.hide().on('hide', this.onEditorHide).on('save', this.onEditorSubmit).addField(getEditorFields());
                return this;
            };

            /**
             * Set up a custom editor for the Sidebar edit functionality
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
                if (type === 'delete') {
                    var annotation = $(ev.target).data('annotation');
                    delete annotation.prototype;

                    // Finally delete the annotation
                    return this.annotator.deleteAnnotation(annotation);
                } else if (type === 'edit') {
                    var $annotationItem = $($(ev.target).closest('li'));
                    // Add the editor to the annotation's edit container
                    var $editContainer = $($annotationItem.find('.documentpreview-annotation-edit-container'));
                    var $annotationText = $($annotationItem.find('.documentpreview-annotation-text'));
                    this.editor.element.appendTo($editContainer);
                    enableDisableEditorControls(this.editor);

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
             * Render the annotations in the sidebar or modal, depending on what device
             * is used to read the annotations
             *
             * @param  {Object[]}    annotations     Array of annotations that are loaded
             */
            var renderAnnotationsList = function(annotations) {
                var userProfile = Annotator.Plugin.Sidebar.prototype.options.userProfile;
                var contentProfile = Annotator.Plugin.Sidebar.prototype.options.contentProfile;

                if (sidebarSupported) {
                    oaeUtil.template().render($('#documentpreview-sidebar-view-template'), {
                        'annotations': annotations,
                        'contentProfile': contentProfile,
                        'userProfile': userProfile
                    }, $('#documentpreview-sidebar'));

                    // Store the annotation data on the list items for future reference
                    $('#documentpreview-sidebar').find('li').each(function(index, listItem) {
                        $(listItem).data('annotation', annotations[index]);
                    });

                    // Remove the selected class from any other elements that were previously selected
                    $('.annotator-hl-selected').removeClass('annotator-hl-selected');

                    // If annotations are rendered highlight the clicked one
                    if (annotations && annotations.length) {
                        $(annotations[0].highlights).closest('.t > span').addClass('annotator-hl-selected');
                    }
                } else {
                    // Trigger the annotationsmobile widget to show the list of annotations in a modal
                    $(document).trigger('oae.trigger.annotationsmobile', [annotations], userProfile, contentProfile);
                }
            };


            ///////////////////////////
            // COMMENT ON ANNOTATION //
            ///////////////////////////

            /**
             * Set up the editor and show it in the sidebar when the comment button is clicked
             *
             * @param  {Event}    ev    Standard jQuery click event
             */
            Sidebar.prototype.onCommentClick = function(ev) {
                // Get the annotation that's being commented on
                var replyToAnnotation = $('.annotator-hl-selected').data('annotation');

                // Set up the editor for the reply
                this.annotator._setupEditor();

                // Create the initial annotation object
                var annotation = this.annotator.setupAnnotation(this.annotator.createAnnotation());

                // Apply the same highlights, ranges and quote to the reply
                annotation.highlights = replyToAnnotation.highlights;
                annotation.ranges = replyToAnnotation.ranges;
                annotation.quote = replyToAnnotation.quote;
                annotation.pageNumber = replyToAnnotation.pageNumber;

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

                /**
                 * Clean up after canceling or saving the annotation
                 *
                 * @param  {Annotator}    _this         The Annotator object
                 * @param  {Object}       annotation    The new annotation that is being created
                 */
                var cleanup = (function(_this, annotation) {
                    return function() {
                        // Remove the temporary highlights from the annotation
                        $('span').removeClass('annotator-hl-temporary');
                        // Show the new annotation container and hide the list
                        $('.documentpreview-new-annotation-container').hide();
                        $('.documentpreview-annotations-list').show();
                        _this.unsubscribe('annotationEditorHidden', cancel);
                        return _this.unsubscribe('annotationEditorSubmit', save);
                    };
                })(this, annotation);

                /**
                 * Save the editor's fields
                 *
                 * @param  {Annotator}    _this         The Annotator object
                 * @param  {Object}       annotation    The new annotation that is being created
                 */
                var save = (function(_this, annotation) {
                    return function() {
                        cleanup();
                        return _this.publish('annotationCreated', [annotation]);
                    };
                })(this, annotation);

                /**
                 * Cancel adding a new annotation
                 *
                 * @param  {Annotator}    _this         The Annotator object
                 * @param  {Object}       annotation    The new annotation that is being created
                 */
                var cancel = (function(_this, annotation) {
                    return function() {
                        cleanup();
                        return _this.deleteAnnotation(annotation);
                    };
                })(this, annotation);

                this.subscribe('annotationEditorHidden', cancel);
                this.subscribe('annotationEditorSubmit', save);

                // Show the editor
                return this.annotator.showEditor(annotation);
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
                renderAnnotationsList();

                // Hide the instructions and comment button in the sidebar
                $('#documentpreview-annotator-instruction').hide();
                $('#documentpreview-annotator-comment').hide();

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
             * Enable or disable the form controls depending on whether or not
             * the form is empty
             *
             * @param  {Editor}    editor    Instance of the annotator editor
             */
            var enableDisableEditorControls = function(editor) {
                $(editor.element).off('keyup').on('keyup', 'textarea', function() {
                    if ($.trim($(this).val())) {
                        $('form .annotator-controls button.annotator-save').prop('disabled', false);
                    } else {
                        $('form .annotator-controls button.annotator-save').prop('disabled', true);
                    }
                });
            };

            /**
             * Disable the form controls
             *
             * @param  {Editor}    editor    Instance of the annotator editor
             */
            var disableEditorControls = function(editor) {
                $('form .annotator-controls button.annotator-save').prop('disabled', true);
            };

            Sidebar.prototype.onAnnotationEditorShown = enableDisableEditorControls;
            Sidebar.prototype.onAnnotationEditorHidden = disableEditorControls;

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

                /**
                 * Clean up after canceling or saving the annotation
                 *
                 * @param  {Annotator}    _this         The Annotator object
                 * @param  {Object}       annotation    The new annotation that is being created
                 */
                var cleanup = (function(_this, annotation) {
                    return function() {
                        // Remove the temporary highlights from the annotation
                        $('span').removeClass('annotator-hl-temporary');
                        // Show the new annotation container and hide the list
                        $('.documentpreview-new-annotation-container').hide();
                        $('.documentpreview-annotations-list').show();
                        _this.unsubscribe('annotationEditorHidden', cancel);
                        return _this.unsubscribe('annotationEditorSubmit', save);
                    };
                })(this, annotation);

                /**
                 * Save the editor's fields
                 *
                 * @param  {Annotator}    _this         The Annotator object
                 * @param  {Object}       annotation    The new annotation that is being created
                 */
                var save = (function(_this, annotation) {
                    return function() {
                        cleanup();
                        return _this.publish('annotationCreated', [annotation]);
                    };
                })(this, annotation);

                /**
                 * Cancel adding a new annotation
                 *
                 * @param  {Annotator}    _this         The Annotator object
                 * @param  {Object}       annotation    The new annotation that is being created
                 */
                var cancel = (function(_this, annotation) {
                    return function() {
                        cleanup();
                        return _this.deleteAnnotation(annotation);
                    };
                })(this, annotation);

                /**
                 * Cancel creating a new annotation when the document is clicked
                 *
                 * @param  {Event}    ev    Standard jQuery click event
                 */
                var cancelEditAfterClick = function(ev) {
                    // If the click is not inside of the form or on the adder button cancel editing
                    if (!$(ev.target).closest('.documentpreview-new-annotation-container').length &&
                        !$(ev.target).closest('.annotator-adder').length &&
                        $('.documentpreview-new-annotation-container').is(':visible')) {
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
             * Catch the `edit` button click in the Sidebar and show the editor
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


            ///////////////////////
            // DELETE ANNOTATION //
            ///////////////////////

            /**
             * Delete an annotation from the sidebar
             *
             * @param  {Object}    annotation     Object representing the annotation to delete from the sidebar
             */
            var deleteAnnotationFromSidebar = function(annotation) {
                // Remove the annotation from the sidebar
                var $annotationItem = $('li[data-id="' + annotation.id + '"]');
                $annotationItem.remove();
                // Remove the selected class from the page elements
                $('.annotator-hl-selected').removeClass('annotator-hl-selected');
                // Check if there are other annotations in the sidebar and add the selected class
                // to the first one in the list
                if ($('.documentpreview-annotations-list li').length) {
                    var selectedAnnotation = $('.documentpreview-annotations-list li:first-child').data('annotation');
                    $(selectedAnnotation.highlights).closest('.t > span').addClass('annotator-hl-selected');
                }
                // Show the instructions and hide the comment button when no annotations remain in the list
                if (!$('ul.documentpreview-annotations-list li').length) {
                    $('#documentpreview-annotator-instruction').show();
                    $('#documentpreview-annotator-comment').hide();
                }
            };

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
                // If the annotation has no page number it hasn't been persisted through the
                // Store and an event shouldn't be sent out
                if (annotation.pageNumber) {
                    // Let other widgets know that the annotation was deleted
                    $(document).trigger('oae.deleteannotation.done');
                    // Delete the annotation from the sidebar
                    deleteAnnotationFromSidebar(annotation);
                }
            };

            return Sidebar;

        })(Annotator.Plugin);
    }).call(this);
});
