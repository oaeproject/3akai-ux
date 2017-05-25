/*!
 * Copyright 2017 Apereo Foundation (AF) Licensed under the
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

define(['jquery', 'oae.core'], function ($, oae) {

    return function (uid) {
        // The widget container
        var $rootel = $('#' + uid);

        // Variable that will keep track of the current page context
        var contextProfile = null;

        // Variable that will keep track of the resources to delete
        var selectedResources = [];

        ///////////////
        // UTILITIES //
        ///////////////

        /**
         * Reset the state of the widget when the modal dialog has been closed
         */
        var setUpReset = function() {
            $('#deletelti-modal').on('hidden.bs.modal', function(ev) {
                // Reset the selected resources
                selectedResources = [];

                // Reset the progress bar
                updateProgress(0);

                // Show the first step
                $('#deletelti-overview-container', $rootel).hide();
                $('#deletelti-progress-container', $rootel).show();

                // Reset the modal title
                $('#deletelti-modal-title', $rootel).empty();
            });
        };

        /**
         * Update the progress indicator
         *
         * @param  {Number}   progress   Number between 0 and 100 indicating progress
         */
        var updateProgress = function(progress) {
            $('.progress-bar', $rootel).css('width', progress + '%').attr('aria-valuenow', progress);
            $('.progress-bar .sr-only', $rootel).text(progress + '%');
        };

        /**
         * Set the title of the modal
         *
         * @param  {String}     view     The view for which a title should be shown. The accepted values are `gathering`, `overview` and `deleting`
         */
        var setModalTitle = function(view) {
            oae.api.util.template().render($('#deletelti-modal-title-template', $rootel), {
                'count': selectedResources.length,
                'view': view
            }, $('#deletelti-modal-title', $rootel));
        };


        //////////////////////
        // DELETE LTI TOOLS //
        //////////////////////

        /**
         * Delete the selected LTI tools
         */
        var deleteLtiTools = function() {
            setModalTitle('deleting');

            // Reset the progress bar
            updateProgress(0);

            $('#deletelti-overview-container', $rootel).hide();
            $('#deletelti-progress-container', $rootel).show();

            // Lock the modal dialog
            $('#deletelti-modal', $rootel).modal('lock');

            // Keep track of how many resource profiles need to be deleted in total
            var count = selectedResources.length;
            // Keep track of how many resources have already been removed for the progress indicator
            var done = 0;
            // Keep track of how many resources could not be deleted
            var errCount = 0;

            var deletedResource = function(err) {
                if (err) {
                    errCount++;
                }

                done++;
                updateProgress((done / count) * 100);

                if (selectedResources.length !== 0) {
                    deleteLtiTool(selectedResources.pop(), deletedResource);
                } else {
                    finishDeleteLtiTool(count, errCount);
                }
            };

            // Sequentially delete all resources
            if (selectedResources.length !== 0) {
                deleteLtiTool(selectedResources.pop(), deletedResource);
            }
        };

        /**
         * Delete a resource from the system
         *
         * @param  {Object}     resource            The resource that needs to be deleted from the system
         * @param  {Function}   callback            A standard callback method
         * @param  {Object}     callback.err        An error object, if any
         */
        var deleteLtiTool = function(resource, callback) {
            oae.api.lti.deleteLtiTool(resource.groupId, resource.id, callback);
        };

        /**
         * Finish the delete resource process by showing an appropriate notification, hiding the modal and
         * sending out the event that will update the library list
         *
         * @param  {Number}         count           The total number of resources that was selected for deletion
         * @param  {Number}         errCount        The number of resources that couldn't be deleted
         */
        var finishDeleteLtiTool = function(count, errCount) {
            var data = {
                'count': count,
                'errCount': errCount
            };

            var notificationTitle = oae.api.util.template().render($('#deletelti-notification-title-template', $rootel), data);
            var notificationBody = oae.api.util.template().render($('#deletelti-notification-body-template', $rootel), data);
            oae.api.util.notification(notificationTitle, notificationBody, errCount ? 'error' : 'success');

            // Unlock the modal dialog
            $('#deletelti-modal', $rootel).modal('unlock');

            // Refresh the resources list
            $(document).trigger('oae.deletelti.done');

            // Deselect all list items and disable list option buttons
            $(document).trigger('oae.list.deselectall');

            $('#deletelti-modal', $rootel).modal('hide');

            if (contextProfile.tool) {
                setTimeout(oae.api.util.redirect().home, 2000);
            }
        };


        //////////////
        // OVERVIEW //
        //////////////
        var showOverview = function() {
            setModalTitle('overview');

            $('#deletelti-progress-container', $rootel).hide();
            $('#deletelti-overview-container', $rootel).show();

            renderOverview(selectedResources, contextProfile.isManager);
        };

        /**
         * Render the list of resources to be removed, as well as the action buttons
         *
         * @param  {Object[]}       resources       The array of resources that should be rendered
         * @param  {Boolean}        canManage       Whether or not the user can manage the provided resources
         */
        var renderOverview = function(resources, canManage) {
            oae.api.util.template().render($('#deletelti-overview-template', $rootel), {
                'contextProfile': contextProfile,
                'canManage': canManage,
                'resources': resources,
            }, $('#deletelti-overview-container', $rootel));
        };


        ///////////////////////////
        // GATHER SELECTED ITEMS //
        ///////////////////////////

        var gatherToolProfiles = function() {
            setModalTitle('gathering');

            // Keep track of how many resource profiles have already been gathered
            var done = 0;
            var todo = selectedResources.length;

            var getResourceProfile = function() {
                oae.api.lti.launchLtiTool(contextProfile.id, selectedResources[done].id, function(err, toolProfile) {
                    if (err) {
                        oae.api.util.notification(
                            oae.api.i18n.translate('__MSG__GATHERING_FAILED__', 'deletelti'),
                            oae.api.i18n.translate('__MSG__GATHERING_FAILED_DESCRIPTION__', 'deletelti'),
                            'error');
                    } else {
                        // Cache the resource profile
                        selectedResources[done] = toolProfile.tool;
                        done++;
                        // Update the progress bar
                        updateProgress((done / todo) * 100);
                        if (done === todo) {
                            // All resource profiles have been retrieved, show the overview list
                            showOverview();
                        } else {
                            getResourceProfile();
                        }
                    }
                });
            };

            getResourceProfile();
        };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        /**
         * Initialize the delete resources modal dialog
         */
        var setUpDeleteLtiModal = function() {
            $(document).on('click', '.oae-trigger-deletelti', function() {
                $('#deletelti-modal', $rootel).modal({
                    'backdrop': 'static'
                });

                // Get the page context
                $(document).trigger('oae.context.get', 'deletelti');
            });

            // Listen to the event that returns the current page context
            $(document).on('oae.context.send.deletelti', function(ev, context) {
                contextProfile = context;

                // Is the context a list of tools in a group or a single tool?
                if (!contextProfile.tool) {
                    // Get the list selection
                    $(document).trigger('oae.list.getSelection', 'deletelti');
                } else {
                    selectedResources.push(contextProfile.tool);
                    contextProfile.isManager = contextProfile.tool.isManager;
                    showOverview();
                }

            });

            // Listen to the event that returns the list of selected resources
            $(document).on('oae.list.sendSelection.deletelti', function(ev, selected) {
                selectedResources = selected.results;
                // Gather the profiles for all selected items
                gatherToolProfiles();
            });

            $rootel.on('click', '#deletelti-manage-delete-system', function() {
                deleteLtiTools();
            });
        };

        setUpReset();
        setUpDeleteLtiModal();
    };
});
