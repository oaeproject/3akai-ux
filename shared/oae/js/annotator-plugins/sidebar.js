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

define(['jquery', 'oae.api.util', 'annotator'], function (jQuery, oaeUtil) {
    (function() {
        var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
            __hasProp = {}.hasOwnProperty,
            __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

        Annotator.Plugin.Sidebar = (function(_super) {
            __extends(Sidebar, _super);

            /**
             * Bind the events associated to the Sidebar
             */
            Sidebar.prototype.events = {
                'annotationDeleted': 'onAnnotationDeleted',
                'annotationViewerShown': 'onAnnotationViewerShown',
                '.documentpreview-delete-annotation click': 'onDeleteClick',
                '.documentpreview-edit-annotation click': 'onEditClick',
                ".annotator-save click": "saveAnnotation"
            };

            /**
             * Set default values for field, editor, input and options
             */
            Sidebar.prototype.field = null;
            Sidebar.prototype.input = null;
            Sidebar.prototype.options = {};
            Sidebar.prototype.editor = null;

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
                this.onEditorSubmit = __bind(this.onEditorSubmit, this);
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
            };

            /**
             * Set up a custom editor
             */
            Sidebar.prototype._setupEditor = function() {
                this.editor = new Annotator.Editor();
                this.editor.hide().on('save', this.onEditorSubmit).addField({
                    type: 'textarea',
                    label: 'Add your annotation...',
                    load: function(field, annotation) {
                        return $(field).find('textarea').val(annotation.text || '');
                    },
                    submit: function(field, annotation) {
                        annotation.text = $(field).find('textarea').val();
                        return annotation.text;
                    }
                });
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
                    this.editor.element.appendTo($annotationItem.find('.documentpreview-annotation-container'));
                    this.editor.show();
                }
            };

            /**
             * Render the annotations list when the annotation viewer is shown
             *
             * @param  {[type]} viewer     [description]
             * @param  {[type]} annotation [description]
             */
            Sidebar.prototype.onAnnotationViewerShown = function(viewer, annotation) {
                this.renderAnnotationsList(viewer, annotation);
            };

            /**
             * Render the annotations in the sidebar and show it
             *
             * @param  {[type]} viewer      [description]
             * @param  {[type]} annotations [description]
             */
            Sidebar.prototype.renderAnnotationsList = function(viewer, annotations) {
                // Hide the default viewer
                viewer.hide();

                // Get the template and target container and render the template
                container = Annotator.Plugin.Sidebar.prototype.options.container;
                viewTemplate = Annotator.Plugin.Sidebar.prototype.options.viewTemplate;
                oaeUtil.template().render(viewTemplate, {
                    'annotations': annotations
                }, $(container));

                // Store the annotation data on the list items for future reference
                $(container).find('li').each(function(index, listItem) {
                    $(listItem).data('annotation', annotations[index]);
                });

                // Show the annotations
                $(container).show();
            };

            /**
             * Generate a unique ID
             */
            Sidebar.prototype.uniqId = function() {
                return Math.round(new Date().getTime() + (Math.random() * 100));
            };


            ////////////
            // UPDATE //
            ////////////

            /**
             * Submit every field of the editor when the annotation needs to be saved
             */
            Sidebar.prototype.saveAnnotation = function() {
                for (i = 0; i < this.editor.fields.length; i++) {
                    var field = this.editor.fields[i];
                    field.submit(field.element, this.editor.annotation);
                }
                this.editor.publish('save', [this.editor.annotation]);
            };

            /**
             * Send out the `annotationUpdated` event which will update the annotation in the database
             *
             * @param  {[type]} annotation [description]
             */
            Sidebar.prototype.onEditorSubmit = function(annotation) {
                // Update the list item associated to the annotation
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

                // Continue the even chain
                return this.onButtonClick(ev, 'edit');
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
