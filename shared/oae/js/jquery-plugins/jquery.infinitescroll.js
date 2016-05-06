/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
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

define(['jquery', 'underscore', 'oae.api.util', 'oae.api.i18n', 'oae.api.l10n'], function (jQuery, _, oaeUtil, oaeI18n, oaeL10n) {
(function($) {

    /**
     * OAE plugin that will provide infinite scrolling for lists of items being displayed. This plugin will take care of retrieving the
     * list items and deciding when to retrieve the next set of results, as well as the actual appending to the list, showing loading
     * animations, etc.
     *
     * The template used to render the result should put each item into its own `li` tag and should have a `data-id` attribute containing
     * the item's id. This goes the same for the "initialContent" template, however it is recommended that the initial content item be
     * tagged with class `oae-list-initial` so that when calculating whether or not there are any result rows in the list, the initial
     * content can be omitted from that calculation.
     *
     * By default, the infinite scroll plug-in will use the `nextToken` key for paging when provided in the back-end feed response. When
     * no `nextToken` is provided, the index of the last rendered item will be used instead.
     *
     * @param  {String}                            source                          The REST endpoint URL to use for retrieving list data.
     * @param  {Object}                            [parameters]                    Parameters to send along for each list items retrieval ajax request.
     * @param  {Object}                            [parameters.limit]              The number of items to load per ajax request. This will default to 10 if not provided.
     * @param  {String|Element|Function}           render                          jQuery element or selector for that jQuery element that identifies the Trimpath template that should be used to render retrieved results. If a function is provided, this function will be called instead with 1 parameter: the server response containing the retrieved results. The function should return the generated HTML string.
     * @param  {Object}                            [options]                       Optional object containing additional configuraton options.
     * @param  {String|Element}                    [options.scrollContainer]       jQuery element or selector for that jQuery element that identifies the container on which the scrollposition should be watched to check when we are close enough to the bottom to load a new set of results. If this is not provided, the document body will be used.
     * @param  {String|Function}                   [options.initialContent]        HTML string that should be prepended to the list upon initialization. If a function is provided, the function will be called with no parameters and should return the HTML string to prepend.
     * @param  {Function}                          [options.emptyListProcessor]    Function that will be executed when the rendered list doesn't have any elements.
     * @param  {Function}                          [options.postProcessor]         Function used to transform the search results before rendering the template. This function will be called with a data parameter containing the retrieved data and should return the processed data
     * @param  {Function}                          [options.postRenderer]          Function executed after the rendered HTML has been appended to the rendered list. The full retrieved server response will be passed into this function as the first parameter as well as the rendered template.
     * @throws {Error}                                                             Error thrown when not all of the required parameters have been provided
     */
    $.fn.infiniteScroll = function(source, parameters, render, options) {
        // Parameter validation
        if (!source) {
            throw new Error('A valid source URL should be provided');
        } else if (!render) {
            throw new Error('A valid template name or render function should be provided');
        }

        // Default values
        parameters = parameters || {};
        options = options || {};

        // Number of items to load per call to the server
        parameters.limit = parameters.limit || 10;
        // Make sure render is a jQuery object if a string has been provided
        if (_.isString(render)) {
            render = $(render);
        }
        // Make sure the scollcontainer is a jQuery element if it's been provided
        if (options.scrollContainer) {
            options.scrollContainer = $(options.scrollContainer);
        }

        // Container that will be used to show the loading animation. We add the
        // `text-center` class to make sure that the animation is centered. We also
        // add `clear: both` to make sure that the animation is displayed underneath
        // the actual list
        var $loadingContainer = $('<div />').addClass('text-center hide').css('clear', 'both');

        // Set the container in which the results should be rendered
        var $listContainer = $(this);

        // Variable that keeps track of the `nextToken` that was provided in the previous results list. This
        // will be used as the `start` paging parameters for next set of results
        var nextToken = null;

        // Variable that keeps track of whether or not the initial search has happened, as the initial
        // search does not need to provide a paging parameter
        var initialSearchDone = false;

        ////////////////////////
        // Infinite scrolling //
        ////////////////////////

        // Variable that keeps track of whether or not the infinite scroll plug-in can request more data. This
        // prevents things like making a request whilst there is still one in progress, etc.
        var canRequestMoreData = true;

        /**
         * Start listening to the window's scroll event and decide when we are close enough to the end of the
         * page before fetching the next set of items
         */
        var startInfiniteScrolling = function() {
            if (options.scrollContainer) {
                options.scrollContainer.scroll(checkLoadNext);
            } else {
                $(window).scroll(checkLoadNext);
            }
        };

        /**
         * Function that checks whether the current scroll position is within a certain distance
         * of the end of the page or the end of the scroll container. If it is, we load the next set of results.
         */
        var checkLoadNext = function() {
            // We only check if a new set of results should be loaded if a search
            // is not in progress and if the container has not been killed
            if (canRequestMoreData && ($listContainer && $listContainer.is(':visible'))) {
                // In case we use the body
                var threshold = 500;
                var pixelsRemainingUntilBottom = $(document).height() - $(window).height() - $(window).scrollTop();
                // In case we use a scroll container
                if (options.scrollContainer) {
                    threshold = 200;
                    pixelsRemainingUntilBottom = options.scrollContainer.prop('scrollHeight') - options.scrollContainer.height() - options.scrollContainer.scrollTop();
                }
                // Check if this is close enough to the bottom to kick off a new item load
                if (pixelsRemainingUntilBottom <= threshold) {
                    loadResultList();
                }
            }
        };

        ////////////////////
        // List rendering //
        ////////////////////

        /**
         * Retrieve the next set of results from the server
         */
        var loadResultList = function() {
            showLoadingContainer();

            // Make sure that no other requests are sent until the current request finishes
            canRequestMoreData = false;
            // Only page once the initial search has been done
            if (initialSearchDone === true) {
                // Get the rendered list items
                var listItems = $listContainer.children('li:not(.oae-list-actions)').filter(':visible');
                parameters.start = nextToken || listItems.length;
            }

            // Get the data from the server
            $.ajax({
                'url': source,
                'data': parameters,
                'success': function(data) {
                    initialSearchDone = true;
                    nextToken = data.nextToken;
                    processList(data, {'update': true});
                },
                'error': function() {
                    hideLoadingContainer();
                }
            });
        };

        /**
         * Run the list of items to be added through a processor before pushing them through
         * a template. The postProcessor will be given an array of items to be added to
         * the infinite scroll. The plugin expects an array of items to come back from
         * the postProcessor as well.
         *
         * @param  {Object}      data           List of items to add to the infinite scroll list
         * @param  {Object}     [opts]          Optional arguments
         * @param  {Boolean}    [opts.prepend]  `true` when we want to prepend the new items to the list, otherwise items are appended
         * @param  {Boolean}    [opts.update]   `true` when we want to update existing items in place (identified by attribute `data-id`), otherwise existing items are removed then re-added with the updated version
         */
        var processList = function(data, opts) {
            if (options.postProcessor) {
                data = options.postProcessor(data);
            }
            renderList(data, opts);
        };

        /**
         * Add a list of items to the current infinite scroll list. We expect the list of items
         * to be wrapped in a `results` object, and have an `id` parameter for each of the results.
         * Results that are already in the list will not be re-rendered.
         *
         * @param  {Object}     data            Post-processed server response
         * @param  {Objet}      [opts]          Optional arguments
         * @param  {Boolean}    [opts.prepend]  `true` when we want to prepend the new items to the list, otherwise items are appended
         * @param  {Boolean}    [opts.update]   `true` when we want to update existing items in place (identified by attribute `data-id`), otherwise existing items are removed then re-added with the updated version
         */
        var renderList = function(data, opts) {
            opts = opts || {};
            opts.prepend = (opts.prepend === true) ? true : false;
            opts.update = (opts.update === true) ? true : false;

            // Check if the infinite scroll instance still exists. It's possible that
            // the instance was killed in between the time that a request was fired and
            // the response was received. If that's the cause, there's nothing else we
            // need to do
            if ($listContainer) {

                // Render the template and put it in the container
                hideLoadingContainer();
                var templateOutput = '';
                if (_.isFunction(render)) {
                    templateOutput = render(data.results);
                } else {
                    templateOutput = oaeUtil.template().render(render, data);
                }

                // When appending results, we update the existing elements with the ones being
                // rendered. When prepending results, we always push the new ones in and remove the
                // existing elements with the same data-id attribute
                var $tmp = $('<div>').html(templateOutput);
                $tmp.children().each(function(index, newListItem) {
                    var id = $(newListItem).attr('data-id');
                    if (id) {
                        var $existing = $('li[data-id="' + id + '"]', $listContainer);
                        if ($existing.length > 0) {
                            if (opts.update) {
                                // Remove the item from the new template and replace the existing item
                                // with it
                                $(newListItem).remove();
                                $existing.replaceWith(newListItem);
                            } else {
                                // Remove the existing item. The item will be re-added in the new
                                // template
                                $existing.remove();
                            }
                        }
                    }
                });

                // Bring the filtered html back to templateOutput
                var $templateOutput = $($.trim($tmp.html()));
                if (opts.prepend) {
                    // Insert the item after the `oae-list-actions` element (if there is one)
                    var $listActions = $listContainer.find('.oae-list-actions');
                    if ($listActions.length) {
                        $templateOutput.hide().insertAfter($listActions).fadeIn('slow');
                    } else {
                        $templateOutput.hide().prependTo($listContainer).fadeIn('slow');
                    }
                } else {
                    // Append the results
                    $templateOutput.appendTo($listContainer);
                }

                // Call the post renderer if it has been provided
                if (options.postRenderer) {
                    options.postRenderer(data, $templateOutput);
                }

                // We only check whether or not more items should be fetched when the results where not
                // prepended. When they were prepended, this indicates an in-memory user action which should
                // be independent of the main list infinite scrolling
                if (!opts.prepend) {
                    // Determine if the nextToken is truthy or the number of returned results is the same as
                    // the number of requested results. If either of these is the case, we can assume that more
                    // results should be fetched when reaching the appropriate scroll position. However, we pause
                    // for a second, as to not to send too many requests at once
                    if (nextToken || data.results.length === parameters.limit) {
                        canRequestMoreData = true;
                        checkLoadNext();
                    } else {
                        // Don't do any more searches when scrolling. We omit items with
                        // `oae-list-initial` as we are specifically looking for data items rather
                        // than any kind of initial item that was provided (e.g., a header)
                        canRequestMoreData = false;
                        if ($('li:not(.oae-list-initial)', $listContainer).length === 0) {
                            if (options.emptyListProcessor) {
                                options.emptyListProcessor();
                            }
                        }
                    }
                }

                // Apply timeago to the `oae-timeago` elements in the output container
                oaeL10n.timeAgo($listContainer);

                // Apply multi-line threedotting to the tile titles
                $('.oae-tile .oae-tile-title').dotdotdot({'watch': 'window'});
            }
        };

        /**
         * Prepend some initial content to the infinite scroll list if initial content or an
         * initial content function has been provided.
         */
        var setUpInitialContent = function() {
            if (options.initialContent) {
                if (_.isFunction(options.initialContent)) {
                    $listContainer.prepend(options.initialContent());
                } else {
                    $listContainer.prepend(options.initialContent);
                }
            }
        };

        ///////////////////////
        // List manipulation //
        ///////////////////////

        /**
         * Function called to prepend or update items in the list. This is useful when the existing
         * UI state needs to be updated due to list items being updated or created
         *
         * @param  {Object}     items           Object containing the array of items to be updated (e.g. `{'results': [<items>]}`)
         * @param  {Object[]}   items.results   The array of items to be added or updated
         * @param  {Boolean}    [update]        When `true`, indicates that prepended items with an existing id will be updated in place. Otherwise, duplicate items will be removed and re-prepended to the list
         */
        var prependItems = function(items, update) {
            // In case the list was previously empty, we need to remove the "no results" message
            if ($('li:not(.oae-list-initial)', $listContainer).length === 0) {
                $listContainer.empty();
            }

            processList(items, {'prepend': true, 'update': update});
        };

        /**
         * Remove one or more items from the list. This will fade the items out and hide them.
         *
         * @param  {String|String[]}       items       Id of the element that should be removed from the list or array of ids for all elements that should be removed from the list
         */
        var removeItems = function(items) {
            if (!_.isArray(items)) {
                items = [items];
            }

            var removed = 0;
            $.each(items, function(i, item) {
                $item = $('[data-id="' + item + '"]', $listContainer);
                $item.fadeOut(250, function() {
                    $(this).remove();
                    removed++;
                    if (removed === items.length) {
                        // More data is loaded if necessary
                        if (canRequestMoreData) {
                            checkLoadNext();
                        // Otherwise, we check if the list is now an empty list. In that case,
                        // the empty list placeholder is shown
                        } else {
                            if ($('li:not(.oae-list-initial)', $listContainer).length === 0) {
                                if (options.emptyListProcessor) {
                                    options.emptyListProcessor();
                                }
                            }
                        }
                    }
                });
            });
        };

        ////////////////////////////
        // Kill infinite scroller //
        ////////////////////////////

        /**
         * Kill an instance of an infinite scroll object. This means the object
         * will no longer respond to any events or functions
         */
        var kill = function() {
            $listContainer.html('');
            $loadingContainer.remove();
            canRequestMoreData = false;
            nextToken = null;
            $listContainer = null;
        };

        ///////////////////
        // Loading image //
        ///////////////////

        /**
         * Show the loading animation
         */
        var showLoadingContainer = function() {
            $loadingContainer.show();
        };

        /**
         * Hide the loading animation
         */
        var hideLoadingContainer = function() {
            $loadingContainer.hide();
        };

        /**
         * Create a div underneath the infinite scroll list that shows a loading
         * animation when a new set of results is being loaded
         */
        var setUpLoadingImage = function() {
            // Create the loading animation element
            var $loader = $('<i />').addClass('fa fa-spinner fa-spin');
            // Create a text element that will be used for accessibility purposes
            var $a11yHelper = $('<span />').text(oaeI18n.translate('__MSG__LOADING__')).addClass('sr-only');
            // Add the accessibility helper to the loading animation and add the loading
            // animation to the loader container
            $loader.append($a11yHelper);
            $loadingContainer.append($loader);
            $loadingContainer.insertAfter($listContainer);
        };

        ////////////////////
        // Initialisation //
        ////////////////////

        $listContainer.attr('aria-live', 'assertive');
        setUpLoadingImage();
        setUpInitialContent();
        loadResultList();
        startInfiniteScrolling();

        return {
            'prependItems': prependItems,
            'removeItems': removeItems,
            'kill': kill
        };

    };

})(jQuery);
});
