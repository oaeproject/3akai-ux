/*!
 * Copyright 2017 Apereo Foundation (AF) Licensed under the
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

define(['jquery', 'oae.core', 'moment', 'async', 'underscore', 'select2'], function($, oae, moment, async, _, select2) {

    return (function () {
        'use strict';

        var searchTenancyModule =  {
            init: function() {
                this.cacheModule();
                this.bindEvents();
                this.render();
            },
            cacheModule: function() {
                this.$module = $('#tenancyForm');
                this.$input = this.$module.find('#tenancyInput');
                // this.$button = this.$module.find('#tenancySubmit');
                this.$alert = this.$module.find('#tenancyAlert');
                // this.$ugButton = this.$module.find('#ugSubmit');
                // this.$oaButton = this.$module.find('#oaSubmit');
            },
            bindEvents: function() {
                // this.$button.on('click', this.submit.bind(this));
                // this.$ugButton.on('click', this.submit.bind(this));
                // this.$oaButton.on('click', this.submit.bind(this));
                this.$input.on('select2:select', this.tenancySelect.bind(this));
            },
            render: function() {
                this.$input.select2({
                    dropdownParent: $('#signin-modal'),
                    ajax: {
                        url: 'https://admin.unity.ac/api/search/tenants?limit=2000',
                        dataType: 'json',
                        delay: 700,
                        data: function (params) {
                            return {
                                q: params.term, // search term
                                page: params.page
                            };
                        },
                        error: function (data) {
                            if (data.status === 0) {
                                return;
                            } else if ((data.status === 404 && data.statusText === 'Not Found') || (data.status === 400 && data.statusText === 'Bad Request')) {
                                searchTenancyModule.$module.addClass('fail');
                                searchTenancyModule.$input.select2('destroy');
                            }
                        },
                        processResults: function (data, params) {

                            // parse the results into the format expected by Select2
                            // since we are using custom formatting functions we do not need to
                            // alter the remote JSON data, except to indicate that infinite
                            // scrolling can be used

                            var tenancyResults = [];
                            for (var i = data.results.length - 1; i >= 0; i--) {

                                // debug
                                // console.log(data.results[i].displayName);

                                var obj = {

                                    host: data.results[i].host,
                                    displayName: data.results[i].displayName,
                                    id: data.results[i].alias,
                                    code: data.results[i].countryCode

                                };
                                tenancyResults.push(obj);
                            }

                            tenancyResults = tenancyResults.slice(0, 10);
                            tenancyResults.sort(function (a, b) {
                                if (a.displayName.length > b.displayName.length) {
                                    return 1;
                                }
                                if (a.displayName.length < b.displayName.length) {
                                    return -1;
                                }
                                return 0;
                            });

                            params.page = params.page || 1;

                            return {
                                results: tenancyResults,
                                pagination: {
                                    more: (params.page * 30) < data.totalCount
                                }
                            };
                        },
                        cache: false
                    },
                    escapeMarkup: function (markup) {
                        return markup;
                    }, // let our custom formatter work
                    minimumInputLength: 2,
                    templateResult: this.formatRepo, // omitted for brevity, see the source of this page
                    templateSelection: this.formatRepoSelection // omitted for brevity, see the source of this page
                });

            },
            formatRepo: function(tenant) {
                if (tenant.loading) {
                    return tenant.text;
                }
                var markup = '<a value="http://';
                markup += tenant.host;
                markup += '" class="select2-results__option" id="';
                markup += tenant.id + '" target="_blank">';
                markup += tenant.displayName + ', ' + tenant.code;
                markup += '</a>';
                return markup;
            },

            formatRepoSelection: function(tenant) {
                return tenant.displayName || tenant.text;
            },

            // Push the selection URL to the button
            tenancySelect: function (tenant) {

                let location = require('oae.core').data.location;
                let protocol = $.url(encodeURI(location)).attr('protocol');
                let query = $.url(encodeURI(location)).attr('relative');
                let redirectURL = `${protocol}://${tenant.params.data.host}${query};`;
                window.location = redirectURL;

                /*
                this.$button.attr({
                    href: 'https://' + tenant.params.data.host,
                    target: '_blank'
                });
                this.$ugButton.attr({
                href: 'https://' + tenant.params.data.host + '/group/rr/BJTVEvQ-e',
                target: '_blank'
                });
                this.$oaButton.attr({
                    href: 'https://' + tenant.params.data.host + '/group/apereo/SJS8frmZb',
                    target: '_blank'
                });
                */
            },

            // On submit, check if the button has a url attached to it, if not, show a notice
            submit: function () {
                /*
                if (this.$button.attr('href')) {
                    window.open(this.$button.attr('href'));
                } else if (this.$ugButton.attr('href')) {
                    window.open(this.$ugButton.attr('href'));
                } else if (this.$oaButton.attr('href')) {
                    window.open(this.$oaButton.attr('href'));
                } else {

                    this.$alert.find('.noSelection').stop()
                        .fadeIn()
                        .delay(1000)
                        .fadeOut();

                    this.$alert.stop()
                        .slideDown()
                        .delay(1000)
                        .slideUp();
                }
                */
            }
        };
        searchTenancyModule.init();
    });
});
