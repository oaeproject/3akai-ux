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

define(['jquery', 'underscore', 'oae.core', 'jquery.autosuggest'], ($, _, oae) => {
  return function(uid) {
    /// ///////////////////
    // WIDGET VARIABLES //
    /// ///////////////////

    // The widget container
    const $rootel = $('#' + uid);

    // Caches the visibility of the context (e.g. group/content/discussion/...)
    let visibility = null;

    // Caches all users we've been able to identify by email address. We use this to form
    // pre-validated share operations that are capable of bypassing interaction checks with the
    // target user as we were able to search them by email
    const userIdValidations = {};

    // Caches the member updates that need to be applied. Each key is a
    // member (user or group) id and its value is the role for that member.
    // A value of `false` deletes the member from the group entirely. This
    // object is sent to the server via an API call, so all updates should
    // be relative to the server state.
    let membersUpdates = {};
    let invitationsUpdates = {};

    // Caches members pending addition. This is distinct from `membersUpdates`
    // to handle deletion. If a member that the user decides to delete is
    // already a full member of the group, then we have to use the API to
    // delete that member on the server. If, on the other hand, a member
    // that the user decides to delete is one that the user has just added
    // (but not saved to the server), then we don't use the API. Each key
    // is a member (user or group) id that the user has identified as a
    // candidate for addition; however, the member has not beend added to
    // the group (yet) on the server. The value is normally `true` but can
    // be set to `false` if the user changes his mind and removes the member
    // before the server is updated.
    let pendingMembers = {};
    let pendingInvitations = {};

    // Variable that will be used to keep track of the list of invitations on the server
    let serverInvitedMembers = [];

    // Variable that will be used to keep track of the current infinite scroll instance
    let infinityScroll = null;

    // Caches the initialization data containing the context profile and the various strings
    let widgetData = null;

    /// ///////////////////
    // DATA PERSISTENCE //
    /// ///////////////////

    /**
     * Update the visibility in case it has been changed
     *
     * @param  {Function}       callback            Standard callback function
     * @param  {Object}         callback.err        Error object containing error code and error message
     */
    const saveVisibility = function(callback) {
      // Update the visibility if it has changed
      if (visibility !== widgetData.contextProfile.visibility) {
        widgetData.api.setVisibility(
          widgetData.contextProfile.id,
          {
            visibility
          },
          callback
        );
      } else {
        callback();
      }
    };

    /**
     * Add, update or remove all of the modified members.
     *
     * @param  {Function}       callback            Standard callback function
     * @param  {Object}         callback.err        Error object containing error code and error message
     */
    const saveMembers = function(callback) {
      const sharedEmails = {};
      const updates = _.extend({}, invitationsUpdates);

      // Pair the member updates with their validation email if one is present
      _.each(membersUpdates, (role, memberId) => {
        const emailValidation = userIdValidations[memberId];
        if (emailValidation) {
          memberId = emailValidation + ':' + memberId;
          sharedEmails[emailValidation] = true;
        }

        updates[memberId] = role;
      });

      // Update the members if changes were made
      if (!_.isEmpty(updates)) {
        widgetData.api.setMembers(widgetData.contextProfile.id, updates, callback);
      } else {
        callback();
      }
    };

    /**
     * Save the visibility setting in case it has been changed and add/update/remove
     * all of the modified members, if any. A success notification will be shown if no errors
     * occurred, otherwise a failure notification will be shown.
     */
    const saveManageAccess = function() {
      // Update the visibility in case it has been changed
      saveVisibility(visibilityErr => {
        if (!visibilityErr) {
          widgetData.contextProfile.visibility = visibility;
        }

        // Update the members
        saveMembers(membersErr => {
          // Show a failure notification if the members or visibility could not be saved
          if (visibilityErr || membersErr) {
            oae.api.util.notification(
              widgetData.messages.accessNotUpdatedTitle,
              widgetData.messages.accessNotUpdatedBody,
              'error'
            );
            // Show a success notification and close the dialog when the members and visibility have been updated
          } else {
            oae.api.util.notification(
              widgetData.messages.accessUpdatedTitle,
              widgetData.messages.accessUpdatedBody
            );
            $(document).trigger('oae.manageaccess.done', widgetData.contextProfile);
            $('#manageaccess-modal', $rootel).modal('hide');
          }
        });
      });
    };

    /**
     * Checks if any values have changed and disables/enables the widget save button in the primary panel.
     */
    const enableDisableSave = function() {
      const updates = _.extend({}, membersUpdates, invitationsUpdates);
      if (visibility === widgetData.contextProfile.visibility && _.isEmpty(updates)) {
        $('#manageaccess-overview-save', $rootel).prop('disabled', true);
      } else {
        $('#manageaccess-overview-save', $rootel).prop('disabled', false);
      }
    };

    /// ///////////////////
    // INVITATIONS LIST //
    /// ///////////////////

    /**
     * Get all the invitations for the current resource in context, updating the invitations
     * listing with them
     */
    const getInvitations = function() {
      widgetData.api.getInvitations(widgetData.contextProfile.id, (err, result) => {
        if (err) {
          oae.api.util.notification(
            oae.api.i18n.translate('__MSG__INVITATIONS_FAILED__'),
            oae.api.i18n.translate('__MSG__FAILED_TO_FETCH_INVITATIONS__'),
            'error'
          );
          return;
        }

        serverInvitedMembers = _.map(result.results, invitation => {
          return createMemberProfileForEmail(invitation.email, invitation.role, true);
        });

        updateInvitations();
      });
    };

    /**
     * Update the invitations from the current invitation role state
     */
    var updateInvitations = function() {
      // Get a list of server invitations with all the local updated emails filtered out of
      // it
      const nonUpdatedServerInvitedMembers = _.filter(serverInvitedMembers, member => {
        return !_.has(invitationsUpdates, member.id);
      });

      // Create a list of all the updated/added invitation member entries, and append all the
      // previously existing ones to the end
      let currentInvitations = _.chain(invitationsUpdates)
        .keys()
        .filter(memberId => {
          return invitationsUpdates[memberId];
        })
        .map(email => {
          return createMemberProfileForEmail(email, invitationsUpdates[email]);
        })
        .value()
        // Since we append to the list as items are updated, we reverse
        // so we get most recently appended at the top of the list in
        // the UI
        .reverse();
      currentInvitations = _.union(currentInvitations, nonUpdatedServerInvitedMembers);

      if (_.isEmpty(currentInvitations)) {
        $('#manageaccess-overview-invitations').hide();
      } else {
        oae.api.util.template().render(
          $('#manageaccess-overview-selected-template', $rootel),
          {
            results: currentInvitations,
            roles: widgetData.roles,
            displayOptions: {
              metadata: false
            }
          },
          $('#manageaccess-overview-selected-invitations-container', $rootel)
        );
        $('#manageaccess-overview-invitations').show();
      }
    };

    /**
     * Resend an invitation for the resource in context to the specified email
     *
     * @param  {String}     email   The email to which to resend an invitation
     */
    const resendInvitation = function(email) {
      const resourceId = widgetData.contextProfile.id;
      widgetData.api.resendInvitation(resourceId, email, err => {
        if (err) {
          oae.api.util.notification(
            oae.api.i18n.translate('__MSG__RESEND_INVITATION_FAILED__', 'manageaccess'),
            oae.api.i18n.translate('__MSG__FAILED_TO_RESEND_INVITATION__', 'manageaccess'),
            'error'
          );
          return;
        }

        oae.api.util.notification(
          oae.api.i18n.translate('__MSG__RESEND_INVITATION_SUCCESS__', 'manageaccess'),
          oae.api.i18n.translate('__MSG__INVITATION_HAS_BEEN_SUCCESSFULLY_RESENT__', 'manageaccess')
        );
      });
    };

    /**
     * Given an email and a role, create a standard resource member profile of resource type
     * 'email', where the id is assigned to the email in place of a proper resource id
     *
     * @param  {String}     email           The email from which to create a standard resource profile
     * @param  {String}     role            The role of the resource in the members list
     * @param  {Boolean}    [beenInvited]   Whether or not the email already exists as an invitation on the server. By default, a check will be made against the `serverInvitedMembers` list in state
     * @return {Object}                     The standard resource member object required from the members list template
     */
    var createMemberProfileForEmail = function(email, role, beenInvited) {
      if (beenInvited === undefined) {
        beenInvited = !_.chain(serverInvitedMembers)
          .findWhere({ id: email })
          .isEmpty()
          .value();
      }

      return {
        resourceType: 'email',
        id: email,
        displayName: email,
        role,
        beenInvited
      };
    };

    /// /////////////////////////
    // MEMBER INFINITE SCROLL //
    /// /////////////////////////

    /**
     * Initialize a new infinite scroll container that fetches the members.
     */
    const getMembers = function() {
      // Disable the previous infinite scroll
      if (infinityScroll) {
        infinityScroll.kill();
      }

      const url = widgetData.api.getMembersURL;

      // Set up the infinite scroll instance
      infinityScroll = $('#manageaccess-overview-shared .oae-list', $rootel).infiniteScroll(
        url,
        {
          limit: 8
        },
        '#manageaccess-overview-selected-template',
        {
          scrollContainer: $('#manageaccess-overview-shared', $rootel),
          postProcessor(data) {
            // Extract the `profile` object off each member and add the `role` to it
            // because the `listItem` macro needs a list of basic profiles and the
            // list item actions macro needs the `role` of each member
            $.each(data.results, (i, member) => {
              data.results[i] = _.extend(data.results[i].profile, data.results[i]);
              delete data.results[i].profile;
            });
            data.roles = widgetData.roles;
            data.displayOptions = {
              metadata: false
            };
            return data;
          }
        }
      );
    };

    /**
     * Prepends members to the list that were selected through the autosuggest.
     *
     * @param  {Object[]}    autoSuggestMembers    Trimmed member object as used by the members feed containing all properties necessary to render a list item in the infinite scroll
     */
    const addNewMembers = function(autoSuggestMembers) {
      const membersPartition = _.partition(autoSuggestMembers, member => {
        return member.profile.resourceType === 'email';
      });

      const newInvitations = membersPartition[0];
      const newMembers = membersPartition[1];

      // Keep track of all members updates, as well as all members we've searched for by
      // email in order to create validated share targets
      _.each(newMembers, newMember => {
        if (newMember.email) {
          userIdValidations[newMember.profile.id] = newMember.email;
        }

        membersUpdates[newMember.profile.id] = newMember.role;
        pendingMembers[newMember.profile.id] = true;
      });

      // Keep track of all invitations updates
      _.each(newInvitations, newInvitation => {
        invitationsUpdates[newInvitation.profile.id] = newInvitation.role;
        pendingInvitations[newInvitation.profile.id] = true;
      });

      // Update the members infinite scroll and the invitations list
      if (!_.isEmpty(newInvitations)) {
        updateInvitations();
      }

      if (!_.isEmpty(newMembers)) {
        infinityScroll.prependItems({ results: newMembers });
      }

      // Enable or disable the save button
      enableDisableSave();
    };

    /**
     * Removes a member from the list.
     */
    const deleteMember = function() {
      const memberId = $(this).attr('data-id');

      // Remove the list item
      if (oae.api.util.validation().isValidEmail(memberId)) {
        // Mark the invitation as deleted
        if (pendingInvitations[memberId]) {
          delete invitationsUpdates[memberId];
          pendingInvitations[memberId] = false;
        } else {
          invitationsUpdates[memberId] = false;
        }

        updateInvitations();
      } else {
        infinityScroll.removeItems(memberId);

        // Mark the member as deleted
        if (pendingMembers[memberId]) {
          delete membersUpdates[memberId];
          pendingMembers[memberId] = false;
        } else {
          membersUpdates[memberId] = false;
        }
      }

      // Enable or disable the save button
      enableDisableSave();
    };

    /**
     * Update the role of a member. This will only be persisted when the `Save` button is clicked.
     */
    const updateRole = function() {
      const memberId = $(this).attr('data-id');
      const selectedRole = $(this).val();

      if (oae.api.util.validation().isValidEmail(memberId)) {
        invitationsUpdates[memberId] = selectedRole;
      } else {
        membersUpdates[memberId] = selectedRole;
      }

      // Enable or disable the save button
      enableDisableSave();
    };

    /// //////////////
    // AUTOSUGGEST //
    /// //////////////

    /**
     * Disable/enable the add button when an item has been added/removed from the autosuggest field.
     */
    const autoSuggestChanged = function() {
      $('#manageaccess-share-update', $rootel).prop('disabled', !getAutosuggestSelection().length);
    };

    /**
     * Initializes the autosuggest used for sharing with other users or groups.
     */
    const setUpAutoSuggest = function() {
      oae.api.util.autoSuggest().setup(
        $('#manageaccess-share-autosuggest', $rootel),
        {
          allowEmail: true,
          exclude: widgetData.contextProfile.id,
          selectionChanged: autoSuggestChanged
        },
        null,
        () => {
          // Focus on the autosuggest field once it has been set up
          focusAutoSuggest();
        }
      );
    };

    /**
     * Focus on the autosuggest field used for sharing with other users or groups after the
     * autosuggest component has finished initializing and after the modal dialog has finished
     * loading.
     */
    var focusAutoSuggest = function() {
      // Only focus the autosuggest field when the share panel is showing
      if ($('#manageaccess-share', $rootel).is(':visible')) {
        oae.api.util.autoSuggest().focus($rootel);
      }
    };

    /**
     * Get the principals that were selected in the autosuggest field.
     *
     * @return {Object[]}               Trimmed member object as used by the members feed containing all properties necessary to render a list item in the infinite scroll
     */
    var getAutosuggestSelection = function() {
      // Convert these into an object that reflects the members feed, using a `profile` property
      // for the principal profile and a `role` property for the new role
      const selectedItems = [];
      $.each(oae.api.util.autoSuggest().getSelection($rootel), (index, selectedItem) => {
        // Autosuggest will provide the query that was used to find someone. If someone used
        // an email address to locate a user, we use it as criteria that indicates the user
        // performing the search can interact with that user, regardless of their profile
        // visibility or tenancy
        selectedItems.push({
          email: selectedItem.email,
          profile: _.omit(selectedItem, 'email'),
          role: $('#manageaccess-share-role', $rootel).val()
        });
      });

      return selectedItems;
    };

    /// //////////////////
    // VIEW MANAGEMENT //
    /// //////////////////

    /**
     * Shows a specified panel using the provided name.
     *
     * @param  {String}    panel    The name of the panel to show (i.e. 'overview', 'share', 'visibility')
     */
    const showPanel = function(panel) {
      // Show the container and footer
      $('.modal-body > div', $rootel).hide();
      $('#manageaccess-' + panel, $rootel).show();
      $('.modal-footer > div', $rootel).hide();
      $('#manageaccess-' + panel + '-footer', $rootel).show();
    };

    /**
     * Renders the visibility view.
     */
    const renderVisibility = function() {
      oae.api.util.template().render(
        $('#manageaccess-visibility-template', $rootel),
        {
          contextProfile: widgetData.contextProfile,
          visibility,
          messages: widgetData.messages
        },
        $('#manageaccess-visibility', $rootel)
      );
    };

    /**
     * Renders the add members view, including an autosuggest to add new members.
     */
    const renderShare = function() {
      oae.api.util.template().render(
        $('#manageaccess-share-template', $rootel),
        {
          contextProfile: widgetData.contextProfile,
          defaultRole: widgetData.defaultRole,
          roles: widgetData.roles
        },
        $('#manageaccess-share', $rootel)
      );

      setUpAutoSuggest();
    };

    /**
     * Renders the visibility settings overview.
     */
    const renderVisibilityOverview = function() {
      oae.api.util.template().render(
        $('#manageaccess-overview-visibility-template', $rootel),
        {
          contextProfile: widgetData.contextProfile,
          visibility,
          messages: widgetData.messages
        },
        $('#manageaccess-overview-visibility-container', $rootel)
      );

      renderSeeRequestsButton();
    };

    /// ///////////////////
    //     REQUESTS     //
    /// ///////////////////

    /**
     * Renders the requests panel.
     */
    const renderRequests = function() {
      // Disable the previous infinite scroll
      if (infinityScroll) {
        infinityScroll.kill();
      }

      const url = '/api/group/' + widgetData.contextProfile.id + '/join-request/all';
      // Set up the infinite scroll instance
      infinityScroll = $('#manageaccess-requests-well .oae-list', $rootel).infiniteScroll(
        url,
        {
          limit: 8
        },
        '#manageaccess-requests-selected-template',
        {
          scrollContainer: $('#manageaccess-requests-well', $rootel),
          postProcessor(data) {
            data.roles = widgetData.roles;
            data.displayOptions = {
              metadata: false
            };
            return data;
          }
        }
      );
    };

    /// ///////////////////////////
    // REQUESTS INFINITE SCROLL //
    /// ///////////////////////////

    /**
     * Render see requests button
     */
    var renderSeeRequestsButton = function() {
      oae.api.group.getRequestsJoinGroup(widgetData.contextProfile.id, (err, requests) => {
        if (!_.isEmpty(requests)) {
          $('#manageaccess-overview-requests').show();
          $('#manageaccess-overview-requests').css('display', 'block');
        }
        if (err || _.isEmpty(requests)) {
          $('#manageaccess-overview-requests').hide();
          $('#manageaccess-overview-requests').css('display', 'none');
        }
      });
    };

    /**
     * Reject a request
     */
    const rejectRequest = function() {
      const memberId = $(this).attr('data-id');
      const sizeListRequest = $('#manageaccess-requests-container')
        .find('li')
        .size();

      oae.api.group.rejectJoinGroupByRequest(
        widgetData.contextProfile.id,
        memberId,
        (err, requests) => {
          if (err) {
            oae.api.util.notification(
              oae.api.i18n.translate('__MSG__REJECT_REQUEST_FAIL__', 'manageaccess'),
              oae.api.i18n.translate('__MSG__FAILED_TO_REJECT_REQUEST__', 'manageaccess'),
              'error'
            );
          } else {
            oae.api.util.notification(
              oae.api.i18n.translate('__MSG__REJECT_REQUEST_SUCCESS__', 'manageaccess'),
              oae.api.i18n.translate(
                '__MSG__REQUEST_HAS_BEEN_SUCCESSFULLY_REJECTED__',
                'manageaccess'
              )
            );

            infinityScroll.removeItems(memberId);
            backIfNoMoreRequest(sizeListRequest);
          }
        }
      );
    };

    /**
     * Accept a request
     */
    const acceptRequest = function() {
      const memberId = $(this).attr('data-id');
      const role = $(this)
        .siblings('[class=form-group]')
        .find('select')
        .val();
      const sizeListRequest = $('#manageaccess-requests-container')
        .find('li')
        .size();

      oae.api.group.acceptJoinGroupByRequest(
        widgetData.contextProfile.id,
        memberId,
        role,
        (err, requests) => {
          if (err) {
            oae.api.util.notification(
              oae.api.i18n.translate('__MSG__ACCEPT_REQUEST_FAIL__', 'manageaccess'),
              oae.api.i18n.translate('__MSG__FAILED_TO_ACCEPT_REQUEST__', 'manageaccess'),
              'error'
            );
          } else {
            oae.api.util.notification(
              oae.api.i18n.translate('__MSG__ACCEPT_REQUEST_SUCCESS__', 'manageaccess'),
              oae.api.i18n.translate(
                '__MSG__REQUEST_HAS_BEEN_SUCCESSFULLY_ACCEPTED__',
                'manageaccess'
              )
            );

            infinityScroll.removeItems(memberId);
            backIfNoMoreRequest(sizeListRequest);
          }
        }
      );
    };

    var backIfNoMoreRequest = function(sizeListRequest) {
      // Display message if there is no more requests
      if (sizeListRequest - 1 === 0) {
        $('#no-more-requests-span').css('display', 'block');
      }
    };

    /// ///////////////////
    // DEINITIALIZATION //
    /// ///////////////////

    /**
     * Resets the widget to its initial state
     */
    const reset = function() {
      // Show the overview container and footer
      showPanel('overview');

      // Reset the invitations and members caches
      membersUpdates = {};
      invitationsUpdates = {};
      pendingMembers = {};
      pendingInvitations = {};
      serverInvitedMembers = [];

      // Disable the save button in overview
      $('#manageaccess-overview-save', $rootel).prop('disabled', true);
      // Disable the add button in the share view
      $('#manageaccess-share-update', $rootel).prop('disabled', true);
    };

    /// /////////////////
    // INITIALIZATION //
    /// /////////////////

    /**
     * Initializes the default state:
     * - Cache the context data
     * - Cache the current visibility setting
     * - Render the visibility overview
     * - Get and render the members
     *
     * @param  {Object}     ev                                      Standard event object coming from the `oae.context.send.manageaccess` or `oae.context.send.manageaccess-add` events
     * @param  {Object}     data                                    The context data object
     * @param  {Object}     data.api                                The API functions to use for getting and saving data
     * @param  {String}     data.api.getMembersURL                  URL that should be used for the members infinite scroll
     * @param  {Function}   data.api.setMembers                     Function that should be executed when updating the members
     * @param  {Function}   data.api.setVisibility                  Function that should be executed when updating the visibility
     * @param  {String}     data.defaultRole                        The role that should be selected by default when adding new members
     * @param  {Object}     data.contextProfile                     The context profile (e.g. group, content, discussion)
     * @param  {Object}     data.messages                           The translated messages to use inside of the widget
     * @param  {String}     data.messages.accessNotUpdatedBody      Translated body of the notification shown when the access can not be updated
     * @param  {String}     data.messages.accessNotUpdatedTitle     Translated title of the notification shown when the access can not be updated
     * @param  {String}     data.messages.accessUpdatedBody         Translated body of the notification shown when the access was successfully updated
     * @param  {String}     data.messages.accessUpdatedTitle        Translated title of the notification shown when the access was successfully updated
     * @param  {String}     data.messages.membersTitle              Translated title shown at the top of the members list
     * @param  {String}     data.messages.private                   Translated string used for the `private` visibility option
     * @param  {String}     data.messages.loggedin                  Translated string used for the `loggedin` visibility option
     * @param  {String}     data.messages.public                    Translated string used for the `public` visibility option
     * @param  {String}     data.messages.privateDescription        Translated description for the `private` visibility option in the visibility panel
     * @param  {String}     data.messages.loggedinDescription       Translated description for the `loggedin` visibility option in the visibility panel
     * @param  {String}     data.messages.publicDescription         Translated description for the `public` visibility option in the visibility panel
     * @param  {Object[]}   data.roles                              The available roles for members has 2 properties: `id` and `name`
     */
    const initManageAccess = function(ev, data) {
      // Initialize the widget variables that cache context data
      widgetData = data;
      visibility = widgetData.contextProfile.visibility;

      // Show translated messages
      $('#manageaccess-overview-shared-title', $rootel).text(widgetData.messages.membersTitle);

      // Show the modal and render views
      $('#manageaccess-modal', $rootel).modal({
        backdrop: 'static'
      });
      renderVisibilityOverview();
      getInvitations();
      getMembers();
    };

    /**
     * Sets up the manage access modal
     */
    const setUpManageAccessModal = function() {
      // Catches the click event on `oae-trigger-manageaccess` class elements
      // and shows the modal dialog.
      $(document).on('oae.trigger.manageaccess', initManageAccess);

      // Catches the `oae-trigger-manageaccess-add` click event, indicating the widget should go
      // straight into the share panel. Useful for adding new members.
      $(document).on('oae.trigger.manageaccess-add', (ev, data) => {
        initManageAccess(ev, data);
        showPanel('share');
        renderShare();
      });

      // In case the share panel is showing, focus on the autosuggest field after the modal has finished loading
      $('#manageaccess-modal', $rootel).on('shown.bs.modal', focusAutoSuggest);

      // Reset the widget when it is dismissed.
      $('#manageaccess-modal', $rootel).on('hidden.bs.modal', reset);
    };

    /**
     * Binds actions to various elements in the manageaccess widget
     */
    const addBinding = function() {
      // Render the visibility container when clicking 'change' in the visibility well
      $rootel.on('click', '#manageaccess-change-visibility', () => {
        renderVisibility();
        showPanel('visibility');
      });

      // Update the overview container when saving the visibility setting
      $rootel.on('click', '#manageaccess-visibility-save', () => {
        // Update the visibility in the cached visibility
        visibility = $('.oae-large-options-container input[type="radio"]:checked', $rootel).val();
        renderVisibilityOverview();
        showPanel('overview');
        // Enable or disable the save button
        enableDisableSave();
      });

      // Render the share container when clicking 'add more' at the bottom of the list of members
      $rootel.on('click', '#manageaccess-share-add-more', () => {
        showPanel('share');
        renderShare();
      });

      // Update the overview container when saving the autosuggest values
      $rootel.on('click', '#manageaccess-share-update', () => {
        addNewMembers(getAutosuggestSelection());
        showPanel('overview');
        // Disable the add button in the share view
        $('#manageaccess-share-update', $rootel).prop('disabled', true);
      });

      // Catch changes in the visibility radio group
      $rootel.on('change', '.oae-large-options-container input[type="radio"]', function() {
        $('.oae-large-options-container label', $rootel).removeClass('checked');
        $(this)
          .parents('label')
          .addClass('checked');
      });

      // Resend an invitation email
      $rootel.on('click', '.oae-listitem-actions .manageaccess-invitation-resend', function() {
        const email = $(this).attr('data-email');
        resendInvitation(email);
      });

      // Delete a member from the list
      $rootel.on('click', '.oae-listitem-actions .oae-listitem-remove', deleteMember);

      // Update a member's role in the list
      $rootel.on('change', '.oae-listitem-actions select', updateRole);

      // Cancel the editing of visibility or members and go back to the overview
      $rootel.on('click', '.manageaccess-cancel', () => {
        showPanel('overview');
      });

      // Back to the editing of visibility or members and go back to the overview
      $rootel.on('click', '.manageaccess-back', () => {
        showPanel('overview');
        getMembers();
        renderSeeRequestsButton();
      });

      // Save the visibility and members
      $rootel.on('click', '#manageaccess-overview-save', saveManageAccess);

      // Cancel the editing of visibility or members and go back to the overview
      $rootel.on('click', '#manageaccess-see-requests', () => {
        showPanel('requests');
        renderRequests();
        $('#no-more-requests-span').css('display', 'none');
      });

      // Reject a request
      $rootel.on('click', '.oae-listitem-actions .oae-listitem-reject', rejectRequest);

      // Accept a request
      $rootel.on('click', '.oae-listitem-actions .oae-listitem-accept', acceptRequest);
    };

    setUpManageAccessModal();
    addBinding();
  };
});
