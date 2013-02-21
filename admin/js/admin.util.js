/*!
 * Copyright 2012 Sakai Foundation (SF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['exports', 'jquery', 'oae.core'], function(exports, $, oae) {

    /**
     * Shows an error to the user
     * usage:
     * showError({
     *     'title': 'Operation failed',
     *     'message' (required): 'The tenant could not be deleted.'
     * });
     * 
     * @param {Object}   data               Data object used to render the warning. Missing optional elements will not be rendered. All available elements are shown above in 'usage'
     * @param {Element}  [$outputElement]   jQuery element to render the error in. By default the container renders on top of the page in absolute position.
     */
    exports.showError = function(data, $outputElement) {
        if (!$outputElement) {
            $outputElement = $('#admin-error-container');
        }
        oae.api.util.renderTemplate($('#admin-error-template'), {'error': data}, $outputElement);
    };

    /**
     * Shows a warning to the user
     * usage:
     * showWarning({
     *     'title': 'Are you sure?',
     *     'message' (required): 'Are you sure you want to delete this tenant?'
     * });
     * 
     * @param {Object}   data               Data object used to render the warning. Missing optional elements will not be rendered. All available elements are shown above in 'usage'
     * @param {Element}  [$outputElement]   jQuery element to render the warning in. By default the container renders on top of the page in absolute position.
     */
    exports.showWarning = function(data, $outputElement) {
        if (!$outputElement) {
            $outputElement = $('#admin-warning-container');
        }
        oae.api.util.renderTemplate($('#admin-warning-template'), {'warning': data}, $outputElement);
    };

    /**
     * Shows a success message to the user
     * usage:
     * showSuccess({
     *     'title': 'Tenant deleted.',
     *     'message' (required): 'The tenant was successfully deleted',
     *     'sticky': true
     * });
     * 
     * @param {Object}   data               Data object used to render the success message. Missing optional elements will not be rendered. All available elements are shown above in 'usage'
     * @param {Element}  [$outputElement]   jQuery element to render the success message in. By default the container renders on top of the page in absolute position.
     */
    exports.showSuccess = function(data, $outputElement) {
        if (!$outputElement) {
            $outputElement = $('#admin-success-container');
        }
        oae.api.util.renderTemplate($('#admin-success-template'), {'success': data}, $outputElement);
        if (!data.sticky) {
            setTimeout( function(){
                $outputElement.fadeOut('slow', function() {
                    $outputElement.html('');
                    $outputElement.show();
                });
            }, 2500);
        }
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
    exports.showConfirmationModal = function(data) {
        oae.api.util.renderTemplate($('#admin-confirmation-template'), {'modal': data}, $('#admin-confirmation-container'));
        $('#' + data.id).modal();
        $('#' + data.id + '-confirm', $('#' + data.id)).click(data.confirmed);
    };

});
