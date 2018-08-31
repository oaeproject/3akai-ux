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

define(['jquery', 'oae.core', 'jquery.jeditable'], function($, oae) {

    return function(uid) {

        //////////////////////
        // WIDGET VARIABLES //
        //////////////////////

        // The widget container
        $rootel = $('#' + uid);

        // Regular expression that matches valid links
        var linkRegExp = new RegExp(/^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i);

        // Variable that keeps track of the links to add
        var addedLinks = [];

        // Variable that keeps track of the selected visibility for the files to upload
        var visibility = null;

        // Generate a widget ID for the new instance of the `setpermissions` widget. This widget ID
        // will be used in the event communication between this widget and the `setpermissions` widget.
        var setPermissionsId = oae.api.util.generateId();

        // Variable that keeps track of the current context
        var contextData = null;


        ///////////////
        // UTILITIES //
        ///////////////

        /**
         * Reset the state of the widget when the modal dialog has been closed
         */
        var reset = function() {
            // Unbind the setpermissions handler
            $(document).off('oae.setpermissions.changed.' + setPermissionsId);

            // Reset the setpermissions content
            $('#createlink-permissions-container', $rootel).html('');

            // Reset the selected links list
            addedLinks = [];

            // Hide all steps
            $('#createlink-modal .modal-body > div', $rootel).hide();

            // Show the first step
            $('#createlink-link-dump-container', $rootel).show();
            $('#createlink-modal .modal-content > .modal-footer', $rootel).show();

            // Reset controls
            $('#createlink-modal *', $rootel).prop('disabled', false);
            $('#createlink-next', $rootel).prop('disabled', true);
            $('#createlink-next', $rootel).show();
            $('#createlink-link-dump', $rootel).val('');
            $('#createlink-create', $rootel).hide();
        };

        /**
         * Verify that a URL is valid
         *
         * @param  {String}           link   String to be tested as URL
         * @return {Boolean|String}          Return `false` if the URL is not valid. Returns the URL if it is valid
         */
        var isValidLink = function(link) {
            // If the link doesn't start with a protocol (e.g. http://, https://, etc.), we prepend http:// as a default
            if (!link.match(/https?:\/\/|s?ftp:\/\//)) {
                link = 'http://' + link;
            }
            // Validate the link and return a valid link object when it passes.
            if (link && linkRegExp.test(link)) {
                return link;
            }
            // The link is not valid, return false
            return false;
        };

        /**
         * Get the list of valid links that have been added/pasted by the user
         *
         * @return {String[]}         Array containing all of the valid entered URLs
         */
        var getValidLinks = function() {
            // Split out the textarea into an array of links
            var links = $('#createlink-link-dump', $rootel).val().split('\n');
            // Remove duplicate links
            links = _.unique(links);
            // Remove invalid links
            var filteredLinks = [];
            $.each(links, function(i, link) {
                var filteredLink = isValidLink(link);
                if (filteredLink) {
                    filteredLinks.push(filteredLink);
                }
            });

            return filteredLinks;
        };

        /**
         * Add a link to the list of links
         *
         * @param  {String}   url   The link to be created
         */
        var addToSelected = function(url) {
            // Create the link object
            var linkObj = {
                'link': url,
                'displayName': url,
                'description': '',
                'resourceType': 'content',
                'resourceSubType': 'link'
            };

            // Add the link to the queue
            addedLinks.push(linkObj);
        };

        /**
         * Save the edited link name to the corresponding item in the array of links to add
         *
         * @param  {String}   value   The new value for the item
         * @return {String}           The value to show in the editable field after editing completed
         */
        var editableSubmitted = function(value) {
            value = $.trim(value);
            var prevValue = this.revert;
            var $listItem = $(this).parents('li');
            // If no name has been entered, we fall back to the previous value
            if (!value) {
                return prevValue;
            } else {
                var linkIndex = $('#createlink-selected-container li', $rootel).index($listItem);
                addedLinks[linkIndex].displayName = value;
                return value;
            }
        };

        /**
         * Show a success or failure notification when the links have been added
         *
         * @param  {Number}   errCount   The number of errors that occurred during the link creation
         */
        var showCompleteNotification = function(errCount) {
            // Render and show the notification
            var notificationTitle = oae.api.util.template().render($('#createlink-notification-title-template', $rootel), {
                'context': contextData,
                'errCount': errCount,
                'links': addedLinks
            });

            var notificationBody = oae.api.util.template().render($('#createlink-notification-body-template', $rootel), {
                'context': contextData,
                'errCount': errCount,
                'links': addedLinks
            });

            oae.api.util.notification(notificationTitle, notificationBody, errCount ? 'error' : 'success');

            // Hide the modal when there are no link creation errors
            if (!errCount) {
                $('#createlink-modal', $rootel).modal('hide');
            }
        };


        /////////////////////
        // VIEW MANAGEMENT //
        /////////////////////

        /**
         * Show the permissions widget to allow for updates in visiblity and members
         */
        var showPermissions = function() {
            // Hide all containers
            $('#createlink-modal .modal-body > div:visible', $rootel).hide();
            $('#createlink-modal .modal-content > .modal-footer', $rootel).hide();
            // Show the permissions container
            $('#createlink-modal .modal-body > div#createlink-permissions-container', $rootel).show();
            $('#createlink-create', $rootel).hide();
        };

        /**
         * Show the overview of the selected links
         */
        var showOverview = function() {
            // Hide all containers
            $('#createlink-modal .modal-body > div:visible', $rootel).hide();
            $('#createlink-next', $rootel).hide();
            // Show the overview container
            $('#createlink-modal .modal-content > .modal-footer', $rootel).show();
            $('#createlink-modal .modal-body > div#createlink-overview-container', $rootel).show();
            $('#createlink-create', $rootel).show();
        };

        /**
         * Render a list of the links to add
         */
        var renderAdded = function() {
            oae.api.util.template().render($('#createlink-selected-template', $rootel), {
                'links': addedLinks,
                'displayOptions': {
                    'metadata': false
                }
            }, $('#createlink-selected-container', $rootel));

            // Initiate the widget that will deal with permission management
            setUpSetPermissions();

            // Give focus to the first item in the list
            $('#createlink-selected-container li:first-child', $rootel).focus();

            // Apply jEditable for inline editing of link names
            $('.jeditable-field', $rootel).editable(editableSubmitted, {
                'onblur': 'submit',
                'select' : true
            });

            // Apply jQuery Tooltip to the link title field to show that the fields are editable.
            // The custom template adds ARIA accessibility to the default bootstrap functionality
            $('[rel="tooltip"]', $rootel).each(function() {
                var tooltipId = oae.api.util.generateId();
                $(this).attr('aria-describedby', tooltipId);
                $(this).tooltip({
                    'template': '<div class="tooltip" role="tooltip" id="' + tooltipId + '"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
                });
            });
        };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        /**
         * Reset the widget when the modal dialog is closed
         */
        var setUpReset = function() {
            $('#createlink-modal', $rootel).on('hidden.bs.modal', function(ev) {
                // Bootstrap will send out a `hidden` event when certain components are destroyed.
                // We can only reset the widget when the modal is closed though.
                // e.g. `$('[rel="tooltip"]', $rootel).tooltip('destroy');`
                if ($(ev.target).hasClass('modal')) {
                    reset();
                }
            });
        };

        /**
         * Remove a selected link from the list and resets the widget when no links remain
         */
        var setUpDelete = function() {
            $rootel.on('click', '.createlink-trash', function(ev) {
                // Get the index of the list item
                var $listItem = $(this).parents('li');
                var linkIndex = $('#createlink-selected-container li', $rootel).index($listItem);
                // This index corresponds to the Array from which we'll remove the added link
                addedLinks.splice(linkIndex, 1);
                // Also remove it from the UI
                $listItem.fadeOut(250, function() {
                    $listItem.remove();
                    // If there are no links left, we go back to the first step
                    if (!addedLinks.length) {
                        reset();
                    }
                });
            });
        };

        /**
         * Load the `setpermissions` widget into this widget. That widget will take care of permission
         * management (visibility + sharing) of the added links
         */
        var setUpSetPermissions = function() {
            // Remove the previous `setpermissions` widget
            var $setPermissionsContainer = $('#createlink-permissions-container', $rootel);
            $setPermissionsContainer.html('');

            // When the current context is the current user, the configured default tenant visibility for links
            // will be used as the default visibility. Otherwise, the visibility of the current context will be
            // used as the default visibility
            if (contextData.id === oae.data.me.id) {
                visibility = oae.api.config.getValue('oae-content', 'visibility', 'links');
            } else {
                visibility = contextData.visibility;
            }

            // Event that will be triggered when permission changes have been made in the `setpermissions` widget
            $(document).on('oae.setpermissions.changed.' + setPermissionsId, function(ev, data) {
                // Update visibility for links
                visibility = data.visibility || visibility;

                // Update the members of the added links
                $.each(addedLinks, function(index, link) {
                    link.managers = [];
                    link.viewers = [];

                    _.each(data.members, function(role, id) {
                        if (role === 'manager') {
                            link.managers.push(id);
                        } else {
                            link.viewers.push(id);
                        }
                    });

                    _.each(data.invitations, function(invitation, id) {
                        if (invitation.role === 'manager') {
                            link.managers.push(id);
                        } else {
                            link.viewers.push(id);
                        }
                    });

                    link.folders = data.selectedFolderItems || link.folders;
                });

                // Add the permissions summary
                $('#createlink-permissions', $rootel).html(data.summary);

                // Switch back to the overview
                showOverview();
            });

            // Event that will be triggered when permission changes have been cancelled
            $(document).on('oae.setpermissions.cancel.' + setPermissionsId, showOverview);

            // Always add the created link to the current user's library
            var preFill = [{
                'displayName': oae.api.i18n.translate('__MSG__MY_LIBRARY__'),
                'id': oae.data.me.id,
                'fixed': true
            }];

            // If the current user is creating the links from a within a group,
            // the group is added as a fixed item as well
            if (contextData.id !== oae.data.me.id) {
                preFill.push($.extend({'fixed': true}, contextData));
            }

            // Load the `setpermissions` widget into its container
            oae.api.widget.insertWidget('setpermissions', setPermissionsId, $setPermissionsContainer, false, {
                'count': addedLinks.length,
                'preFill': preFill,
                'type': 'link',
                'visibility': visibility
            });
        };

        /**
         * When the next button is clicked, we validate all of the entered links and progress to the next step
         * if at least 1 valid URL was entered
         */
        var setUpNextStep = function() {
            $('#createlink-next', $rootel).on('click', function() {
                // Extract the valid links from the textarea
                var links = getValidLinks();

                // Add the valid links to the queue
                $.each(links, function(index, link) {
                    addToSelected(link);
                });

                // If there was at least one valid link, go to the next step
                if (addedLinks.length > 0) {
                    showOverview();
                    renderAdded();
                }
            });
        };

        /**
         * Start the link creation process. This iterates over all added links and creates them one at
         * a time. Regular updates are provided in the form of a loading spinner icon and success or fail icon
         */
        var setUpLinkCreation = function() {
            $('#createlink-create', $rootel).on('click', function() {
                var done = 0;
                var errCount = 0;

                // Disable editing on link creation
                $('#createlink-modal *', $rootel).prop('disabled', true);
                $('.jeditable-field', $rootel).editable('destroy');
                $('[rel="tooltip"]', $rootel).tooltip('destroy');

                // Lock the modal so it cannot be closed during link creation
                $('#createlink-modal', $rootel).modal('lock');

                /**
                 * Create the actual link
                 *
                 * @param  {Number}    index    The index of the link that's currently being created
                 */
                var createLink = function(index) {
                    var link = addedLinks[index];
                    if (link) {
                        var $listItem = $($('#createlink-selected-container li', $rootel)[index]);
                        var $spinner = $listItem.find('.createlink-progress');
                        var $ok = $listItem.find('.fa-check');
                        var $warning = $listItem.find('.fa-exclamation-triangle');

                        // Show the creating animation and add focus to it so the browser scrolls
                        $spinner.removeClass('hide').focus();

                        oae.api.content.createLink(link.displayName, link.description, visibility, link.link, link.managers, link.viewers, link.folders, function(error, data) {
                            $spinner.addClass('hide');
                            if (!error) {
                                $ok.show();
                                // Update the file object with the profile path of the content
                                link.profilePath = data.profilePath;
                            } else {
                                $warning.show();
                                // Update the error count
                                errCount++;
                            }

                            done++;
                            if (done !== addedLinks.length) {
                                createLink(done);
                            } else {
                                $(window).trigger('done.addcontent.oae');
                                // Unlock the modal
                                $('#createlink-modal', $rootel).modal('unlock');
                                showCompleteNotification(errCount);
                            }
                        });
                    }
                };

                createLink(0);
            });
        };

        /**
         * Handle changes in the link dump textarea. If no valid links are available into the area the `next` button will be disabled
         */
        var setUpLinkDump = function() {
            $('#createlink-link-dump', $rootel).on('keyup paste', function(ev) {
                // The paste event fires before the textarea values changes so we add a small timeout
                setTimeout(function () {
                    // Extract the valid links from the textarea
                    var links = getValidLinks();

                    if (links.length) {
                        $('#createlink-next', $rootel).prop('disabled', false);
                    } else {
                        $('#createlink-next', $rootel).prop('disabled', true);
                    }
                }, 1);
            });
        };

        /**
         * Initialize the create link modal dialog
         */
        var setUpLinkModal = function() {
            $(document).on('click', '.oae-trigger-createlink', function() {
                $('#createlink-modal', $rootel).modal({
                    'backdrop': 'static'
                });
            });

            $('#createlink-modal', $rootel).on('shown.bs.modal', function() {
                // IE10 has a problem where it treats the placeholder text as the textarea's
                // value. Therefore, we need to explicitly clear the value of the textarea to
                // make the placeholder behave like a placeholder.
                // @see https://github.com/oaeproject/3akai-ux/pull/2906
                $('#createlink-link-dump', $rootel).val('');
                // Set focus to the link dump textarea
                $('#createlink-link-dump', $rootel).focus();
            });

            // Binds the 'change' button that shows the setpermissions widget
            $rootel.on('click', '.setpermissions-change-permissions', showPermissions);

            // Receive the context information and cache it
            $(document).on('oae.context.send.createlink', function(ev, ctx) {
                contextData = ctx;
            });

            // Request the context information
            $(document).trigger('oae.context.get', 'createlink');
        };

        setUpReset();
        setUpNextStep();
        setUpDelete();
        setUpLinkDump();
        setUpLinkModal();
        setUpLinkCreation();

    };
});
