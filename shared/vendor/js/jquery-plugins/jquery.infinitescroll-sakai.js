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

require(['jquery', 'underscore', 'oae/api/oae.api.i18n', 'oae/api/oae.api.util'], function (jQuery, _, i18nAPI, utilAPI) {
(function($) {

    /**
     * Sakai OAE plugin that will provide infinite scrolling for lists of items being displayed. This plugin will take care of retrieving the
     * list items and deciding when to retrieve the next set of results, as well as the actual appending to the list, showing loading
     * animations, etc.
     * 
     * @param  {String}                            source                          The REST endpoint URL to use for retrieving list data.
     * @param  {Object}                            [parameters]                    Parameters to send along for each list items retrieval ajax request.
     * @param  {Object}                            [parameters.limit]              The number of items to load per ajax request. This will default to 10 if not provided.
     * @param  {String|Element|Function}           render                          jQuery element or selector for that jQuery element that identifies the Trimpath template that should be used to render retrieved results. If a function is provided, this function will be called instead with 2 parameters: the server response containing the retrieved results and the total number of results for the query. The function should return the generated HTML string. 
     * @param  {Object}                            [options]                       Optional object containing additional configuraton options.
     * @param  {String}                            [options.startKey]              The name of the key that should be used to determine the start value for paging purposes. The value of that property on the last loaded element will be used to load the next set of results. By default, 'id' will be used.
     * @param  {String|Element}                    [options.scrollcontainer]       jQuery element or selector for that jQuery element that identifies the container on which the scrollposition should be watched to check when we are close enough to the bottom to load a new set of results. If this is not provided, the document body will be used.
     * @param  {Function}                          [options.emptyListProcessor]    Function that will be executed when the rendered list doesn't have any elements.
     * @param  {Function}                          [options.postProcessor]         Function used to transform the search results before rendering the template. This function will be called with 2 parameters: the list of retrieved items and a callback that should pass in the processed HTML
     * @param  {Function}                          [options.postRenderer]          Function executed after the rendered HTML has been appended to the rendered list. No parameters will be passed into this function
     * @param  {String}                            [options.loadingImage]          Path to the loading image that should be shown when a new set of list items is being loaded
     * @throws {Error}                                                             Error thrown when not all of the required parameters have been provided
     */
    $.fn.infinitescroll = function(source, parameters, render, options) {
        // Parameter validation
        if (!source) {
            throw new Error('A valid source URL should be provided');
        } else if (!render) {
            throw new Error('A valid template name or render function should be provided')
        }

        // Default values
        parameters = parameter || {};
        options = options || {};

        // Number of items to load per call to the server
        parameters.limit = parameters.limit || 10;
        // Default the paging startKey to id
        options.startKey = options.startKey || 'id';
        // Make sure render is a jQuery object if a string has been provided
        if (_.isString(render)) {
            render = $(render);
        }
        // Make sure the scollcontainer is a jQuery element if it's been provided
        if (options.scrollContainer) {
            options.scrollContainer = $(options.scrollContainer);
        }

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
            $.ajax({
                'url': source,
                'data': parameters,
                'success': function(data) {
                    processList(data);
                },
                'error': function() {
                    showHideLoadingContainer(false);
                    console.error('An error has occured while retrieving the list of results');
                }
            });
        };

        /**
         * Run the list of items to be added to a processor before pushing them through
         * a template. The postProcessor will be given an array of items to be added to
         * the infinite scroll. The plugin expects an array of items to come back from
         * the postProcessor as well.
         * @param {Object} data       List of items to add to the infinite scroll list
         * @param {Object} prepend    True when we want to prepend the new items to the list
         *                            False when we want to append the new items to the list
         */
        var processList = function(data, prepend) {
            if (data) {
                data.results = data.results || [];
                if ($.isFunction(postProcessor)) {
                    postProcessor(data.results, function(items) {
                        data.results = items;
                        renderList(data, prepend);
                    });
                } else {
                    renderList(data, prepend);
                }
            }
        };

        /**
         * Add a list of items to the current infinite scroll list.
         * @param {Object} data       List of items to add to the infinite scroll list
         */
        var renderList = function(data) {
            // Filter out items that are already in the list
            var filteredresults = [];

            // Determine if there are more items to load
            var doAnotherOne = data.results.length > 0;
            if (data.items && data.total) {
                var itemsDisplayed = data.items * (parameters.page + 1);
                doAnotherOne = itemsDisplayed < data.total;
            }

            showHideLoadingContainer(false);
            $.each(data.results, function(i, result) {
                if (result.id) {
                    // Determine whether this item is already in the list
                    // by looking for an element with the same id
                    if (!$('*[id="' + result.id + '"]', $container).length) {
                        filteredresults.push(result);
                    }
                } else if (result.target) {
                    if (!$('*[id="' + result.target + '"]', $container).length) {
                        filteredresults.push(result);
                    }
                }
            });
            data.results = filteredresults;
            // Render the template and put it in the container
            var templateOutput = render(data.results, data.total);
            if ($container) {
                $container.append(templateOutput);
                if ($.isFunction(postRenderer)) {
                    postRenderer();
                }

                isDoingSearch = false;
                // If there are more results and we're still close to the bottom of the page,
                // do another one
                if (doAnotherOne) {
                    lastItem = data.results[data.results.length - 1];
                    loadNextList();
                } else {
                    isDoingSearch = true;
                    if ($('div:visible', $container).length === 0 && $('li:visible', $container).length === 0) {
                        if ($.isFunction(emptyListProcessor)) {
                            emptyListProcessor();
                        }
                    }
                }
            }
        };

        ///////////////////////
        // List manipulation //
        ///////////////////////

        /**
         * Function called when items are removed from the list. This will fade the items out and
         * hide them.
         * @param {Object} items    Array of jQuery elements or array of strings of ids that need to be removed. 
         *                          For the latter case, each of these string should correspond with a Dom element 
         *                          that has this string as an id.
         */
        var removeItems = function(items) {
            var toFadeOut = 0;
            $.each(items, function(i, item) {
                // Check whether the item is a string
                // If so, we will create the jQuery selector
                // If not, we assume a jQuery element was passed & will set the context to the container
                var $item;
                if (typeof item === 'string') {
                    $item = $('*[id="' + item + '"]', $container);
                } else {
                    $item = $(item, $container);
                }
                $item.fadeOut(false, function() {
                    $(this).remove();
                    isDoingSearch = false;
                    toFadeOut++;
                    if (toFadeOut === items.length) {
                        loadResultList();
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
        var setUpLoadingIcon = function() {
            var loadingText = i18nAPI.translate('__MSG__LOADING__');
            if (loadingImage) {
                $loadingContainer.append($('<img />', {'src': loadingImage, 'alt': loadingText}));
                $loadingContainer.css({'margin-top': '15px', 'text-align': 'center'});
                showHideLoadingContainer(false);
                $loadingContainer.insertAfter($container);
            }
        };

        ////////////////////
        // Initialisation //
        ////////////////////

        /**
         * Get the initial list of items to add to the list
         */
        var loadInitialList = function() {
            $container.attr('aria-live', 'assertive');
            var initial = true;
            setUpLoadingIcon();
            //if (initialContent && initialContent.length > 0) {
            //    initial = false;
            //    processList({
            //        'results': initialContent
            //    });
            //}
            loadResultList(initial);
            startInfiniteScrolling();
        };

        loadInitialList();

        return {
            'removeItems': removeItems,
            'kill': kill
        };

    };

})(jQuery);
});