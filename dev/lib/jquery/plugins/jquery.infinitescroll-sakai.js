(function($) {

    var containerCache = [];

    /**
     * Function that will provide infinite scrolling for lists of items being
     * displayed
     * @param {String} source                If this is a String, it'll be treated as the URL to use for the search action
     *                                       If this is a Function, this will be called to get the lists of results
     * @param {Object} parameters            Parameters to send along for search requests.
     *                                       The 'items' property will be used to determine how many results are loaded per call [optional]
     * @param {Function} render              Render callback function called when the plugin is ready to render the list
     *                                       using a specific template
     * @param {Function} emptyListProcessor  Function used to deal with an empty result list [optional]
     * @param {String} loadingImage          Path to the loading image that should be shown when 
     * @param {Function} postProcessor       Function used to transform the search results before rendering
     *                                       the template [optional]
     * @param {Function} postRenderer        Function executed after the rendered HTML has been appened to the infinite scroll [optional]                         
     * @param {Object} initialContent        Initial content to be added to the list [optional]
     * @param {Function} initialCallback     Function to call with data from initial request [optional]
     * @param {Object} $scrollContainer      Container used for infinite scrolling that is not the document [optional]
     */
    $.fn.infinitescroll = function(source, parameters, render, emptyListProcessor, loadingImage, postProcessor, postRenderer, initialContent, initialCallback, $scrollContainer) {

        parameters = parameters || {};
        // Page number to start listing results from. As this is an infinite scroll,
        // this will always be 0
        parameters.page = 0;
        // Number of items to load per call to the server
        parameters.items = parameters.items || 18;
        var $container = $scrollContainer ? $scrollContainer.children('ul') : $(this);
        var $loadingContainer = $('<div />');

        ////////////////////////
        // Infinite scrolling //
        ////////////////////////

        // Keep track as to whether we're currently fetching a new list of items or not.
        // If we're doing that, we wait until it has finished before fetching the next list.
        var isDoingExtraSearch = false;

        /**
         * Start listening to the window's scroll event and decide when we are close enough to the end of the
         * page before fetching the next set of items
         */
        var startInfiniteScrolling = function() {
            if($scrollContainer) {
                $scrollContainer.scroll(function() {
                    if (!isDoingExtraSearch) {
                        loadNextList();
                    }
                });
            } else {
                $(window).scroll(function() {
                    if (!isDoingExtraSearch) {
                        loadNextList();
                    }
                });
            }
        };

        /**
         * Function that checks whether the current scroll position is within a certain distance
         * of the end of the page. If it is, we load the next set of results
         */
        var loadNextList = function() {
            var threshold = 500;
            var scrollTop = $.browser.msie ? $('html').scrollTop() : $(window).scrollTop();
            var pixelsRemainingUntilBottom = $(document).height() - $(window).height() - scrollTop;
            var $finalContainer = $scrollContainer || $container;
            if ($scrollContainer) {
                threshold = 280;
                scrollTop = $scrollContainer.scrollTop();
                pixelsRemainingUntilBottom = $scrollContainer.children('ul').height() - scrollTop;
            }
            if (pixelsRemainingUntilBottom <= threshold && $finalContainer.is(':visible')) {
                parameters.page++;
                loadResultList();
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
                // If so, we use the string as the selector
                // If not, we assume a jQuery element was passed in
                if (typeof item === 'string') {
                    item = '#' + item;
                }
                $(item, $container).fadeOut(false, function() {
                    $(this).remove();
                    isDoingExtraSearch = false;
                    toFadeOut++;
                    if (toFadeOut === items.length) {
                        parameters.page = 0;
                        loadResultList();
                    }
                });
            });
        };

        /**
         * Function called to prepend items to the list. This will be used when UI caching needs
         * to be used
         * @param {Object} items    Array of items to be prepended
         */
        var prependItems = function(items) {
            processList({
                'results': items
            }, true);
        };

        ////////////////////
        // List rendering //
        ////////////////////

        /**
         * Add a list of items to the current infinite scroll list.
         * @param {Object} data       List of items to add to the infinite scroll list
         * @param {Object} prepend    True when we want to prepend the new items to the list
         *                            False when we want to append the new items to the list
         */
        var renderList = function(data, prepend) {
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
                    if ($('#' + result.id, $container).length === 0) {
                        filteredresults.push(result);
                    }
                }
            });
            data.results = filteredresults;
            // Render the template and put it in the container
            var templateOutput = render(data.results, data.total);
            if ($container) {
                if (prepend) {
                    $container.prepend(templateOutput);
                } else {
                    $container.append(templateOutput);
                }
                if ($.isFunction(postRenderer)) {
                    postRenderer();
                }

                isDoingExtraSearch = false;
                // If there are more results and we're still close to the bottom of the page,
                // do another one
                if (doAnotherOne) {
                    loadNextList();
                } else {
                    isDoingExtraSearch = true;
                    if ($('div:visible', $container).length === 0 && $('li:visible', $container).length === 0) {
                        if ($.isFunction(emptyListProcessor)) {
                            emptyListProcessor();
                        }
                    }
                }
            }
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
         * Retrieve the next set of results from the server
         * @param {Object} initial    Whether or not this is the initial set of results that's being loaded
         */
        var loadResultList = function(initial) {
            isDoingExtraSearch = true;
            showHideLoadingContainer(true);
            // If the source is a function that will load the results for us
            if ($.isFunction(source)) {
                source(parameters, function(success, data) {
                    if (success) {
                        processList(data);
                        if (initial && $.isFunction(initialCallback)) {
                            initialCallback(data);
                        }
                    } else {
                        showHideLoadingContainer(false);
                        debug.log('An error has occured while retrieving the list of results');
                    }
                });
            // Load the results ourselves
            } else {
                $.ajax({
                    'url': source,
                    'data': parameters,
                    'cache': false,
                    'success': function(data) {
                        processList(data);
                        if (initial && $.isFunction(initialCallback)) {
                            initialCallback(data);
                        }
                    },
                    'error': function() {
                        showHideLoadingContainer(false);
                        debug.log('An error has occured while retrieving the list of results');
                    }
                });
            }
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
            isDoingExtraSearch = true;
            $container = null;
        };

        ///////////////////
        // Loading image //
        ///////////////////

        /**
         * Show or hide the loading image
         * @param {Object} show    True when the loading image should be shown
         *                         False when the loading image should be hidden
         */
        var showHideLoadingContainer = function(show) {
            if (show) {
                $loadingContainer.hide().show();
            } else {
                $loadingContainer.hide();
            }
        };

        /**
         * Create a div underneath the infinite scroll list that shows a loading
         * image provided by the container when a new set of results is being loaded
         */
        var setUpLoadingIcon = function() {
            if (loadingImage) {
                $loadingContainer.append($('<img />', {'src': loadingImage}));
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
            var initial = true;
            setUpLoadingIcon();
            if (initialContent && initialContent.length > 0) {
                initial = false;
                processList({
                    'results': initialContent
                });
            }
            loadResultList(initial);
            startInfiniteScrolling();
        };

        loadInitialList();

        return {
            'removeItems': removeItems,
            'prependItems': prependItems,
            'kill': kill
        };

    };

})(jQuery);