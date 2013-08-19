/*!
 * Copyright 2013 Apereo Foundation (AF) Licensed under the
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

define(['exports', 'jquery', 'oae.core'], function(exports, $, oae) {

    /**
     * Toggles a container to show or hide
     */
    var toggleContainer = exports.toggleContainer = function() {
        $(this).next().toggle(400);
    };

    /**
     * Shows a confirmation dialog to the user using predefined data
     * usage
     * showConfirmationModal({
     *     'id' (required): 'deletetenant-modal',
     *     'title' (required): 'Delete tenant Cambridge University',
     *     'message' (required): 'You cannot undo this operation. Are you sure you want to delete this tenant?',
     *     'cancel': 'Cancel',
     *     'confirm' (required): 'Yes, delete tenant',
     *     'confirmclass': (optional): 'danger' (for possible values see http://twitter.github.com/bootstrap/base-css.html#buttons)
     *     'confirmed' (required): function() {
     *         // Add handling for confirmation
     *         // Hide the dialog when done (optionally show a success message)
     *         $('#deletetenant-modal').modal('hide');
     *     }
     * });
     *
     * @param {Object}  data    Data object used to render the modal dialog. All required elements are shown above in 'usage' and should be provided
     */
    var showConfirmationModal = exports.showConfirmationModal = function(data) {
        oae.api.util.template().render($('#admin-confirmation-template'), {'modal': data}, $('#admin-confirmation-container'));
        $('#' + data.id).modal({
            'backdrop': 'static'
        });
        $('#' + data.id + '-confirm', $('#' + data.id)).click(data.confirmed);
    };

});
