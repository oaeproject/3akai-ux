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

define(['jquery', 'oae.core', 'underscore', 'select2'], function(
    $,
    oae,
    _,
    select2,
) {
    let location = $.url(encodeURI(window.location.href));
    let protocol = location.attr('protocol');
    let query = location.attr('relative');

    return function() {
        'use strict';

        let searchTenancyModule = {
            init: function() {
                this.cacheModule();
                this.bindEvents();
                this.render();
            },
            cacheModule: function() {
                this.$module = $('#tenancyForm');
                this.$input = this.$module.find('#tenancyInput');
                this.$alert = this.$module.find('#tenancyAlert');
            },
            bindEvents: function() {
                this.$input.on('select2:select', this.tenancySelect.bind(this));
            },
            render: function() {
                this.$input.select2({
                    dropdownParent: $('#signin-modal'),
                    ajax: {
                        url: '/api/search/tenants?limit=10',
                        dataType: 'json',
                        delay: 700,
                        data: function(params) {
                            return {
                                q: params.term, // search term
                                page: params.page,
                            };
                        },
                        error: function(data) {
                            if (data.status === 0) {
                                return;
                            } else if (
                                (data.status === 404 &&
                                    data.statusText === 'Not Found') ||
                                (data.status === 400 &&
                                    data.statusText === 'Bad Request')
                            ) {
                                searchTenancyModule.$module.addClass('fail');
                                searchTenancyModule.$input.select2('destroy');
                            }
                        },
                        processResults: function(data, params) {
                            // parse the results into the format expected by Select2
                            // since we are using custom formatting functions we do not need to
                            // alter the remote JSON data, except to indicate that infinite
                            // scrolling can be used
                            let tenancyResults = _.map(
                                data.results,
                                eachResult => {
                                    return {
                                        host: eachResult.host,
                                        displayName: eachResult.displayName,
                                        id: eachResult.alias,
                                        code: eachResult.countryCode,
                                    };
                                },
                            );

                            tenancyResults = _.sortBy(
                                tenancyResults,
                                'displayName',
                            );
                            params.page = params.page || 1;

                            return {
                                results: tenancyResults,
                                pagination: {
                                    more: params.page * 10 < data.totalCount,
                                },
                            };
                        },
                        cache: false,
                    },
                    escapeMarkup: function(markup) {
                        return markup;
                    }, // let our custom formatter work
                    minimumInputLength: 2,
                    templateResult: this.formatRepo,
                    templateSelection: this.formatRepoSelection,
                });
            },
            formatRepo: function(tenant) {
                if (tenant.loading) {
                    return tenant.text;
                }
                return `<a value="${protocol}://${
                    tenant.host
                }" class="select2-results__option" id="${
                    tenant.id
                }" target="_blank">${tenant.displayName}, ${tenant.code}</a>`;
            },

            formatRepoSelection: function(tenant) {
                return tenant.displayName || tenant.text;
            },

            tenancySelect: function(tenant) {
                let redirectURL = `${protocol}://${
                    tenant.params.data.host
                }${query}`;
                this.submit(redirectURL);
            },

            submit: function(redirectURL) {
                this.$alert
                    .find('.redirection')
                    .stop()
                    .fadeIn()
                    .delay(500)
                    .fadeOut();

                this.$alert
                    .stop()
                    .slideDown()
                    .delay(500)
                    .slideUp();

                setTimeout(() => {
                    window.location = redirectURL;
                }, 500);
            },
        };
        searchTenancyModule.init();
    };
});
