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
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/jquery/plugins/jquery.fieldselection.js (fieldselection)
 */
/*global Config, $, jQuery, get_cookie, delete_cookie, set_cookie, window, alert */

require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {


    /**
     * @name sakai_global.topnavigation
     *
     * @class topnavigation
     *
     * @description
     * Initialize the topnavigation widget
     *
     * @version 0.0.2
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.topnavigation = function(tuid, showSettings) {


        ///////////////////
        // CONFIGURATION //
        ///////////////////

        // Elements
        var $rootel = $('#' + tuid);
        var subnavtl = '.hassubnav_tl';
        var navLinkDropdown = '.s3d-dropdown-container';
        var hasSubnav = '.hassubnav';
        var topnavExplore = '.topnavigation_explore';
        var topnavExploreLeft = '#topnavigation_explore_left';
        var topnavExploreRight = '#topnavigation_explore_right';
        var topnavUserOptions = '.topnavigation_user_options';
        var topnavUserDropdown = '.topnavigation_user_dropdown';
        var topnavigationlogin = '#topnavigation_user_options_login_wrapper';
        var topnavigationExternalLogin= '.topnavigation_external_login';
        var topnavUserLoginButton = '#topnavigation_user_options_login';

        // Form
        var topnavUserOptionsLoginForm = '#topnavigation_user_options_login_form';
        var topnavUseroptionsLoginFieldsUsername = '#topnavigation_user_options_login_fields_username';
        var topnavUseroptionsLoginFieldsPassword = '#topnavigation_user_options_login_fields_password';
        var topnavuserOptionsLoginButtonLogin = '#topnavigation_user_options_login_button_login';
        var topnavUserOptionsLoginButtonSigningIn = '#topnavigation_user_options_login_button_signing_in';
        var topnavUserOptionsLoginButtonCancel = '#topnavigation_user_options_login_button_cancel';

        // Containers
        var topnavSearchResultsContainer = '#topnavigation_search_results_container';
        var topnavSearchResultsBottomContainer = '#topnavigation_search_results_bottom_container';
        var topnavUserInboxMessages = '#topnavigation_user_inbox_messages';
        var topnavUserOptionsName = '#topnavigation_user_options_name';
        var topnavUserContainer = '.topnavigation_user_container';
        var topnavUserOptionsLoginFields = '#topnavigation_user_options_login_fields';
        var topnavUserOptionsLoginError = '#topnavigation_user_options_login_error';

        // Classes
        var topnavigationForceSubmenuDisplay = 'topnavigation_force_submenu_display';
        var topnavigationForceSubmenuDisplayTitle = 'topnavigation_force_submenu_display_title';

        // Templates
        var navTemplate = 'navigation_template';
        var searchTemplate = 'search_template';
        var searchBottomTemplate = 'search_bottom_template';
        var topnavUserTemplate = 'topnavigation_user_template';

        var renderObj = {
            'people':'',
            'groups':'',
            'files':'',
            'peopletotal':0,
            'groupstotal':0,
            'filestotal':0
        };

        var lastSearchVal = '',
            searchTimeout = false;

        var $openMenu = false;
        var $openPopover = false;


        ////////////////////////
        ///// USER ACTIONS /////
        ////////////////////////

        /**
         * Fill in the user name
         */
        var setUserName = function() {
            $(topnavUserOptionsName).html(sakai.api.Util.applyThreeDots(sakai.api.User.getDisplayName(sakai.data.me.profile), 100, null, null, true));
        };

        /**
         * Show the logout element
         */
        var showLogout = function() {
            if ($(topnavUserDropdown).is(':visible')) {
                $(topnavUserDropdown).hide();
            } else {
                $(topnavUserDropdown).show();
                $(topnavUserDropdown).css('display', 'inline');
            }
        };

        /**
         * Show the login element
         */
        var showLogin = function() {
            if ($(topnavUserOptionsLoginFields).is(':visible')) {
                $(topnavUserOptionsLoginFields).hide();
            } else {
                $(topnavUserOptionsLoginFields).show();
                $(topnavUseroptionsLoginFieldsUsername).focus();
            }
        };

        /**
         * Decide to show login or logout option
         */
        var decideShowLoginLogout = function() {
            if (sakai.data.me.user.anon) {
                showLogin();
            } else {
                showLogout();
            }
        };


        var renderUser = function() {
            var externalAuth = false;
            if (!sakai.config.Authentication.internal && !sakai.config.Authentication.allowInternalAccountCreation) {
                externalAuth = true;
            }
            var auth = {
                'externalAuth': externalAuth,
                'internalAndExternal': sakai.config.Authentication.internalAndExternal,
                'Authentication': sakai.config.Authentication
            };
            $(topnavUserContainer).html(sakai.api.Util.TemplateRenderer(topnavUserTemplate, {
                'anon' : sakai.data.me.user.anon,
                'auth': auth,
                'displayName': sakai.api.User.getDisplayName(sakai.data.me.profile),
                'sakai': sakai
            }));
            if (externalAuth) {
                setExternalLoginRedirectURL();
            }
        };

        var setExternalLoginRedirectURL = function() {
            var redirectURL = getRedirectURL();
            $('.topnavigation_external_login_link').each(function(index, item) {
                $(item).attr('href', $.param.querystring($(item).attr('href'), {'url': redirectURL}));
            });
        };

        /**
         * Checks if the URL redirect is valid
         * @param {String} redirectURL The URL to check
         */
        var checkValidRedirect = function(redirectURL) {
            var absoluteUrl = /^(?:ftp|https?):\/\//i;
            return !absoluteUrl.test(redirectURL);
        };

        var getRedirectURL = function() {
            var redirectURL = window.location.pathname + window.location.search + window.location.hash;
            // Check whether we require a redirect
            if ($.deparam.querystring().url) {
                // Check if the redirect URL is valid
                if (checkValidRedirect($.deparam.querystring().url)) {
                    redirectURL = $.deparam.querystring().url;
                } else {
                    redirectURL = window.location.pathname;
                }
            // Go to You when you're on explore page
            } else if (window.location.pathname === '/dev/explore.html' || window.location.pathname === '/register' ||
                window.location.pathname === '/index' || window.location.pathname === '/' || window.location.pathname === '/dev') {
                redirectURL = '/me';
            // 500 not logged in
            } else if (sakai_global.nopermissions && sakai.data.me.user.anon && sakai_global.nopermissions.error500) {
                redirectURL = '/me';
            }
            return redirectURL;
        };

        /**
         * Check if a redirect should be performed
         */
        var checkForRedirect = function() {
            // Check for url param, path and if user is logged in
            if ($.deparam.querystring().url && checkValidRedirect($.deparam.querystring().url) &&
                !sakai.api.User.isAnonymous(sakai.data.me) &&
                (window.location.pathname === '/' || window.location.pathname === '/dev/explore.html' ||
                  window.location.pathname === '/index' || window.location.pathname === '/dev')) {
                    window.location = $.deparam.querystring().url;
            }
        };

        /**
         * Open the login overlay even though the user is not hovering over it and if there is a URL redirect
         */
        var forceShowLoginUrl = function() {
            if ($.deparam.querystring().url) {
                forceShowLogin(function() {
                    addUserLoginValidation();
                });
            }
        };

        /**
         * Open the login overlay even though the user is not hovering over it
         * @param {Function} callback Optional callback function
         */
        var forceShowLogin = function(callback) {
            if (sakai.api.User.isAnonymous(sakai.data.me)) {
                $('#topnavigation_user_options_login_fields').addClass('topnavigation_force_submenu_display');
                $('#topnavigation_user_options_login_wrapper').addClass('topnavigation_force_submenu_display_title');
                $('#topnavigation_user_options_login_fields_username').focus();
            }
            if ($.isFunction(callback)) {
                callback();
            }
        };

        ////////////////////////
        /////// MESSAGES ///////
        ////////////////////////

        /**
         * Show the number of unread messages
         */
        var setCountUnreadMessages = function() {
            $(topnavUserInboxMessages).text(sakai.api.User.data.me.messages.unread);
        };

        var renderResults = function() {
            sakai.api.Util.getTemplates(function(success, templates) {
                if (success) {
                    renderObj.sakai = sakai;
                    renderObj.templates = templates;
                    $(topnavSearchResultsContainer).html(sakai.api.Util.TemplateRenderer(searchTemplate, renderObj));
                    $(topnavSearchResultsBottomContainer).html(sakai.api.Util.TemplateRenderer(searchBottomTemplate, renderObj));
                    $('#topnavigation_search_results').show();
                } else {
                    debug.error('Could not get the group templates');
                }
            });
        };

        var renderPeople = function(data) {
            var people = [];
            if (data) {
                for (var i in data.results) {
                    if (data.results.hasOwnProperty(i)) {
                        var displayName = sakai.api.User.getDisplayName(data.results[i]);
                        var dottedName = sakai.api.Util.applyThreeDots(displayName, 100, null, null, true);
                        var tempPerson = {
                            'dottedname': dottedName,
                            'name': sakai.api.User.getDisplayName(data.results[i]),
                            'url': data.results[i].homePath
                        };
                        people.push(tempPerson);
                    }
                }
                renderObj.people = people;
                renderObj.peopletotal = data.total;
                renderResults();
            }
        };

        var renderGroups = function(data, category) {
            var groups = [];
            if (data) {
                for (var i in data.results) {
                    if (data.results.hasOwnProperty(i)) {
                        var tempGroup = {
                            'dottedname': sakai.api.Util.applyThreeDots(data.results[i]['sakai:group-title'], 100),
                            'name': data.results[i]['sakai:group-title'],
                            'url': data.results[i].homePath
                        };
                        if (data.results[i]['sakai:group-visible'] === 'members-only' || data.results[i]['sakai:group-visible'] === 'logged-in-only') {
                            tempGroup['css_class'] = 'topnavigation_group_private_icon';
                        } else {
                            tempGroup['css_class'] = 'topnavigation_group_public_icon';
                        }
                        groups.push(tempGroup);
                    }
                }
                renderObj.groups = renderObj.groups ||
                {};
                renderObj.groups[category] = groups;
                renderObj.groups[category + 'total'] = data.total;
                renderResults();
            }
        };

        var renderContent = function(data) {
            var files = [];
            if (data) {
                for (var i in data.results) {
                    if (data.results.hasOwnProperty(i)) {
                        var mimeType = sakai.api.Content.getMimeTypeData(sakai.api.Content.getMimeType(data.results[i])).cssClass;
                        var tempFile = {
                            'dottedname': sakai.api.Util.applyThreeDots(data.results[i]['sakai:pooled-content-file-name'], 100),
                            'name': data.results[i]['sakai:pooled-content-file-name'],
                            'url': '/content#p=' + sakai.api.Util.safeURL(data.results[i]['_path']) + '/' + sakai.api.Util.safeURL(data.results[i]['sakai:pooled-content-file-name']),
                            'css_class': mimeType
                        };
                        files.push(tempFile);
                    }
                }
                renderObj.files = files;
                renderObj.filestotal = data.total;
                renderResults();
            }
        };


        ////////////////////////
        //////// SEARCH ////////
        ////////////////////////

        /**
         * Execute the live search and render the results
         * @param {Object} templates the available world templates
         */
        var doSearch = function(templates) {
            var searchText = $.trim($('#topnavigation_search_input').val());
            var filesUrl = sakai.config.URL.SEARCH_ALL_FILES.replace('.json', '.infinity.json');
            var usersUrl = sakai.config.URL.SEARCH_USERS;
            var groupsUrl = sakai.config.URL.SEARCH_GROUPS;
            if (searchText === '*' || searchText === '**') {
                filesUrl = sakai.config.URL.SEARCH_ALL_FILES_ALL;
                usersUrl = sakai.config.URL.SEARCH_USERS_ALL;
                groupsUrl = sakai.config.URL.SEARCH_GROUPS_ALL;
            }

            renderObj.query = searchText;
            searchText = sakai.api.Server.createSearchString(searchText);
            var requests = [];
            requests.push({
                'url': filesUrl,
                'method': 'GET',
                'parameters': {
                    'page': 0,
                    'items': 3,
                    'q': searchText
                }
            });
            requests.push({
                'url': usersUrl,
                'method': 'GET',
                'parameters': {
                    'page': 0,
                    'items': 3,
                    'sortOn': 'lastName',
                    'sortOrder': 'asc',
                    'q': searchText
                }
            });
            for (var c = 0; c < templates.length; c++) {
                var category = templates[c];
                requests.push({
                    'url': groupsUrl,
                    'method': 'GET',
                    'parameters': {
                        'page': 0,
                        'items': 3,
                        'q': searchText,
                        'category': category.id
                    }
                });
            }


            sakai.api.Server.batch(requests, function(success, data) {
                renderContent($.parseJSON(data.results[0].body));
                renderPeople($.parseJSON(data.results[1].body));
                for (var c = 0; c < templates.length; c++) {
                    renderGroups($.parseJSON(data.results[2 + c].body), templates[c].id);
                }
            });
        };


        ////////////////////////
        ////// NAVIGATION //////
        ////////////////////////

        /**
         * Generate a subnavigation item
         * @param {integer} index Index of the subnavigation item in the array
         * @param {Array} array Array of subnavigation items
         */
        var getNavItem = function(index, array) {
            var temp = {};
            var item = array[index];
            temp.id = item.id;
            if (temp.id && temp.id === 'subnavigation_hr') {
                temp = 'hr';
            } else {
                if (sakai.data.me.user.anon && item.anonUrl) {
                    temp.url = item.anonUrl;
                } else {
                    temp.url = item.url;
                    if (item.append) {
                        temp.append = item.append;
                    }
                }
                temp.label = sakai.api.i18n.getValueForKey(item.label);
                if (item.cssClass) {
                    temp.cssClass = item.cssClass;
                }
            }
            return temp;
        };

        /**
         * Create a list item for the topnavigation menu including the subnavigation
         * @param {integer} i index of the current item in the loop
         * @param {Object} templates the available world templates
         */
        var createMenuList = function(i, templates) {
            var temp = getNavItem(i, sakai.config.Navigation);
            // Add in the template categories
            if (sakai.config.Navigation[i].id === 'navigation_create_and_add_link') {
                for (var c = 0; c < templates.length; c++) {
                    var category = templates[c];
                    sakai.config.Navigation[i].subnav.push({
                        'id': 'subnavigation_' + category.id + '_link',
                        'label': category.menuLabel || category.title,
                        'url': '/create#l=' + category.id
                    });
                }
            } else if (sakai.config.Navigation[i].id === 'navigation_explore_link' || sakai.config.Navigation[i].id === 'navigation_anon_explore_link') {
                for (var x = 0; x < templates.length; x++) {
                    var categoryx = templates[x];
                    sakai.config.Navigation[i].subnav.push({
                        'id': 'subnavigation_explore_' + categoryx.id + '_link',
                        'label': categoryx.titlePlural,
                        'url': '/search#l=' + categoryx.id
                    });
                }
            }

            if (sakai.config.Navigation[i].subnav) {
                temp.subnav = [];
                for (var ii in sakai.config.Navigation[i].subnav) {
                    if (sakai.config.Navigation[i].subnav.hasOwnProperty(ii)) {
                        temp.subnav.push(getNavItem(ii, sakai.config.Navigation[i].subnav));
                    }
                }
            }
            return temp;
        };

        /**
         * Initialise the rendering of the topnavigation menu
         * @param {Object} templates the available world templates
         */
        var renderMenu = function(templates) {
            var obj = {};
            var leftMenulinks = [];
            var rightMenuLinks = [];

            //Where to absolutely-position skip links relative to body:
            var skipLinkPosition = (sakai.config.enableBranding) ?
                $('.branding_widget').height() + $('.s3d-navigation-container:first').height() + 'px' :
                $('.s3d-navigation-container:first').height() + 'px';

            //Prepend skip links to body to ensure that they're the first tabable elements on the page
            var skipLinks = $('.s3d-jump-link');
            skipLinks.remove().css('top', skipLinkPosition).prependTo('body');

            skipLinks.each(function() {
                if ($($(this).attr('href') + ':visible').length) {
                    $(this).show();
                }
            });

            skipLinks.on('click', function() {
                $($(this).attr('href')).focus();
                return false;
            });

            for (var i in sakai.config.Navigation) {
                if (sakai.config.Navigation.hasOwnProperty(i)) {
                    var temp = '';
                    /* Check that the user is anon, the nav link is for anon
                     * users, and if the link is the account create link,
                     * that internal account creation is allowed
                     */
                    var anonAndAllowed = sakai.data.me.user.anon &&
                        sakai.config.Navigation[i].anonymous &&
                        (
                            sakai.config.Navigation[i].id !== 'navigation_anon_signup_link' ||
                            (
                                sakai.config.Navigation[i].id === 'navigation_anon_signup_link' &&
                                sakai.config.Authentication.allowInternalAccountCreation
                            )
                        );
                    var isNotAnon = !sakai.data.me.user.anon &&
                        !sakai.config.Navigation[i].anonymous;
                    var shouldPush = anonAndAllowed || isNotAnon;
                    if (shouldPush) {
                        temp = createMenuList(i, templates);
                        if (sakai.config.Navigation[i].rightLink) {
                            rightMenuLinks.push(temp);
                        } else {
                            leftMenulinks.push(temp);
                        }
                    }
                }
            }
            obj.links = leftMenulinks;
            obj.selectedpage = true;
            obj.sakai = sakai;
            // Get navigation and render menu template
            $(topnavExploreLeft).html(sakai.api.Util.TemplateRenderer(navTemplate, obj));

            obj.links = rightMenuLinks;
            $(topnavExploreRight).html(sakai.api.Util.TemplateRenderer(navTemplate, obj));
            setCountUnreadMessages();
            addBinding();
        };


        /////////////////////////
        ///// BIND ELEMENTS /////
        /////////////////////////

        var handleArrowKeyInSearch = function(up) {
            if ($(topnavSearchResultsContainer).find('li').length) {
                var currentIndex = 0,
                    next = 0;
                if ($(topnavSearchResultsContainer).find('li.selected').length) {
                    currentIndex = $(topnavSearchResultsContainer).find('li').index($(topnavSearchResultsContainer).find('li.selected')[0]);
                    next = up ? (currentIndex - 1 >= 0 ? currentIndex-1 : -1) : (currentIndex + 1 >= $(topnavSearchResultsContainer).find('li').length ? $(topnavSearchResultsContainer).find('li').length-1 : currentIndex +1);
                    $(topnavSearchResultsContainer).find('li.selected').removeClass('selected');
                }
                if (next !== 0 && next === currentIndex) {
                    next = 0;
                } else if (next === -1) {
                    next = $(topnavSearchResultsContainer).find('li').length - 1;
                }
                if (next !== -1) {
                    $(topnavSearchResultsContainer).find('li:eq(' + next + ')').addClass('selected');
                }
                return false;
            }
        };

        var handleEnterKeyInSearch = function() {
            if ($(topnavSearchResultsContainer).find('li.selected').length) {
                document.location = $(topnavSearchResultsContainer).find('li.selected a').attr('href');
            } else {
                document.location = '/search#q=' + $.trim($('#topnavigation_search_input').val());
                $('#topnavigation_search_results').hide();
            }
        };

        var hideMessageInlay = function() {
            $('#topnavigation_user_messages_container .s3d-dropdown-menu').hide();
            $('#topnavigation_messages_container').removeClass('selected');
        };

        /**
         * Perform the actual login
         */
        var doLogin = function() {
            $(topnavUserOptionsLoginButtonSigningIn).show();
            $(topnavUserOptionsLoginButtonCancel).hide();
            $(topnavuserOptionsLoginButtonLogin).hide();
            sakai.api.User.login({
                'username': $(topnavUseroptionsLoginFieldsUsername).val(),
                'password': $(topnavUseroptionsLoginFieldsPassword).val()
            }, function(success) {
                if (success) {
                    var redirectURL = getRedirectURL();
                    if (redirectURL === window.location.pathname + window.location.search + window.location.hash) {
                        window.location.reload(true);
                    } else {
                        window.location = redirectURL;
                    }
                } else {
                    $(topnavUserOptionsLoginButtonSigningIn).hide();
                    $(topnavUserOptionsLoginButtonCancel).show();
                    $(topnavuserOptionsLoginButtonLogin).show();
                    $(topnavUseroptionsLoginFieldsPassword).val('');
                    $(topnavUseroptionsLoginFieldsPassword).focus();
                    $(topnavUseroptionsLoginFieldsUsername).addClass('failedloginusername');
                    $(topnavUseroptionsLoginFieldsPassword).addClass('failedloginpassword');
                    $(topnavUserOptionsLoginForm).valid();
                    $(topnavUseroptionsLoginFieldsUsername).removeClass('failedloginusername');
                    $(topnavUseroptionsLoginFieldsPassword).removeClass('failedloginpassword');
                }
            });
        };

        /**
         * Add the binding for the user login validation
         */
        var addUserLoginValidation = function() {

            var $topnavUserOptionsLoginForm = $(topnavUserOptionsLoginForm);

            // We don't need to do this if there isn't a form
            if ($topnavUserOptionsLoginForm.length === 0) {
                return;
            }

            var validateOpts = {
                submitHandler: function(form) {
                    doLogin();
                },
                'methods': {
                    'failedloginusername': {
                        'method': function(value, element) {
                            return false;
                        },
                        'text': sakai.api.i18n.getValueForKey('INVALID_USERNAME_OR_PASSWORD')
                    },
                    'failedloginpassword': {
                        'method': function(value, element) {
                            return false;
                        },
                        'text': ''
                    }
                }
            };
            // Initialize the validate plug-in
            sakai.api.Util.Forms.validate($topnavUserOptionsLoginForm, validateOpts, true);
        };

        /**
         * Add binding to the elements
         */
        var addBinding = function() {

            sakai.api.Util.hideOnClickOut('#topnavigation_user_messages_container .s3d-dropdown-menu', '', function() {
                hideMessageInlay();
            });

            // Navigation hover binding
            var closeMenu = function(e) {
                if ($openMenu.length) {
                    $openMenu.children('a').removeClass(topnavigationForceSubmenuDisplayTitle);
                    $openMenu.children(subnavtl).hide();
                    $openMenu.children(navLinkDropdown).children('ul').attr('aria-hidden', 'true');
                    $openMenu.children(navLinkDropdown).hide();
                    $openMenu = false;
                }
            };
            // Navigation popover binding
            var closePopover = function(e) {
                if ($openPopover.length) {
                    $openPopover.prev().removeClass('selected');
                    $openPopover.attr('aria-hidden', 'true');
                    $openPopover.hide();
                    $openPopover = false;
                }
            };
            var openMenu = function() {
                $('#topnavigation_search_results').hide();
                if ($('#navigation_anon_signup_link:focus').length) {
                    $('#navigation_anon_signup_link:focus').blur();
                }

                // close another sub menu if ones open
                closeMenu();
                closePopover();

                $openMenu = $(this);
                $openMenu.removeClass('topnavigation_close_override');
                $openMenu.children(subnavtl).show();
                $openMenu.children(navLinkDropdown).children('ul').attr('aria-hidden', 'false');
                var $subnav = $openMenu.children(navLinkDropdown);

                var pos = $openMenu.position();
                $subnav.css('left', pos.left - 2);
                $subnav.show();

                if ($openMenu.children(topnavigationExternalLogin).length) {
                    // adjust margin of external login menu to position correctly according to padding and width of menu
                    var menuPadding = parseInt($openMenu.css('paddingRight').replace('px', ''), 10) +
                         $openMenu.width() -
                         parseInt($subnav.css('paddingRight').replace('px', ''), 10) -
                         parseInt($subnav.css('paddingLeft').replace('px', ''), 10);
                    var margin = ($subnav.width() - menuPadding) * -1;
                    $subnav.css('margin-left', margin + 'px');
                }
            };


            var toggleInternalLogin = function() {
                $(topnavUserOptionsLoginForm).toggle();
            };

            $rootel.on('click', '#topnavigation_toggle_internal_login', toggleInternalLogin);

            $(document).on('mouseenter', '.hassubnav', openMenu);
            $(document).on('mouseleave', '.hassubnav', function() {
                closePopover();
                closeMenu();
            });

            // remove focus of menu item if mouse is used
            $rootel.on('hover', $(hasSubnav + ' div').find('a'), function() {
                if ($openMenu.length) {
                    $openMenu.find('a').blur();
                }
            });

            // bind down/left/right/letter keys for explore menu
            $('#topnavigation_container .topnavigation_explore .s3d-dropdown-menu,.topnavigation_counts_container button').keydown(function(e) {
                var $focusElement = $(this);
                var $lastElt = $('.topnavigation_right').children().last();
                if (e.which === $.ui.keyCode.DOWN && $focusElement.hasClass('hassubnav')) {
                    $focusElement.find('div a:first').focus();
                    return false; // prevent browser page from scrolling down
                } else if (e.which === $.ui.keyCode.LEFT || (e.which === $.ui.keyCode.TAB && e.shiftKey) && !$focusElement.parent().is($lastElt)) {
                    closeMenu();
                    closePopover();
                    if ($focusElement.parents('.topnavigation_counts_container').length) {
                        $focusElement = $focusElement.parents('.topnavigation_counts_container');
                    }
                    if ($focusElement.prev('.topnavigation_counts_container').length) {
                        $focusElement.prev('.topnavigation_counts_container').children('button').focus();
                        return false;
                    } else if ($focusElement.prev('li:first').length) {
                        $focusElement.prev('li:first').children('a').focus();
                        return false;
                    } else if (!(e.which === $.ui.keyCode.TAB && e.shiftKey)) {
                        $focusElement.nextAll('li:last').children('a').focus();
                        return false;
                    }
                } else if ((e.which === $.ui.keyCode.RIGHT || e.which === $.ui.keyCode.TAB) && !$focusElement.parent().is($lastElt)) {
                    closeMenu();
                    closePopover();
                    if ($focusElement.parents('.topnavigation_counts_container').length) {
                        $focusElement = $focusElement.parents('.topnavigation_counts_container');
                    }
                    if ($focusElement.next('.topnavigation_counts_container').length) {
                        $focusElement.next('.topnavigation_counts_container').children('button').focus();
                    } else if ($focusElement.next('li:first').length) {
                        $focusElement.next('li:first').children('a').focus();
                    } else if ($focusElement.prevAll('li:last').length && e.which === $.ui.keyCode.RIGHT) {
                        $focusElement.prevAll('li:last').children('a').focus();
                    } else {
                        $('#topnavigation_search_input').focus();
                    }
                    return false;
                } else if ($focusElement.hasClass('hassubnav') && $focusElement.children('a').is(':focus')) {
                    // if a letter was pressed, search for the first menu item that starts with the letter
                    var key = String.fromCharCode(e.which).toLowerCase();
                    $focusElement.find('ul:first').children().each(function(index, item) {
                        var firstChar = $.trim($(item).text()).toLowerCase().substr(0, 1);
                        if (key === firstChar) {
                            $(item).find('a').focus();
                            return false;
                        }
                    });
                }
            });

            // bind keys for right menu
            $('#topnavigation_container .topnavigation_right .s3d-dropdown-menu').keydown(function(e) {
                var $focusElement = $(this);
                if (e.which === $.ui.keyCode.DOWN && $focusElement.hasClass('hassubnav')) {
                    $focusElement.find('div a:first').focus();
                    return false; // prevent browser page from scrolling down
                } else if (e.which === $.ui.keyCode.TAB && e.shiftKey) {
                    closeMenu();
                } else if ($focusElement.hasClass('hassubnav') && $focusElement.children('a').is(':focus')) {
                    // if a letter was pressed, search for the first menu item that starts with the letterletter
                    var key = String.fromCharCode(e.which).toLowerCase();
                    $focusElement.find('ul:first').children().each(function(index, item) {
                        var firstChar = $.trim($(item).text()).toLowerCase().substr(0, 1);
                        if (key === firstChar) {
                            $(item).find('a').focus();
                            return false;
                        }
                    });
                }
            });

            $('#topnavigation_user_inbox_container').keydown(function(e) {
                if (e.which === $.ui.keyCode.LEFT) {
                    if ($('#topnavigation_search_input').length) {
                        // focus on search input
                        $('#topnavigation_search_input').focus();
                    }
                } else if (e.which === $.ui.keyCode.RIGHT) {
                    if ($('#topnavigation_user_options_name').length) {
                        // focus on user options menu
                        $('#topnavigation_user_options_name').focus();
                    }
                }
            });

            // bind up/down/escape keys in sub menu
            $(hasSubnav + ' div a').keydown(function(e) {
                if (e.which === $.ui.keyCode.DOWN) {
                    if ($(this).parent().nextAll('li:first').length) {
                        $(this).parent().nextAll('li:first').children('a').focus();
                    } else {
                        $(this).parent().prevAll('li:last').children('a').focus();
                    }
                    return false; // prevent browser page from scrolling down
                } else if (e.which === $.ui.keyCode.UP) {
                    if ($(this).parent().prevAll('li:first').length) {
                        $(this).parent().prevAll('li:first').children('a').focus();
                    } else {
                        $(this).parent().nextAll('li:last').children('a').focus();
                    }
                    return false;
                } else if (e.which === $.ui.keyCode.ESCAPE) {
                    $(this).parent().parents('li:first').find('a:first').focus();
                } else {
                    // if a letter was pressed, search for the next menu item that starts with the letter
                    var keyPressed = String.fromCharCode(e.which).toLowerCase();
                    var $activeItem = $(this).parents('li:first');
                    var $menuItems = $(this).parents('ul:first').children();
                    var activeIndex = $menuItems.index($activeItem);
                    var itemFound = false;
                    $menuItems.each(function(index, item) {
                        var firstChar = $.trim($(item).text()).toLowerCase().substr(0, 1);
                        if (keyPressed === firstChar && index > activeIndex) {
                            $(item).find('a').focus();
                            itemFound = true;
                            return false;
                        }
                    });
                    if (!itemFound) {
                        $menuItems.each(function(index, item) {
                            var firstChar = $.trim($(item).text()).toLowerCase().substr(0, 1);
                            if (keyPressed === firstChar) {
                                $(item).find('a').focus();
                                return false;
                            }
                        });
                    }
                }
            });

            $rootel.on('focus', hasSubnav + ' a', function() {
                if ($(this).parent().hasClass('hassubnav')) {
                    $(this).trigger('mouseover');
                    $(this).parents('.s3d-dropdown-menu').children('a').addClass(topnavigationForceSubmenuDisplayTitle);
                }
            });

            $rootel.on('hover', '#navigation_anon_signup_link', function(evt) {
                closeMenu();
                closePopover();
            });

            // hide the menu after an option has been clicked
            $rootel.on('click', hasSubnav + ' a', function() {
                // hide the menu if a menu item was clicked
                if ($(this).parents('.s3d-dropdown-container').length) {
                    var $parentMenu = $(this).parents(hasSubnav);
                    var $parent = $(this).parent(hasSubnav);
                    if ($parent.length) {
                        $parentMenu.addClass('topnavigation_close_override');
                    }
                    $parentMenu.children(subnavtl).hide();
                    $parentMenu.children(navLinkDropdown).hide();
                }
            });

            // Make sure that the results only disappear when you click outside
            // of the search box and outside of the results box
            sakai.api.Util.hideOnClickOut('#topnavigation_search_results', '#topnavigation_search_results_container,#topnavigation_search_results_bottom_container,#topnavigation_search_input');

            $('#topnavigation_search_input').keyup(function(evt) {
                var val = $.trim($(this).val());
                if (val !== '' && evt.keyCode !== 16 && val !== lastSearchVal) {
                    if (searchTimeout) {
                        clearTimeout(searchTimeout);
                    }
                    searchTimeout = setTimeout(function() {
                        sakai.api.Util.getTemplates(function(success, templates) {
                            if (success) {
                                doSearch(templates);
                                lastSearchVal = val;
                            } else {
                                debug.error('Could not get the group templates');
                            }
                        });
                    }, 200);
                } else if (val === '') {
                    lastSearchVal = val;
                    $('#topnavigation_search_results').hide();
                }
            });

            $('.topnavigation_search .s3d-search-button').on('click', handleEnterKeyInSearch);

            $('#topnavigation_search_input').keydown(function(evt) {
                var val = $.trim($(this).val());
                // 40 is down, 38 is up, 13 is enter
                if (evt.keyCode === 40 || evt.keyCode === 38) {
                    handleArrowKeyInSearch(evt.keyCode === 38);
                    evt.preventDefault();
                } else if (evt.keyCode === 13) {
                    handleEnterKeyInSearch();
                    evt.preventDefault();
                }
            });

            $('.topnavigation_user_dropdown a, .topnavigation_external_login a').keydown(function(e) {
                // if user is signed in and tabs out of user menu, or the external auth menu, close the sub menu
                if (!e.shiftKey && e.which === $.ui.keyCode.TAB) {
                    closeMenu();
                    closePopover();
                }
            });

            $rootel.on('click', '#topnavigation_user_options_login_external', function() {
                return false;
            });

            $('#topnavigation_user_options_login_button_login').keydown(function(e) {
                // if user is not signed in we need to check when they tab out of the login form and close the login menu
                if (!e.shiftKey && e.which === $.ui.keyCode.TAB) {
                    mouseOverSignIn = false;
                    $(topnavUserLoginButton).trigger('mouseout');
                    $('html').trigger('click');
                }
            });

            $('#topnavigation_user_options_name, #topnavigation_user_options_login_external').keydown(function(e) {
                // hide signin or user options menu when tabbing out of the last menu option
                if (!e.shiftKey && e.which === $.ui.keyCode.TAB) {
                    closeMenu();
                    closePopover();
                }
            });

            $(topnavUserOptions).on('click', decideShowLoginLogout);

            $(topnavUserLoginButton).on('hover focus', addUserLoginValidation);

            // Make sure that the sign in dropdown does not disappear after it has
            // been clicked
            var mouseOverSignIn = false;
            var mouseClickedSignIn = false;
            $(topnavUserOptionsLoginFields).on('mouseenter', function() {
                mouseOverSignIn = true;
            }).on('mouseleave', function() {
                mouseOverSignIn = false;
            });
            $(topnavUserOptionsLoginFields).click(function() {
                mouseClickedSignIn = true;
                $(topnavUserOptionsLoginFields).addClass(topnavigationForceSubmenuDisplay);
                $(topnavigationlogin).addClass(topnavigationForceSubmenuDisplayTitle);
            });
            $('html').click(function() {
                if (!mouseOverSignIn) {
                    mouseClickedSignIn = false;
                    $(topnavUserOptionsLoginFields).removeClass(topnavigationForceSubmenuDisplay);
                    $(topnavigationlogin).removeClass(topnavigationForceSubmenuDisplayTitle);
                }
                // hide the login menu if it is open
                if ($(topnavUserOptionsLoginFields).is(':visible')) {
                    closeMenu();
                }
            });

            $(topnavUserLoginButton).on('focus',function() {
                $(this).trigger('mouseover');
                mouseOverSignIn = true;
                $(topnavUserOptionsLoginFields).trigger('click');
                $(topnavigationlogin).addClass(topnavigationForceSubmenuDisplayTitle);
            });

            $('#topnavigation_search_input,#navigation_anon_signup_link,#topnavigation_user_inbox_container,.topnavigation_search .s3d-search-button').on('focus',function(evt) {
                mouseOverSignIn = false;
                $(topnavUserLoginButton).trigger('mouseout');
                $('html').trigger('click');

                if ($(this).attr('id') === 'topnavigation_search_input') {
                // Search binding (don't fire on following keyup codes: shift)
                    $(this).keyup();
                    if ($.trim($('#topnavigation_search_input').val())) {
                        $('#topnavigation_search_results').show();
                    }
                }
            });

            $(topnavigationlogin).hover(function() {
                if ($('#navigation_anon_signup_link:focus').length) {
                    $('#navigation_anon_signup_link:focus').blur();
                }
                closeMenu();
                closePopover();
                $(topnavUserOptionsLoginFields).show();
            },
            function() {
                $(topnavUserOptionsLoginFields).hide();
                if ($(this).children(topnavigationExternalLogin).length) {
                    $(this).children(topnavigationExternalLogin).find('ul').attr('aria-hidden', 'true');
                }
            });

            $rootel.on('click', ['#topnavigation_message_showall', '#topnavigation_message_readfull',
                '.no_messages .s3d-no-results-container a'], hideMessageInlay);
            $rootel.on('click', '.topnavigation_trigger_login', forceShowLogin);

            $(window).on('updated.messageCount.sakai', setCountUnreadMessages);
            $(window).on('displayName.profile.updated.sakai', setUserName);
        };

        //////////////////////////
        // SCROLL FUNCTIONALITY //
        //////////////////////////

        $rootel.on('click', '#topnavigation_scroll_to_top', function(ev) {
            $('html:not(:animated),body:not(:animated)').animate({
                scrollTop: $('html').offset().top
            }, 500 );
        });

        $(window).on('scroll', function(ev) {
            if ($(window).scrollTop() > 800) {
                $('#topnavigation_scroll_to_top').show('slow');
            } else {
                $('#topnavigation_scroll_to_top').hide('slow');
            }
        });


        ////////////////////////
        // COLLECTION COUNTER //
        ////////////////////////

        $(document).on('sakai.mylibrary.deletedCollections', function(ev, data) {
            $.each(data.items, function(i, item) {
                $('.topnavigation_menuitem_counts_container #topnavigation_user_collections_total').text(parseInt($('.topnavigation_menuitem_counts_container #topnavigation_user_collections_total').text(), 10) - 1);
            });
        });

        $(window).on('sakai.mylibrary.createdCollections', function(ev, data) {
            $.each(data.items, function(i, item) {
                $('.topnavigation_menuitem_counts_container #topnavigation_user_collections_total').text(parseInt($('.topnavigation_menuitem_counts_container #topnavigation_user_collections_total').text(), 10) + 1);
            });
        });


        /////////////////////
        // MESSAGES POP-UP //
        /////////////////////

        $rootel.on('click', '#topnavigation_messages_container', function() {
            if ($('#topnavigation_user_messages_container .s3d-dropdown-menu').is(':hidden')) {
                sakai.api.Communication.getAllMessages('inbox', false, false, 1, 0, '_created', 'desc', function(success, data) {
                    var dataPresent = false;
                    if (data.results && data.results[0]) {
                        dataPresent = true;
                    }
                    $('#topnavigation_messages_container').addClass('selected');
                    var $messageContainer = $('#topnavigation_user_messages_container .s3d-dropdown-menu');
                    $openPopover = $messageContainer;
                    $messageContainer.html(sakai.api.Util.TemplateRenderer('topnavigation_messages_dropdown_template', {data: data, sakai: sakai, dataPresent: dataPresent}));
                    $messageContainer.show();
                });
            }
        });


        ////////////////////////
        ////// INITIALISE //////
        ////////////////////////

        /**
         * Initialise the topnavigation widget
         */
        var doInit = function() {
            checkForRedirect();
            renderUser();
            setUserName();
            sakai.api.Util.getTemplates(function(success, templates) {
                if (success) {
                    renderMenu(templates);
                } else {
                    debug.error('Could not get the group templates');
                }
            });
            forceShowLoginUrl();
        };

        doInit();
    };
    sakai.api.Widgets.widgetLoader.informOnLoad('topnavigation');
});
