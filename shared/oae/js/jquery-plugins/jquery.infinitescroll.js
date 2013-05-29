/*!
 * Copyright 2013 Sakai Foundation (SF) Licensed under the
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
     * OAE plugin that will provide infinite scrolling for lists of items being displayed. This plugin will take care of retrieving the
     * list items and deciding when to retrieve the next set of results, as well as the actual appending to the list, showing loading
     * animations, etc.
     *
     * The template used to render the result should put each item into its own `li` tag, and should have a `data-id` attribute containing
     * the item's id and a `data-key` attribute containing the value that should be used as the start value for paging.
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
     * @param  {Function}                          [options.postRenderer]          Function executed after the rendered HTML has been appended to the rendered list. The full retrieved server response will be passed into this function.
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
        var $container = options.scrollContainer ? options.scrollContainer : $(this);

        // Variable that keeps track of whether or not the initial search has happened, as the initial
        // search does not need to provide a paging parameter
        var initialSearchDone = false;

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
            // We only check if a new set of results should be loaded if a search
            // is not in progress and if the container has not been killed
            if (!isDoingSearch && $container) {
                // In case we use the body
                var threshold = 500;
                var pixelsRemainingUntilBottom = $(document).height() - $(window).height() - $(window).scrollTop();
                // In case we use a scroll container
                if (options.scrollContainer) {
                    threshold = 200;
                    pixelsRemainingUntilBottom = options.scrollContainer.prop('scrollHeight') - options.scrollContainer.height() - options.scrollContainer.scrollTop();
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
            var $lastElement = $container.children('li').filter(':visible').filter(':last');
            // Only page once the initial search has been done
            if ($lastElement.length !== 0 && initialSearchDone === true) {
                parameters.start = $lastElement.attr('data-key') ? $lastElement.attr('data-key') : ($lastElement.index() + 1);
            }

            // Get the data from the server
            $.ajax({
                'url': source,
                'data': parameters,
                'success': function(data) {
                    initialSearchDone = true;
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
         * a template. The postProcessor will be given an array of items to be added to
         * the infinite scroll. The plugin expects an array of items to come back from
         * the postProcessor as well.
         *
         * @param  {Object}      data         List of items to add to the infinite scroll list
         * @param  {Boolean}     [prepend]    `true` when we want to prepend the new items to the list, `false` when we want to append the new items to the list
         */
        var processList = function(data, prepend) {
            if (options.postProcessor) {
                data = options.postProcessor(data);
            }
            renderList(data, prepend);
        };

        /**
         * Add a list of items to the current infinite scroll list. We expect the list of items
         * to be wrapped in a `results` object, and have an `id` parameter for each of the results.
         * Results that are already in the list will not be re-rendered.
         *
         * @param  {Object}     data         Post-processed server response
         * @param  {Boolean}    [prepend]    true when we want to prepend the new items to the list, false when we want to append the new items to the list
         */
        var renderList = function(data, prepend) {
            // Determine if we should attempt to load a next page
            var canFetchMore = (data.results.length === parameters.limit) || prepend;

            // Check if the infinite scroll instance still exists. It's possible that
            // the instance was killed in between the time that a request was fired and
            // the response was received. If that's the cause, there's nothing else we
            // need to do
            if ($container) {

                // Render the template and put it in the container
                hideLoadingContainer();
                var templateOutput = '';
                if (_.isFunction(render)) {
                    templateOutput = render(data.results);
                } else {
                    templateOutput = oaeUtil.template().render(render, data);
                }

                // Filter out items that are already in the list. When appending results, we
                // skip the new results that already have an element with the same data-id attribute
                // in the list. When prepending results, we always add the new ones and remove the existing
                // elements with the same data-id attribute
                var $tmp = $('<div>').html(templateOutput);
                $tmp.children().each(function(index, newListItem) {
                    var id = $(newListItem).attr('data-id');
                    var $existing = $('li[data-id="' + id + '"]', $container);
                    if (id) {
                        if (prepend) {
                            $existing.remove();
                        } else if ($existing.length > 0) {
                            $(newListItem).remove();
                        }
                    }
                });

                // Bring the filtered html back to templateOutput
                templateOutput = $tmp.html();

                if (prepend) {
                    // Prepend the HTML
                    $container.prepend(templateOutput);
                } else {
                    $container.append(templateOutput);
                }

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
                    if ($('li', $container).length === 0) {
                        if (options.emptyListProcessor) {
                            options.emptyListProcessor();
                        }
                    }
                }
            }
        };

        /**
         * Prepend some initial content to the infinite scroll list if initial content or an
         * initial content function has been provided.
         */
        var setUpInitialContent = function() {
            if (options.initialContent) {
                if (_.isFunction(options.initialContent)) {
                    $container.prepend(options.initialContent());
                } else {
                    $container.prepend(options.initialContent);
                }
            }
        };

        ///////////////////////
        // List manipulation //
        ///////////////////////

        /**
         * Function called to prepend items to the list. This will be used when UI caching needs
         * to be used
         *
         * @param  {Object}       items       Array of items to be prepended
         */
        var prependItems = function(items) {
            processList({
                'results': items
            }, true);
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
            $loadingContainer.remove();
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
         * animation when a new set of results is being loaded
         */
        var setUpLoadingImage = function() {
            // Create the loading animation element
            var $loader = $('<i />').addClass('icon-spinner icon-spin');
            // Create a text element that will be used for accessibility purposes
            var $a11yHelper = $('<span />').text(oaeI18n.translate('__MSG__LOADING__')).addClass('oae-aural-text');
            // Add the accessibility helper to the loading animation and add the loading
            // animation to the loader container
            $loader.append($a11yHelper);
            $loadingContainer.append($loader);
            $loadingContainer.insertAfter($container);
        };

        ////////////////////
        // Initialisation //
        ////////////////////

        $container.attr('aria-live', 'assertive');
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
