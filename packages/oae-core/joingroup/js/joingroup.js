/*!
 * Copyright 2018 Apereo Foundation (AF) Licensed under the
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

define(['jquery', 'underscore', 'oae.core'], ($, _, oae) => {
  return function(uid) {
    // The widget container
    const $rootel = $('#' + uid);

    // Caches the initialization data containing the context profile and the various strings
    let widgetData = null;

    /**
     * Close the modal
     */
    const closeModal = function() {
      // Hide the modal
      $('#joingroup-modal', $rootel).modal('hide');

      // Reset
      $('#joingroup-already-sent-request').hide();
      $('#joingroup-request-message').hide();
      $('#joingroup-already-sent-request').css('display', 'none');
      $('#joingroup-request-message').css('display', 'none');
    };

    /**
     * Create a request
     *
     * @param  {Function}       callback            Standard callback function
     * @param  {Object}         callback.err        Error object containing error code and error message
     */
    const createRequestJoinGroup = function() {
      oae.api.group.createRequestJoinGroup(widgetData.contextProfile.id, (err, data) => {
        if (err) {
          oae.api.util.notification(
            oae.api.i18n.translate('__MSG__SEND_REQUEST_GROUP_FAILED__', 'joingroup'),
            oae.api.i18n.translate(err.msg, 'joingroup'),
            'error'
          );
        } else {
          oae.api.util.notification(
            oae.api.i18n.translate('__MSG__SEND_REQUEST_GROUP_SUCCESS__', 'joingroup'),
            oae.api.i18n.translate('__MSG__SUCCESS_TO_SEND_REQUEST_JOIN_GROUP__', 'joingroup')
          );
        }

        closeModal();
        return false;
      });
    };

    /**
     * Remove a request
     *
     * @param  {Function}       callback            Standard callback function
     * @param  {Object}         callback.err        Error object containing error code and error message
     */
    const cancelRequestJoinGroup = function() {
      oae.api.group.cancelRequestJoinGroup(widgetData.contextProfile.id, (err, data) => {
        if (err) {
          oae.api.util.notification(
            oae.api.i18n.translate('__MSG__CANCEL_REQUEST_GROUP_FAILED__', 'joingroup'),
            oae.api.i18n.translate(err.msg, 'joingroup'),
            'error'
          );
        } else {
          oae.api.util.notification(
            oae.api.i18n.translate('__MSG__CANCEL_REQUEST_GROUP_SUCCESS__', 'joingroup'),
            oae.api.i18n.translate('__MSG__SUCCESS_TO_CANCEL_REQUEST_JOIN_GROUP__', 'joingroup')
          );
        }

        closeModal();
        return false;
      });
    };

    /**
     * Reset the widget to its original state when the modal dialog is closed
     */
    const setUpReset = function() {
      // Reset the form
      $('#joingroup-modal').on('hidden.bs.modal', () => {
        const $form = $('#joingroup-form', $rootel);
        $form[0].reset();
        oae.api.util.validation().clear($form);
      });
    };

    /**
     * Sets up the modal
     */
    const setUpJoinGroupModal = function() {
      // Show the modal
      $(document).on('oae.trigger.joingroup', (ev, data, e) => {
        widgetData = data;

        $('#joingroup-modal', $rootel).modal({
          backdrop: 'static'
        });

        // Get request
        oae.api.group.getRequestJoinGroup(widgetData.contextProfile.id, (err, request) => {
          if (request) {
            renderAlert();
          } else {
            renderMessage();
          }
        });
      });
    };

    /**
     * Binds actions to various elements in the joingroup modal
     */
    const addBinding = function() {
      $rootel.on('click', '#joingroup-save', () => {
        createRequestJoinGroup();
      });

      $rootel.on('click', '#joingroup-remove', () => {
        cancelRequestJoinGroup();
      });
    };

    /**
     * Renders the alert message.
     */
    var renderAlert = function() {
      oae.api.util.template().render(
        $('#joingroup-action-template', $rootel),
        {
          requestAlreadyExist: false
        },
        $('#joingroup-action', $rootel)
      );

      oae.api.util
        .template()
        .render(
          $('#joingroup-already-sent-request-template', $rootel),
          null,
          $('#joingroup-already-sent-request', $rootel)
        );

      $('#joingroup-already-sent-request').show();
      $('#joingroup-already-sent-request').css('display', 'block');
    };

    /**
     * Renders message.
     */
    var renderMessage = function() {
      oae.api.util.template().render(
        $('#joingroup-action-template', $rootel),
        {
          requestAlreadyExist: true
        },
        $('#joingroup-action', $rootel)
      );

      oae.api.util
        .template()
        .render(
          $('#joingroup-request-message-template', $rootel),
          null,
          $('#joingroup-request-message', $rootel)
        );

      $('#joingroup-request-message').show();
      $('#joingroup-request-message').css('display', 'block');
    };

    addBinding();
    setUpReset();
    setUpJoinGroupModal();
  };
});
