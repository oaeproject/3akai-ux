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
// load the master sakai object to access all Sakai OAE API methods
require(['jquery', 'underscore', 'sakai/sakai.api.core'], function($, _, sakai) {

    /**
     * @name sakai_global.versions
     *
     * @class versions
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.versions = function(tuid, showSettings) {


        ///////////////
        // VARIABLES //
        ///////////////

        var $rootel = $('#' + tuid);

        // Vars
        var contentPath = '';
        var currentPageShown = '';
        var versions = [];
        var itemsBeforeScroll = 0;

        // Containers
        var versionsContainer = '#versions_container';

        // Templates
        var versionsTemplate = 'versions_template';

        // Elements
        var versionsVersionItem = '.versions_version_item';
        var versionsRestoreVersion = '.versions_restore_version';


        var carouselBinding = function(carousel) {
            $('#versions_newer', $rootel).on('click',function() {
                carousel.prev();
            });

            $('#versions_older', $rootel).on('click',function() {
                if (carousel.last !== carousel.size()) {
                    carousel.next();
                }
            });

            $('#versions_oldest', $rootel).on('click',function() {
                carousel.scroll(carousel.size() || 0);
            });

            $('#versions_newest', $rootel).on('click',function() {
                carousel.scroll(0);
            });
        };


        ///////////////
        // RENDERING //
        ///////////////

        var renderVersions = function(users) {
            $(versionsContainer, $rootel).html(sakai.api.Util.TemplateRenderer(versionsTemplate, {
                'itemsBeforeScroll': itemsBeforeScroll,
                'users': users,
                'data': versions,
                'sakai': sakai,
                'currentPage': currentPageShown
            }));
            if (versions.length) {
                $('#versions_carousel_container', $rootel).jcarousel({
                    animation: 'slow',
                    easing: 'swing',
                    scroll: 4,
                    start: 0,
                    initCallback: carouselBinding,
                    itemFallbackDimension: 123
                });
            }
        };

        var parseVersions = function(success, data) {
            $.each(data.versions, function(index, version) {
                version.versionId = index;
                versions.push(version);
            });
            renderVersions(data.users);
        };


        //////////
        // UTIL //
        //////////

        var getVersions = function() {
            sakai.api.Server.loadJSON(currentPageShown.pageSavePath + '/' + currentPageShown.saveRef + '.versions.json', parseVersions);
        };

        var getContext = function() {
            contentPath = $.bbq.getState('content_path');
        };

        var getVersionContent = function(versionId, callback) {
            var version = versions[versionId];
            if (!version.version) {
                var vurl = currentPageShown.pageSavePath + '/' + currentPageShown.saveRef + '.version.,' + version.versionId + ',.json';
                sakai.api.Server.loadJSON(vurl, function(success, data) {
                    if (success) {
                        if (!data.version) {
                            version.version = {
                                'rows': [{
                                    'id': sakai.api.Util.generateWidgetId(),
                                    'columns': [{
                                        'width': 1,
                                        'elements': []
                                    }]
                                }]
                            };
                        } else if (_.isString(data.version)) {
                            version.version = $.parseJSON(data.version);
                        }
                        callback(version);
                    }
                });
            } else {
                callback(version);
            }
        };

        var previewVersion = function(event) {
            event.stopPropagation();
            if (!sakai_global.content_profile || sakai_global.content_profile.content_data.data.mimeType === 'x-sakai/document') {
                $('.versions_selected', $rootel).removeClass('versions_selected');
                $('#' + currentPageShown.ref).remove();
                $(this).addClass('versions_selected');
                getVersionContent($(this).attr('data-versionId'), showPageVersion);
            } else{
                window.open(currentPageShown.pageSavePath + '.version.,' + $(this).attr('data-version') + ',/' + $(this).attr('data-pooleditemname'), '_blank');
            }
        };

        var showPageVersion = function(version) {
            var newPageShown = $.extend(true, {}, currentPageShown);
            newPageShown.content = version.version;
            newPageShown.isVersionHistory = true;
            newPageShown.ref = currentPageShown.ref + '_previewversion';
            $(window).trigger('showpage.contentauthoring.sakai', newPageShown);
        };

        var restoreVersion = function(e) {
            getVersionContent($(this).parent().attr('data-versionId'), saveRestoredVersion);
        };

        var addIgnores = function(version) {
            for (var i in version) {
                if (version.hasOwnProperty(i)) {
                    if (version[i].comments) {
                        delete version[i].comments.message.inbox;
                        version[i].comments.message['inbox@Ignore'] = true;
                    } else if (version[i].discussion) {
                        delete version[i].discussion.message.inbox;
                        version[i].discussion.message['inbox@Ignore'] = true;
                    }
                }
            }
            return version;
        };

        var saveRestoredVersion = function(version) {
            var toStore = $.extend({}, version.version);
            currentPageShown.content = toStore;
            toStore.version = addIgnores(version.version);
            toStore.version = JSON.stringify(toStore.version);
            sakai.api.Server.saveJSON(currentPageShown.pageSavePath + '/' + currentPageShown.saveRef, toStore, function(success) {
                $.ajax({
                    url: currentPageShown.pageSavePath + '/' + currentPageShown.saveRef + '.save.json',
                    type: 'POST',
                    success: function() {
                        $(window).trigger('update.versions.sakai', currentPageShown);
                    }
                });
            }, false, false, false);
        };


        /////////////
        // BINDING //
        /////////////

        var addBinding = function() {
            if (!sakai_global.content_profile || sakai_global.content_profile.content_data.data.mimeType === 'x-sakai/document') {
                $rootel.off('click', versionsVersionItem).on('click', versionsVersionItem, previewVersion);
            }

            $rootel.off('click', versionsRestoreVersion).on('click', versionsRestoreVersion, restoreVersion);
        };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        var doInit = function() {
            versions = [];
            addBinding();
            getContext();
            getVersions();
        };

        $(window).on('init.versions.sakai', function(ev, cps) {
            if ($('.s3d-page-column-left').is(':visible')) {
                // There is a left hand navigation visible, versions widget will be smaller
                $(versionsContainer, $rootel).removeClass('versions_without_left_hand_nav');
                itemsBeforeScroll = 6;
            } else {
                // No left hand navigation visible, versions widget will be wider
                $(versionsContainer, $rootel).addClass('versions_without_left_hand_nav');
                itemsBeforeScroll = 7;
            }
            currentPageShown = cps;
            $('.versions_widget', $rootel).show();
            doInit();
        });
        $(window).on('close.versions.sakai', function(ev, cps) {
            $('.versions_widget', $rootel).hide();
            $(window).trigger('showpage.contentauthoring.sakai', currentPageShown);
        });

        $(window).on('update.versions.sakai', function(ev, cps) {
            if ($('.versions_widget', $rootel).is(':visible')) {
                currentPageShown = cps;
                doInit();
            }
        });


    };

    sakai.api.Widgets.widgetLoader.informOnLoad('versions');
});
