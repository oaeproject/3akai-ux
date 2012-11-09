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
require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai_global.carousel
     *
     * @class carousel
     *
     * @description
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.carousel = function(tuid, showSettings) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        // Containers
        var carouselContainer = '#carousel_container';

        // Templates
        var carouselSingleColumnTemplate = 'carousel_single_column_template';


        /////////////////////
        // RENDER CAROUSEL //
        /////////////////////

        var updateViewAfterAnimation = function(carousel, li, index, state) {
            if (index > carousel.options.size || index < 1) {
                index = index % carousel.options.size;
                if (!index) {
                    index = carousel.options.size;
                }
                if (index < 1) {
                    index = carousel.options.size + index;
                }
            }
            $('#carousel_container .carousel_view_toggle li').removeClass('carousel_view_toggle_selected');
            $('#carousel_view_toggle_' + carousel.last).removeClass('carousel_view_toggle_selected');
            $('#carousel_view_toggle_' + index).addClass('carousel_view_toggle_selected');

            $(window).on('sakai.addToContacts.requested', function(evObj, user) {
                var addbutton = $.grep($('#carousel_container .sakai_addtocontacts_overlay'), function(value, index) {
                    return $(value).attr('sakai-entityid') === user.userid;
                });
                $(addbutton).remove();
            });
        };

        var stopAutoScrolling = function(carousel) {
            carousel.startAuto(0);
        };

        var carouselBinding = function(carousel) {
            // Pause autoscrolling if the user moves with the cursor over the clip.
            carousel.clip.hover(function() {
                carousel.stopAuto();
            }, function() {
                carousel.startAuto();
            });

            // Disable autoscrolling if the user clicks the prev or next button.
            carousel.buttonNext.on('click', function() {
                stopAutoScrolling(carousel);
            });

            carousel.buttonPrev.on('click', function() {
                stopAutoScrolling(carousel);
            });

            $('.carousel_view_toggle li').on('click', function() {
                stopAutoScrolling(carousel);
                carousel.scroll($.jcarousel.intval($(this)[0].id.split('carousel_view_toggle_')[1]));
                $('#carousel_container .carousel_view_toggle li').removeClass('carousel_view_toggle_selected');
                $(this).addClass('carousel_view_toggle_selected');
                return false;
            });

            $(window).on(tuid + '.shown.sakai', {'carousel': carousel}, toggleCarousel);
        };

        var toggleCarousel = function(e, showing) {
            if (showing) {
                e.data.carousel.startAuto();
            } else {
                e.data.carousel.stopAuto();
            }
        };

        var renderCarousel = function(dataArr) {
            sakai.api.Util.TemplateRenderer(carouselSingleColumnTemplate, {
                'data': dataArr,
                'sakai': sakai
            }, $(carouselContainer), false);
            applyThreeDots();
            $(carouselContainer).jcarousel({
                auto: 8,
                animation: 'slow',
                scroll: 1,
                easing: 'swing',
                size: dataArr.length,
                initCallback: carouselBinding,
                wrap: 'circular',
                itemFirstInCallback: {
                    onAfterAnimation: updateViewAfterAnimation
                }
            });
        };

        var applyThreeDots = function() {
            $.each($('.carousel_apply_threedots'), function(index, item) {
                var maxrows = 1;
                if (item && item.className) {
                    var classes = item.className.split(' ');
                    $.each(classes, function(i, cl) {
                        if (cl && cl.indexOf('threedots_allow_') === 0) {
                            maxrows = parseInt(cl.split('threedots_allow_')[1], 10);
                            return false;
                        }
                    });
                }
                $(item).text(sakai.api.Util.applyThreeDots($(item).text(), $(item).width(), {max_rows:maxrows}, 'carousel_content_tags s3d_action', true));
            });
        };

        var parseContent = function(data, dataArr, callback) {
            var noPreviewArr = [];
            var previewArr = [];

            if (data && data.content && data.content.results) {
                sakai.api.Content.prepareContentForRender(data.content.results, sakai.data.me, function(results) {
                    $.each(results, function(index, item) {
                        if (item.thumbnail) {
                            previewArr.push(item);
                        } else {
                            noPreviewArr.push(item);
                        }
                    });
                    // Prefer items with previews
                    var suggested = {
                        contentType: 'suggestedContent',
                        suggestions: previewArr.concat(noPreviewArr)
                    };
                    dataArr.push(suggested);
                    callback(data, dataArr);
                });
            }
        };

        var parseGroups = function(data, dataArr) {
            var picDescTags = [];
            var picDesc = [];
            var picTags = [];
            var descTags = [];
            var desc = [];
            var tags = [];
            var noPic = [];
            $.each(data.groups.results, function(index, group) {
                var obj = {};

                if (group['sakai:group-description'] && group['sakai:group-description'].length) {
                    obj.description = group['sakai:group-description'];
                }
                if (group['sakai:tags'] && group['sakai:tags'].length) {
                    obj.tags = sakai.api.Util.formatTags(group['sakai:tags']);
                }
                if (group.picture) {
                    obj.picture = sakai.api.Groups.getProfilePicture(group);
                }
                obj.counts = group.counts;

                obj.contentType = 'group';
                obj.groupid = group['sakai:group-id'];
                obj.title = group['sakai:group-title'];

                if (obj.picture && obj.description && obj.tags) {
                    picDescTags.push(obj);
                } else if (obj.picture && obj.description) {
                    picDesc.push(obj);
                } else if (obj.picture && obj.tags) {
                    picTags.push(obj);
                } else if (obj.description && obj.tags) {
                    descTags.push(obj);
                } else if (obj.description) {
                    desc.push(obj);
                } else if (obj.tags) {
                    tags.push(obj);
                } else {
                    noPic.push(obj);
                }
            });
            var suggested = {
                contentType: 'suggestedGroups',
                suggestions: picDescTags.concat(picDesc, picTags, descTags, desc, tags, noPic).splice(0,6)
            };

            dataArr.push(suggested);

        };

        var parseUsers = function(data, dataArr) {
            var hasPicAndTag = [];
            var hasPic = [];
            var hasTag = [];
            var noPicAndTag = [];

            sakai.api.User.getContacts(function() {
                $.each(data.users.results, function(index, user) {
                    var obj = {};

                    obj.userid = user.profile.userid;
                    obj.contentType = 'user';
                    obj.displayName = sakai.api.User.getDisplayName(user.profile);
                    obj.counts = user.profile.counts;

                    user = user.profile.basic.elements;
                    if (user['sakai:tags'] && user['sakai:tags'].value && user['sakai:tags'].value.length) {
                        obj.tags = sakai.api.Util.formatTags(user['sakai:tags'].value);
                    }
                    if (user.aboutme) {
                        obj.aboutme = user.aboutme.elements.aboutme.value;
                    }
                    if (user.picture && user.picture.value && user.picture.value.length) {
                        obj.picture = $.parseJSON(user.picture.value);
                    }
                    // is the user a contact or pending contact
                    if ($.grep(sakai.data.me.mycontacts, function(value, index) {return value.target === obj.userid;}).length !== 0) {
                        obj.connected = true;
                    }

                    if (obj.picture && obj.tags) {
                        hasPicAndTag.push(obj);
                    } else if (obj.picture) {
                        hasPic.push(obj);
                    } else if (obj.tags) {
                        hasTag.push(obj);
                    } else {
                        noPicAndTag.push(obj);
                    }
                });

                var suggested = {
                    contentType: 'suggestedUsers',
                    suggestions: hasPicAndTag.concat(hasPic, hasTag, noPicAndTag).splice(0, 8)
                };
                dataArr.push(suggested);
            });
        };

        var parseData = function(data) {
            var dataArr = [];
            parseContent(data, dataArr, function(data, dataArr) {
                parseGroups(data, dataArr);
                parseUsers(data, dataArr);
                if (dataArr.length) {
                    renderCarousel(dataArr);
                }
            });
        };

        var loadFeatured = function() {
            var dataArr = {
                'content': false,
                'groups': false,
                'users': false
            };

            var reqs = [
                {
                    url: '/var/search/pool/me/related-content.json',
                    method: 'GET',
                    parameters: {
                        'items': 11
                    }
                },
                {
                    url: '/var/contacts/related-contacts.json',
                    method: 'GET',
                    parameters: {
                        'items': 11
                    }
                },
                {
                    url: '/var/search/myrelatedgroups.json',
                    method: 'GET',
                    parameters: {
                        'items': 11
                    }
                }
            ];

            sakai.api.Server.batch(reqs, function(success, data) {
                if (success) {
                    //content
                    dataArr.content = $.parseJSON(data.results[0].body);
                    //users
                    dataArr.users = $.parseJSON(data.results[1].body);
                    //groups
                    dataArr.groups = $.parseJSON(data.results[2].body);
                }
                parseData(dataArr);
            });

        };

        var doInit = function() {
            loadFeatured();
        };

        doInit();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('carousel');
});
