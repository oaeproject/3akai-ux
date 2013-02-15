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

define(['jquery', 'underscore', 'oae.api.util', 'oae.api.i18n'], function (jQuery, _, oaeUtil, oaeI18n) {
(function($) {

    /**
     * Sakai OAE plugin that will provide infinite scrolling for lists of items being displayed. This plugin will take care of retrieving the
     * list items and deciding when to retrieve the next set of results, as well as the actual appending to the list, showing loading
     * animations, etc.
     *
     * The template used to render the result should put each item into its own `li` tag, and should have a `data-id` attribute containing
     * the item's id and a `data-key` attribute containing the value that should be used as the start value for paging.
     *
     * @param  {String}                            source                          The REST endpoint URL to use for retrieving list data.
     * @param  {Object}                            [parameters]                    Parameters to send along for each list items retrieval ajax request.
     * @param  {Object}                            [parameters.limit]              The number of items to load per ajax request. This will default to 10 if not provided.
     * @param  {String|Element|Function}           render                          jQuery element or selector for that jQuery element that identifies the Trimpath template that should be used to render retrieved results. If a function is provided, this function will be called instead with 1 parameters: the server response containing the retrieved results. The function should return the generated HTML string.
     * @param  {Object}                            [options]                       Optional object containing additional configuraton options.
     * @param  {String|Element}                    [options.scrollcontainer]       jQuery element or selector for that jQuery element that identifies the container on which the scrollposition should be watched to check when we are close enough to the bottom to load a new set of results. If this is not provided, the document body will be used.
     * @param  {Function}                          [options.emptyListProcessor]    Function that will be executed when the rendered list doesn't have any elements.
     * @param  {Function}                          [options.postProcessor]         Function used to transform the search results before rendering the template. This function will be called with a data parameter containing the retrieved data and should return the processed data
     * @param  {Function}                          [options.postRenderer]          Function executed after the rendered HTML has been appended to the rendered list. The full retrieved server response will be passed into this function.
     * @param  {String}                            [options.loadingImage]          Path to the loading image that should be shown when a new set of list items is being loaded
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
        // Set default loading animation
        options.loadingImage = '/ui/img/Infinite_Scrolling_Loader_v01.gif';

        // Set the container in which the results should be rendered
        var $container = options.scrollContainer ? options.scrollContainer : $(this);
        // Container that will be used to show the loading animation
        var $loadingContainer = $('<div />');

        // Gets filled up each time we request a list.
        var lastItem = null;

        ////////////////////////
        // Infinite scrolling //
        ////////////////////////

        // Keep track as to whether we're currently fetching a new list of items or not.
        // If we're doing that, we wait until it has finished before fetching the next list.
        var isDoingSearch = false;

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
            if (!isDoingSearch) {
                // In case we use the body
                var threshold = 500;
                var pixelsRemainingUntilBottom = $(document).height() - $(window).height() - $(window).scrollTop();
                // In case we use a scroll container
                if (options.scrollContainer) {
                    threshold = 280;
                    pixelsRemainingUntilBottom = options.scrollContainer.height() - options.scrollContainer.scrollTop();
                }
                // Check if this is close enough to the bottom to kick off a new item load
                if (pixelsRemainingUntilBottom <= threshold && $container.is(':visible')) {
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
            isDoingSearch = true;
            showLoadingContainer();
            // Get the key of the latest
            var $lastElement = $('li', $container).filter(':visible').filter(':last');
            if ($lastElement.length !== 0) {
                parameters.start = $lastElement.attr('data-key') ? $lastElement.attr('data-key') : $lastElement.index();
            }

            // Get the data from the server
            $.ajax({
                'url': source,
                'data': parameters,
                'success': function(data) {
                    processList(data);
                },
                'error': function() {
                    hideLoadingContainer();
                    console.error('An error has occured while retrieving the list of results');
                }
            });
        };

        /**
         * Run the list of items to be added through a processor before pushing them through
         * a template. The postProcessor will be pass on the server response to the postProcessor
         * function.
         *
         * @param {Object}      data       Response received from the server
         */
        var processList = function(data) {
            if (options.postProcessor) {
                data = options.postProcessor(data);
            }
            renderList(data);
        };

        /**
         * Add a list of items to the current infinite scroll list. We expect the list of items
         * to be wrapped in a `results` object, and have an `id` parameter for each of the results.
         * Results that are already in the list will not be re-rendered.
         *
         * @param {Object} data       Post-processed server response
         */
        var renderList = function(data) {
            // Determine if we should attempt to load a next page
            var canFetchMore = (data.results.length === parameters.limit);

            // Filter out items that are already in the list
            var filteredresults = [];
            $.each(data.results, function(i, result) {
                // Determine whether this item is already in the list
                // by looking for an element with the same id
                if (!$('*[data-id="' + result.id + '"]', $container).length) {
                    filteredresults.push(result);
                }
            });
            data.results = filteredresults;

            // Render the template and put it in the container
            hideLoadingContainer();
            var templateOutput = '';
            if (_.isFunction(render)) {
                templateOutput = render(data.results);
            } else {
                templateOutput = oaeUtil.renderTemplate(render, data);
            }
            $container.append(templateOutput);

            // Call the post renderer if it has been provided
            if (options.postRenderer) {
                options.postRenderer(data);
            }

            // If there are more results and we're still close to the bottom of the page,
            // check if we should do another one. However, we pause for a second, as to
            // not to send too many requests at once
            if (canFetchMore) {
                setTimeout(function() {
                    isDoingSearch = false;
                    checkLoadNext();
                }, 1000);
            } else {
                // Don't do any more searches when scrolling
                isDoingSearch = true;
                if ($('li:visible', $container).length === 0) {
                    if (options.emptyListProcessor) {
                        options.emptyListProcessor();
                    }
                }
            }
        };

        ///////////////////////
        // List manipulation //
        ///////////////////////

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
                $item = $('[data-id="' + item + '"]', $container);
                $item.fadeOut(false, function() {
                    $(this).remove();
                    removed++;
                    if (removed === items.length) {
                        checkLoadNext();
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
            $container.html('');
            isDoingSearch = true;
            $container = null;
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
         * image provided by the container when a new set of results is being loaded
         */
        var setUpLoadingImage = function() {
            if (options.loadingImage) {
                var $loader = $('<img />', {'src': options.loadingImage, 'alt': oaeI18n.translate('__MSG__LOADING__')}).addClass('oae-infinitescroll-loading');
                $loadingContainer.append($loader);
                hideLoadingContainer(false);
                $loadingContainer.insertAfter($container);
            }
        };

        ////////////////////
        // Initialisation //
        ////////////////////

        $container.attr('aria-live', 'assertive');
        setUpLoadingImage();
        loadResultList();
        startInfiniteScrolling();

        return {
            'removeItems': removeItems,
            'kill': kill
        };

    };

})(jQuery);
});
