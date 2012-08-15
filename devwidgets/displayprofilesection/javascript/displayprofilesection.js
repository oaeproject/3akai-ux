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
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 */
require(['jquery', 'sakai/sakai.api.core', 'underscore'], function($, sakai, _) {

    /**
     * @name sakai_global.displayprofilesection
     *
     * @class displayprofilesection
     *
     * @description
     * Initialize the displayprofilesection widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.displayprofilesection = function( tuid, showSettings, widgetData ) {
        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var editing = false;
        var userid = false;
        var multiple = false;
        var multipleSectionLength = 0;
        var sectionData = false;
        var allowUpdate = true;

        ///////////////////
        // CSS Selectors //
        ///////////////////

        var $rootel = $( '#' + tuid ),
            $displayprofilesection_container = $( '#displayprofilesection_container', $rootel ),
            $displayprofilesection_header = $( '#displayprofilesection_header', $rootel ),
            $displayprofilesection_header_template = $( '#displayprofilesection_header_template', $rootel ),
            $displayprofilesection_body = $( '#displayprofilesection_body', $rootel ),
            $displayprofilesection_body_template = $( '#displayprofilesection_body_template', $rootel ),
            $displayprofilesection_view_template = $( '#displayprofilesection_view_template', $rootel ),
            $displayprofilesection_edit_template = $( '#displayprofilesection_edit_template', $rootel ),
            $displayprofilesection_edit_multiple_template = $( '#displayprofilesection_edit_multiple_template', $rootel ),
            $displayprofilesection_view_multiple_template = $( '#displayprofilesection_view_multiple_template' , $rootel ),
            $displayprofilesection_view_no_results_template = $( '#displayprofilesection_view_no_results_template', $rootel ),
            $profile_message_form_successful = $( '#profile_message_form_successful', $rootel ),
            $profile_error_form_error_server = $( '#profile_error_form_error_server', $rootel ),
            $displayprofilesection_sections_multiple = false,
            $displayprofilesection_add_button = false,
            $form = false;

        // Transform the form values from a multiple-assign section into a different data structure
        var getMultipleValues = function( values ) {
            var uniqueContainers = $( 'div.displayprofilesection_multiple_section' );
            var multipleValues = {};
            $.each( uniqueContainers, function( i, elt ) {
                multipleValues[ $( elt ).attr( 'id' ).replace( 'form_group_', '' ) ] = {
                    order: i
                };
            });
            $.each( values, function( i, val ) {
                // Each ID is of format fieldtitle_formuniqueid
                var field = i.substring( 0, i.lastIndexOf( '_' ));
                var mvKey = i.substring( i.lastIndexOf( '_' ) + 1 );
                multipleValues[ mvKey ][ field ] = val;
            });
            values = multipleValues;
            return values;
        };

        var handleSave = function( success, data ) {
            if (success) {
                sakai.api.Util.notification.show('', $profile_message_form_successful.text() , sakai.api.Util.notification.type.INFORMATION);
            } else {
                sakai.api.Util.notification.show('', $profile_error_form_error_server.text() , sakai.api.Util.notification.type.ERROR);
                debug.error('The profile data couldn\'t be saved successfully');
            }
        };

        /**
         * Enables the 'Update Profile' button when the user has changed their profile information.
         */
        var enableUpdate = function() {
            if (allowUpdate) {
                $('button.profile-section-save-button', $rootel).removeAttr('disabled');
            }
        };

        var saveValues = function() {
            // Serialize the data from the form for saving
            var values = $form.serializeObject();
            if ( multiple ) {
                values = getMultipleValues( values );
            }

            // Get tags & categories if they're in this form
            var tags = [];
            var $tagfield = $displayprofilesection_body.find( 'textarea[data-tag-field]' );
            if ( $tagfield.length ) {
                // Remove the hidden autosuggest input field from the values
                $form.find( 'input' ).each( function( i, input ) {
                    if ( $( input ).hasClass( 'as-values' ) ) {
                        delete values[ $( input ).attr('name') ];
                    }
                });
                tags = sakai.api.Util.AutoSuggest.getTagsAndCategories( $tagfield, true );
            }
            sakai.api.User.updateUserProfile(userid, widgetData.sectionid, values, tags, sectionData, multiple, handleSave);
            $('button.profile-section-save-button', $rootel).attr('disabled', 'disabled');
            return false;
        };

        // Remove a section from the a multi-assign section
        var removeSection = function( unique ) {
            $( 'div#form_group_' + unique ).remove();
            sakai.api.User.deleteUserProfileSection( userid, widgetData.sectionid, unique, handleSave);
            if ( $( 'div.displayprofilesection_multiple_section' ).length === 0 ) {
                $( 'button.profile-section-save-button', $rootel ).hide();
            }
        };

        // Add a new section to a multi-assign section
        var addEmptySection = function( section, template ) {
            var unique = '' + Math.round( Math.random() * 1000000000 );
            multipleSectionLength++;
            var sectionHTML = sakai.api.Util.TemplateRenderer( template, {
                sectionid: widgetData.sectionid,
                section: section,
                unique: unique,
                order: multipleSectionLength,
                data: {}
            });
            $displayprofilesection_sections_multiple.append( sakai.api.i18n.General.process( sectionHTML ) );
            $( 'button.profile-section-save-button', $rootel ).show();
            $( 'button#displayprofilesection_remove_link_' + unique, $rootel ).on( 'click', function() {
                removeSection( unique );
            });
        };

        var sectionHasElements = function( section ) {
            var hasElts = false;
            if ( section ) {
                $.each( section, function( i, elt ) {
                    if ( $.isPlainObject( elt ) ) {
                        hasElts = true;
                    }
                });
            }
            return hasElts;
        };

        var renderEmptySection = function( userProfile, section ) {
            var messageKey = 'THIS_PERSON_HASNT_ADDED_INFORMATION';
            var sectionKey = 'THIS_PERSON_HASNT_ADDED_' + widgetData.sectionid.toUpperCase();
            if ( sakai.api.i18n.getValueForKey( sectionKey, 'displayprofilesection') !== sectionKey ) {
                messageKey = sectionKey;
            }
            var emptyHTML = sakai.api.Util.TemplateRenderer( $displayprofilesection_view_no_results_template, {
                userid: userid,
                displayName: sakai.api.User.getDisplayName( userProfile ),
                errorString: sakai.api.i18n.getValueForKey( messageKey, 'displayprofilesection' ),
                showMessage: !sakai.api.User.isAnonymous(sakai.data.me)
            });
            $displayprofilesection_body.html( sakai.api.i18n.General.process( emptyHTML ) );
        };

        // Render a multi-assign section
        var renderMultiSection = function( template, section, data ) {
            multiple = true;
            var multiTemplate = editing ? $displayprofilesection_edit_multiple_template : $displayprofilesection_view_multiple_template;

            var multHTML = sakai.api.Util.TemplateRenderer( multiTemplate, {
                sectionid: widgetData.sectionid,
                section: section
            });
            $displayprofilesection_body.html( sakai.api.i18n.General.process( multHTML ) );

            // Grab the new container to render into
            $displayprofilesection_sections_multiple = $( '#displayprofilesection_sections_' + widgetData.sectionid );
            if ( editing ) {
                $displayprofilesection_add_button = $( '#displayprofilesection_add_' + widgetData.sectionid );
                $displayprofilesection_add_button.on('click', function() {
                    addEmptySection( section, template );
                });
            }

            // If there is some data, render each section
            if (data[widgetData.sectionid] && data[widgetData.sectionid].elements) {
                var subSections = [];
                // Convert the sectionData into an array so we can order it
                $.each( data[ widgetData.sectionid ].elements, function( uid, sectionData ) {
                    if ( $.isPlainObject( sectionData ) ) {
                        var obj = {};
                        obj[ uid ] = sectionData;
                        subSections.push( obj );
                    }
                });
                // Sort the sections by order
                subSections = subSections.sort( function( a, b ) {
                    return _.values( a )[ 0 ].order - _.values( b )[ 0 ].order;
                });
                $.each( subSections, function( i, sectionData ) {
                    if ( $.isPlainObject( sectionData ) ) {
                        // Just keep incrementing, since we're not supporting re-ordering yet
                        multipleSectionLength = _.values( sectionData )[ 0 ].order > multipleSectionLength ? _.values( sectionData )[ 0 ].order : multipleSectionLength;
                        var uid = _.keys( sectionData )[ 0 ];
                        var sectionHTML = sakai.api.Util.TemplateRenderer( template, {
                            section: section,
                            sakai: sakai,
                            unique: uid,
                            data: _.values( sectionData )[ 0 ],
                            order: _.values( sectionData )[ 0 ].order
                        });
                        $displayprofilesection_sections_multiple.append( sakai.api.i18n.General.process( sectionHTML ) );
                        if ( editing ) {
                            $( 'button#displayprofilesection_remove_link_' + uid, $rootel ).on( 'click', function() {
                                removeSection( uid );
                            });
                        }
                    }
                });
                if ( editing && subSections.length ) {
                    $( 'button.profile-section-save-button', $rootel ).show();
                } else if ( !editing && !subSections.length ) {
                    renderEmptySection( data );
                } else if ( !editing ) {
                    $( '.displayprofilesection_multiple_sections hr:last' ).hide();
                }
            } else if ( !editing ) {
                renderEmptySection( data );
            }
        };

        var renderSection = function( success, data ) {
            if ( success ) {
                var section = sakai.config.Profile.configuration.defaultConfig[ widgetData.sectionid ];

                if ( section ) {
                    var template = $displayprofilesection_view_template;
                    if ( editing ) {
                        template = $displayprofilesection_edit_template;
                    }

                    // Render header
                    var pageTitle = section.label;
                    if (!editing && section.altLabel) {
                        pageTitle = sakai.api.i18n.General.process(section.altLabel)
                            .replace('${user}', sakai.api.User.getFirstName(sakai_global.profile.main.data));
                    }
                    var headerHTML = sakai.api.Util.TemplateRenderer( $displayprofilesection_header_template, {
                        pageTitle: pageTitle
                    });
                    $displayprofilesection_header.html( sakai.api.i18n.General.process( headerHTML ) );

                    // If it is a multiple section, we have to render it with some love
                    if ( section.multiple ) {
                        renderMultiSection( template, section, data );
                    } else {
                        // data[widgetData.sectionid] won't exist when the user hasn't logged in before
                        if (editing || (data[widgetData.sectionid] && sectionHasElements(data[widgetData.sectionid].elements))) {
                            sectionData = data[ widgetData.sectionid ] && data[ widgetData.sectionid ].elements ? data[ widgetData.sectionid ].elements : false;
                            $.each(section.elements, function(index, element) {
                                if (element.altLabel) {
                                    element.altLabel = sakai.api.i18n.General.process(section.altLabel)
                                        .replace('${user}', sakai.api.User.getFirstName(sakai_global.profile.main.data));
                                }
                            });
                            var bodyHTML = sakai.api.Util.TemplateRenderer( template, {
                                sectionid: widgetData.sectionid,
                                section: section,
                                data: sectionData,
                                unique: false,
                                sakai: sakai
                            });
                            $displayprofilesection_body.html( sakai.api.i18n.General.process( bodyHTML ) );
                            var $tagfield = $displayprofilesection_body.find( 'textarea[data-tag-field]' );
                            if ( $tagfield.length ) {
                                allowUpdate = false;
                                var autoSuggestOptions = {
                                    scrollHeight: 120,
                                    selectionAdded: function() {
                                        enableUpdate();
                                    },
                                    selectionRemoved: function(elem) {
                                        elem.remove();
                                        enableUpdate();
                                    }
                                };
                                var initialTagsValue = sectionData['sakai:tags'] && sectionData['sakai:tags'].value ? sectionData['sakai:tags'].value : false;
                                sakai.api.Util.AutoSuggest.setupTagAndCategoryAutosuggest(
                                    $tagfield,
                                    autoSuggestOptions,
                                    $('.list_categories', $rootel),
                                    initialTagsValue,
                                    function() {
                                        allowUpdate = true;
                                    }
                                );
                            }
                        } else {
                            renderEmptySection( data, section );
                        }
                    }

                    if ( editing ) {
                        $form = $( '#displayprofilesection_form_' + widgetData.sectionid, $rootel );
                        var validateOpts = {
                            submitHandler: saveValues,
                            messages: {}
                        };
                        // Set the custom error messages per field
                        $.each( section.elements, function( i, elt ) {
                            if ( elt.errorMessage ) {
                                validateOpts.messages[ i ] = {
                                    required: sakai.api.i18n.General.process( elt.errorMessage )
                                };
                            }
                        });
                        sakai.api.Util.Forms.validate( $form, validateOpts );
                    }
                }
            }
        };

        $rootel.on('input change cut paste', function() {
            enableUpdate();
        });

        var getData = function(callback) {
            if (editing && sakai.data.me.profile && $.isFunction(callback) && sakai.data.me.profile._fullProfileLoaded) {
                callback(true, sakai.data.me.profile);
            } else {
                sakai.api.User.getUser(userid, function(success, data) {
                    if (sakai.data.me.user.userid === data.userid) {
                        sakai.data.me.profile = data;
                        sakai.data.me.profile._fullProfileLoaded = true;
                    }
                    if ($.isFunction(callback)) {
                        callback(success, data);
                    }
                });
            }
        };

        var init = function() {
            userid = sakai_global.profile.main.data.userid;
            editing = userid && userid === sakai.data.me.user.userid;
            getData( renderSection );
        };

        init();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('displayprofilesection');
});
