/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*
 * Dependencies
 *
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 */

require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai_global.accountpreferences
     *
     * @class accountpreferences
     *
     * @description
     * Creategroup widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.accountpreferences = function(tuid, showSettings) {

        var me = sakai.data.me;
        var languages = {};
        var preferencesChanges = false;
        var privacyChanges = false;
        var passwordChanges = false;
        var emailChanges = false;
        var pageReload = false;


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var accountPreferences = 'accountpreferences';
        var accountPreferencesID = '#accountpreferences';
        var accountPreferencesClass = '.accountpreferences';

        // Containers
        var accountPreferencesTabsButtons = '#accountpreferences_tabs button';
        var accountPreferencesPreferencesTab = '#accountpreferences_preferences_tab';
        var accountPreferencesPrivacyTab = '#accountpreferences_privacy_tab';
        var accountPasswordTab = '#accountpreferences_password_tab';
        var accountEmailTab = '#accountpreferences_email_tab';
        var accountPreferencesContainer =  '#accountpreferences_container';
        var preferContainer = accountPreferencesID + '_preferContainer';
        var privacyContainer = accountPreferencesID + '_changePrivacyContainer';
        var passChangeContainer =  accountPreferencesID + '_changePassContainer';
        var emailChangeContainer =  accountPreferencesID + '_changeEmailContainer';

        // Forms
        var accountPreferencesPasswordChange = accountPreferencesID + '_password_change';
        var accountPreferencesPreferencesForm = accountPreferencesID + '_preferences_form';
        var accountPreferencesEmailChange = accountPreferencesID + '_email_change';

        // Textboxes
        var currentPassTxt = '#curr_pass';
        var newPassTxt = '#new_pass';
        var newRetypePassTxt = '#retype_pass';

        // Buttons
        var saveButton = accountPreferencesID + '_submit';
        var saveNewPass = accountPreferencesID + '_saveNewPass';
        var saveRegional = accountPreferencesID + '_submitRegional';
        var accountPreferencesCancel = '.accountpreferences_cancel';

        // classes
        var buttonDisabled = 's3d-disabled';
        var tabSelected = 'selected';
        var taggingSelected = 'accountpreferences_autotagging_selected';

        // messages
        var errorPassNotEqual = accountPreferencesID + '_error_passNotEqual';
        var errorIncorrectPass = accountPreferencesID + '_error_incorrectPass';
        var errorFailChangePass = accountPreferencesID + '_error_failChangePass';
        var errorFailChangePassBody = accountPreferencesID + '_error_failChangePassBody';
        var messagePassChanged = accountPreferencesID + '_message_passChanged';
        var messagePassChangedBody = accountPreferencesID + '_message_passChangedBody';
        var errorInvalidPass = accountPreferencesID + '_error_invalidPass';
        var errorFailChangeLang = accountPreferencesID + '_error_failChangeLang';
        var messageChangeLangTitle = accountPreferencesID + '_message_ChangeLang_title';
        var messageChangeLang = accountPreferencesID + '_message_ChangeLang';
        var errorPassSame = accountPreferencesID + '_error_passSame';
        var errorFailChangeEmail = accountPreferencesID + '_error_failChangeEmail';
        var errorFailChangeEmailBody = accountPreferencesID + '_error_failChangeEmailBody';
        var messageEmailChanged = accountPreferencesID + '_message_emailChanged';
        var messageEmailChangedBody = accountPreferencesID + '_message_emailChangedBody';

        // Comboboxes
        var timezonesContainer = '#time_zone';
        var languagesContainer = '#pass_language';

        // templates
        var languagesTemplate = accountPreferences + '_languagesTemplate';

        var $accountpreferences_langloc_settings = $('#accountpreferences_langloc_settings');
        var $tabList = $('#accountpreferences_tabs');

        var myClose = function(hash) {
            hash.o.remove();
            hash.w.hide();
        };

        var myShow = function(hash) {
            doInit();
            loadPrivacySettings();
            hash.w.show();
        };

        ///////////////////////
        // Utility functions //
        ///////////////////////
        /**
         * Public function that can be called from elsewhere
         * (e.g. sites widget)
         * It initializes the accountPreferencesContainer widget and shows the jqmodal (ligthbox)
         */
        var initialize = function() {
            sakai.api.Util.Modal.open(accountPreferencesContainer);
        };

        $(document).on('click', '.accountpreferences_trigger', initialize);

        /////////////////
        // Change pass //
        /////////////////

        /**
         * Check if the input given by the user is valid
         * @return {Boolean} true if input is valid
         */
        var checkIfInputValid =function() {
            var pass = $(currentPassTxt).val();
            var newPass1 = $(newPassTxt).val();
            var newPass2 = $(newRetypePassTxt).val();

            // check if the user didn't just fill in some spaces
            return (pass.replace(/ /g, '') !== '' && newPass1.replace(/ /g, '') !== '' && newPass2.replace(/ /g, '') !== '');
        };

        /**
         * Clears all the password fields
         */
        var clearPassFields = function() {
            $(currentPassTxt).val('');
            $(newPassTxt).val('');
            $(newRetypePassTxt).val('');
        };

        /**
         * Makes all the checks
         * are the new passwords equal
         *
         */
        var changePass = function() {
            var pass = $(currentPassTxt).val();
            var newPass1 = $(newPassTxt).val();
            var newPass2 = $(newRetypePassTxt).val();

                /*
                 * oldPassword : the original password
                 * password : the new password
                 */
                var requestbody = {'oldPwd' : pass, 'newPwd' : newPass1, 'newPwdConfirm' : newPass2, '_charset_': 'utf-8'};

                $.ajax({
                    url :sakai.config.URL.USER_CHANGEPASS_SERVICE.replace(/__USERID__/, sakai.data.me.user.userid),
                    type : 'POST',
                    data : requestbody,
                    success : function(data) {

                        // show successful password change message through gritter
                        sakai.api.Util.notification.show($(messagePassChanged).html(), $(messagePassChangedBody).html());
                        // clear all the fields
                        clearPassFields();
                        passwordChanges = false;
                        finishSave();
                    },
                    error: function(xhr, textStatus, thrownError) {

                        // show error message through gritter
                        sakai.api.Util.notification.show($(errorFailChangePass).html(), $(errorFailChangePassBody).html());
                        // clear all the fields
                        clearPassFields();
                    }
                });

        };

        /////////////////////////////
        // Change privacy settings //
        /////////////////////////////

        var loadPrivacySettings = function() {
            sakai.api.User.loadPrivacySettings(function(setting) {
                checkPrivacySetting($('#accountpreferences_privacy_' + setting).parent());
            });
        };

        var checkPrivacySetting = function($option) {
            $('.accountpreferences_selectable').addClass('accountpreferences_unselected_rbt');
            $('.accountpreferences_selectable').removeClass('s3d-outer-shadow-container');
            $option.addClass('s3d-outer-shadow-container');
            $option.removeClass('accountpreferences_unselected_rbt');
            $('input', $option).attr('checked', 'checked');
        };

        $('.accountpreferences_selectable').on('click', function() {
            checkPrivacySetting($(this));
            // enable the save button
            enableElements($(saveButton));
            privacyChanges = true;
        });

        $('#accountpreferences_privacy_change').on('submit', function(ev) {
            var option = $('.accountpreferences_selectable input:radio[name="accountpreferences_privacy_radio"]:checked').val();
            sakai.api.User.savePrivacySettings(option, function(success) {
                sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('PRIVACY_SETTINGS', 'accountpreferences'), sakai.api.i18n.getValueForKey('PRIVACY_SETTINGS_UPDATED', 'accountpreferences'));
                privacyChanges = false;
                finishSave();
            });
            ev.stopPropagation();
            return false;
        });

        //////////////////////////////
        // Change Country, Timezone //
        //////////////////////////////

        /**
         * Selects the language from the combobox based on the country and the language
         * @param {String} countrycode: ISO3 code of the country
         * @param {String} languageCode: ISO3 code of the language
         */
        var selectLanguage= function(countrycode, languageCode) {
            $(languagesContainer + ' option[value="' + languageCode + '_' + countrycode + '"]').attr('selected', true);
        };

        /**
         * Selects the timezone from the combobox
         * @param {String} timezone: timezone
         */
        var selectTimezone= function(timezone) {
            $(timezonesContainer + ' option[value="' + timezone.name + '"]').attr('selected', true);
        };

        /**
         * Set whether to tag documents automatically
         *
         */
        var selectAutoTagging = function(autoTag) {
            autoTag = autoTag || false;
            $('#accountpreferences_section_autotagging_buttons button').removeClass(taggingSelected);
            $('input:radio[name="autotagging"][value=' + autoTag + ']').attr('checked', 'checked');
            $('#accountpreferences_section_autotagging_buttons #button_autotagging_' + autoTag).addClass(taggingSelected);
            $('#tag_msg_info').attr('disabled', !autoTag);
        };

        /**
         * Set send message after tagging'
         *
         */
        var selectSendTagMsg = function(sendTagMsg) {
            if (sendTagMsg) {
                $('#tag_msg_info').attr('checked', 'checked');
            } else {
                $('#tag_msg_info').removeAttr('checked');
            }
        };

        /**
         * Puts the languages in a combobox
         * @param {Object} languages
         */
        var putLangsinCmb = function(languages) {
            $(languagesContainer).html(sakai.api.Util.TemplateRenderer(languagesTemplate, languages));
            selectLanguage(me.user.locale.country, me.user.locale.language);
        };

        /**
         * Gets all the languages supported and puts them in a combobox
         */
        var getLanguages = function() {
            var langs = $.extend([], sakai.config.Languages);
            if (sakai.config.displayDebugInfo) {
                langs.push({
                    'country': 'GB',
                    'displayName': 'i18n debug',
                    'language': 'lu'
                });
            }
            var languages = {languages:$.extend(langs, {}, true)};
            putLangsinCmb(languages);
        };

        /**
         * Saves the regional properties to JCR
         */
        var saveRegionalToMe = function() {
            var language = $(languagesContainer).val();
            var isAutoTagging = $('input:radio[name="autotagging"]:checked').val();
            var sendTagMsg = $('#tag_msg_info').is(':checked');
            var locale = {
                'locale' : language,
                'timezone' : $(timezonesContainer).val(),
                '_charset_':'utf-8',
                ':sakai:update-profile': false,
                'isAutoTagging': isAutoTagging,
                'sendTagMsg': sendTagMsg
            };

            // if regional Setting and langauge is changed only then save the changes
            //if ( || me.user.properties.isAutoTagging !== isAutoTagging || me.user.properties.sendTagMsg !== sendTagMsg) {
            $.ajax({
                data: locale,
                url: '/system/userManager/user/' + me.user.userid + '.update.html',
                type: 'POST',
                success: function(data) {

                    if (language !== me.user.locale.language + '_' + me.user.locale.country || me.user.locale.timezone.name !== $(timezonesContainer).val()) {
                        sakai.api.Util.notification.show($(messageChangeLangTitle).html(), $(messageChangeLang).html());
                        // Reload the page if the language for a user has changed
                        pageReload = true;
                    } else {
                        sakai.data.me.user.properties.isAutoTagging = isAutoTagging;
                        sakai.data.me.user.properties.sendTagMsg = sendTagMsg;
                        sakai.api.Util.notification.show($(messageChangeLangTitle).html(), $(messageChangeLang).html());
                    }
                    preferencesChanges = false;
                    finishSave();

                },
                error: function(xhr, textStatus, thrownError) {
                    // show regional setting error message through gritter
                    sakai.api.Util.notification.show($(messageChangeLangTitle).html(), $(errorFailChangeLang).html());
                }
            });
        };

        var saveEmail = function() {
            var emailVal = $.trim($('#accountpreferences_email').val());
            var data = {'email': emailVal};
            sakai.api.User.updateUserProfile(
                sakai.data.me.user.userid,
                'basic', data, false, {}, false, function(success, data) {
                    if (success) {
                        emailChanges = false;
                        sakai.api.Util.notification.show(
                            $(messageEmailChanged).html(),
                            $(messageEmailChangedBody).html());
                        $(accountPreferencesContainer).jqmHide();
                    } else {
                        sakai.api.Util.notification.show(
                            $(messageEmailChanged).html(),
                            $(messageEmailChangedBody).html());
                    }
                }
            );
        };

        $(saveButton).on('click', function() {
            if (preferencesChanges) {
                $(accountPreferencesPreferencesForm).submit();
            }
            if (privacyChanges) {
                $('#accountpreferences_privacy_change').submit();
            }
            if (passwordChanges) {
                $(accountPasswordTab).click();
                if ($(accountPreferencesPasswordChange).valid()) {
                    $(accountPreferencesPasswordChange).submit();
                }
            }
            if (emailChanges) {
                $('#accountpreferences_email_change').submit();
            }
        });

        /**
         * Hides the dialog box when saving is complete and reloads the page if needed
         */
        var finishSave = function() {
            if (!preferencesChanges && !privacyChanges && !passwordChanges) {
                sakai.api.Util.Modal.close(accountPreferencesContainer);
                if (pageReload) {
                    window.setTimeout(function() {
                        document.location.reload();
                    },2000);
                }
            }
        };

        /**
         * Initialise form validation
         */
        var initValidation = function() {
            var validateOpts = {
                rules: {
                    curr_pass: {
                        minlength: 4
                    },
                    new_pass: {
                        minlength: 4,
                        newpw: true
                    },
                    retype_pass: {
                        minlength: 4,
                        equalTo: '#new_pass'
                    }
                },
                messages: {
                    retype_pass: {
                        'equalTo': sakai.api.i18n.getValueForKey('PLEASE_ENTER_PASSWORD_TWICE', 'accountpreferences')
                    }
                },
                'methods': {
                    'newpw': {
                        'method': function(value, element) {
                            return this.optional(element) || (value !== $('#curr_pass').val());
                        },
                        'text': $(errorPassSame).html()
                    }
                },
                submitHandler: changePass,
                onfocusout: function(element) {
                    $(element).valid();
                }
            };

            // Initialize the validate plug-in
            sakai.api.Util.Forms.validate($(accountPreferencesPasswordChange), validateOpts);

            var validatePreferencesOpts = {
                submitHandler: saveRegionalToMe
            };

            // Initialize the validate plug-in
            sakai.api.Util.Forms.validate($(accountPreferencesPreferencesForm), validatePreferencesOpts);

            var validateEmailOpts = {
                submitHandler: saveEmail
            };

            // Initialize the validate plug-in
            sakai.api.Util.Forms.validate($(accountPreferencesEmailChange), validateEmailOpts);
        };

        /**
         * Disable or enable elements
         * can take a single or multivalue jQuery obj
         */
        var enableElements = function(jQueryObj) {
            jQueryObj.removeAttr('disabled');
            jQueryObj.removeClass(buttonDisabled);
        };

        var disableElements = function(jQueryObj) {
            jQueryObj.attr('disabled', 'disabled');
            jQueryObj.addClass(buttonDisabled);
        };


        ////////////////////
        // Event Handlers //
        ////////////////////

        /*
         * Add jqModal functionality to the container.
         * This makes use of the jqModal (jQuery Modal) plugin that provides support
         * for lightboxes
         */
        sakai.api.Util.Modal.setup(accountPreferencesContainer, {
            modal: true,
            overlay: 20,
            toTop: true,
            onShow: myShow,
            onHide: myClose
        });

        $('#accountpreferences_email').on('change', function() {
            enableElements($(saveButton));
            emailChanges = true;
        });

        /** Binds all the regional settings select box change **/
        $('#time_zone, #pass_language, input[name="autotagging"], #tag_msg_info').change(function(e) {
            // enable the save button
            enableElements($(saveButton));
            preferencesChanges = true;
        });

        /** Binds all the password boxes (keyup) **/
        $('input[type="password"]', passChangeContainer).keyup(function(e) {

            // If we'd use keypress for this then the input fields wouldn't be updated yet
            // check if the user didn't just fill in some spaces
            if (checkIfInputValid()) {
                // enable the save button
                enableElements($(saveButton));
                passwordChanges = true;
            }
        });

        $('#accountpreferences_section_autotagging_buttons button').click(function(e) {
            selectAutoTagging($(this).attr('data-sakai-autotagging') === 'true' ? true : false);
            enableElements($(saveButton));
            preferencesChanges = true;
            e.preventDefault();
        });

        var hideAllPanes = function() {
            $(passChangeContainer).hide();
            $(preferContainer).hide();
            $(privacyContainer).hide();
            $(emailChangeContainer).hide();
        };

        $(accountPreferencesPreferencesTab).on('click', function() {
            $(accountPreferencesTabsButtons).removeClass(tabSelected);
            $(accountPreferencesPreferencesTab).addClass(tabSelected);
            hideAllPanes();
            $(preferContainer).show();
        });

        $(accountPreferencesPrivacyTab).on('click', function() {
            $(accountPreferencesTabsButtons).removeClass(tabSelected);
            $(accountPreferencesPrivacyTab).addClass(tabSelected);
            hideAllPanes();
            $(privacyContainer).show();
        });

        $(accountPasswordTab).on('click', function() {
            $(accountPreferencesTabsButtons).removeClass(tabSelected);
            $(accountPasswordTab).addClass(tabSelected);
            hideAllPanes();
            $(passChangeContainer).show();
        });

        $(accountEmailTab).on('click', function() {
            $(accountPreferencesTabsButtons).removeClass(tabSelected);
            $(accountEmailTab).addClass(tabSelected);
            hideAllPanes();
            $(emailChangeContainer).show();
        });

        $(accountPreferencesCancel).off('click').on('click', function() {
            sakai.api.Util.Modal.close(accountPreferencesContainer);
        });

        // Bind arrow keys for changing tabs
        $tabList.on('keydown', 'button', (function(e) {
            var $clickedLi = $(this).parent();
            if (e.which === $.ui.keyCode.RIGHT || e.which === $.ui.keyCode.DOWN) {
                if ($clickedLi.next(':visible').length) {
                    // focus on next tab
                    $clickedLi.next(':visible').find('button').focus().click();
                } else {
                    // focus on first tab
                    $clickedLi.siblings(':visible:first').find('button').focus().click();
                }
                return false;
            } else if (e.which === $.ui.keyCode.LEFT || e.which === $.ui.keyCode.UP) {
                if ($clickedLi.prev(':visible').length) {
                    // focus on previous tab
                    $clickedLi.prev(':visible').find('button').focus().click();
                } else {
                    // focus on last tab
                    $clickedLi.siblings(':visible:last').find('button').focus().click();
                }
                return false;
            }
        }));

        /////////////////////////////
        // INITIALISATION FUNCTION //
        /////////////////////////////

        var doInit = function() {
            if (!sakai.data.me.user.anon) {
                // An anonymous user shouldn't have access to this page
                clearPassFields();
                disableElements($(saveButton));
                selectTimezone(me.user.locale.timezone);
                selectAutoTagging(me.user.properties.isAutoTagging);
                selectSendTagMsg(me.user.properties.sendTagMsg);

                getLanguages();
                initValidation();

                // if allowpasswordchange is false then hide the regional setting
                if (!sakai.config.allowPasswordChange) {
                    $(accountPasswordTab).hide();
                    $(passChangeContainer).hide();
                }
                if (sakai.config.emailLocation !== 'accountpreferences') {
                    $(accountEmailTab).parent().hide();
                    $(emailChangeContainer).hide();
                } else {
                    var emailVal = sakai.api.User.getProfileBasicElementValue(
                        sakai.data.me.profile,
                        'email');
                    $('#accountpreferences_email').val(emailVal);
                }
                if (sakai.config.displayTimezone || sakai.config.displayLanguage) {
                    $accountpreferences_langloc_settings.show();
                    if (sakai.config.displayTimezone) {
                        $('#accountpreferences_select_timezone').show();
                    }
                    if (sakai.config.displayLanguage) {
                        $('#accountpreferences_select_language').show();
                    }
                }
            }
        };

    };

    sakai.api.Widgets.widgetLoader.informOnLoad('accountpreferences');
});
