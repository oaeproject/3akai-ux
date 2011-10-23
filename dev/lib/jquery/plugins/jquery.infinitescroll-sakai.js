(function($) {

    var containerCache = [];

    /**
     * Function that will provide infinite scrolling for lists of items being
     * displayed
     * @param {Object} url                 Search URL to use
     * @param {Object} parameters          Parameters to send along for search requests
     * @param {Object} template            Id of the template that needs to be used for rendering the list
     * @param {Object} template            Global sakai object with all api functions
     * @param {Object} emptylistprocessor  Function used to deal with an empty result list [optional]
     * @param {Object} postprocessor       Function used to transform the search results before rendering
     *                                     the template [optional]
     * @param {Object} initialcontent      Initial content to be added to the list
     */
    $.fn.infinitescroll = function(url, parameters, template, sakai, emptylistprocessor, postprocessor, initialcontent){

        var currentPage = 0;
        var itemsPerPage = 18;
        var container = $(this);

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
        var startInfiniteScrolling = function(){
            $(window).scroll(function() {
                if (!isDoingExtraSearch){
                    loadNextList();
                }
            });
        };

        /**
         * Function that checks whether the current scroll position is within a certain distance
         * of the end of the page. If it is, we load the next set of results
         */
        var loadNextList = function(){
            var pixelsRemainingUntilBottom = $(document).height() - $(window).height() - $(window).scrollTop();
            if (pixelsRemainingUntilBottom < 500){
                currentPage++;
                loadResultList();
            }
        };

        ///////////////////////
        // List manipulation //
        ///////////////////////

        /**
         * Function called when items are removed from the list. This will fade the items out and
         * hide them.
         * @param {Object} items    Array of strings that need to be removed. Each of these string should
         *                          correspond with a Dom element that has this string as an id.
         */
        var removeItems = function(items){
            $.each(items, function(i, item){
                $("#" + item, container).fadeOut(false, function(){
                    isDoingExtraSearch = false;
                });
            });
            currentPage = 0;
            loadResultList();
        };

        /**
         * Function called to prepend items to the list. This will be used when UI caching needs
         * to be used
         * @param {Object} items    Array of items to be prepended
         */
        var prependItems = function(items){
            processList({
                "results": items
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
        var renderList = function(data, prepend){
            // Filter out items that are already in the list
            var filteredresults = [];
            var doAnotherOne = data.results.length > 0;
            $.each(data.results, function(i, result){
                if (result.id){
                    // Determine whether this item is already in the list
                    // by looking for an element with the same id
                    if ($("#" + result.id, container).size() === 0){
                        filteredresults.push(result);
                    }
                }
            });
            data.results = filteredresults;
            // Render the template and put it in the container
            var templateOutput = sakai.api.Util.TemplateRenderer(template, {
                "items": data.results,
                "sakai": sakai
            });
            if (prepend){
                container.prepend(templateOutput);
            } else {
                container.append(templateOutput);
            }
            isDoingExtraSearch = false;
            // If there are more results and we're still close to the bottom of the page,
            // do another one
            if (doAnotherOne) {
                loadNextList();
            } else {
                if ($('div:visible', container).size() === 0) {
                    if ($.isFunction(emptylistprocessor)) {
                        emptylistprocessor();
                    };
                };
            }
        };

        /**
         * Run the list of items to be added to a processor before pushing them through
         * a template
         * @param {Object} data       List of items to add to the infinite scroll list
         * @param {Object} prepend    True when we want to prepend the new items to the list
         *                            False when we want to append the new items to the list
         */
        var processList = function(data, prepend){
            if ($.isFunction(postprocessor)){
                postprocessor(data.results, function(items){
                    data.results = items;
                    renderList(data, prepend);
                });
            } else {
                renderList(data, prepend);
            }
        };

        /**
         * Retrieve the next set of results from the server
         * @param {Object} initial    Whether or not this is the initial set of results that's being loaded
         */
        var loadResultList = function(initial){
            isDoingExtraSearch = true;
            parameters.page = currentPage;
            parameters.items = itemsPerPage;
            $.ajax({
                "url": url,
                "data": parameters,
                "success": function(data){
                    processList(data);
                },
                "error": function(){
                    debug.log("An error has occured while retrieving the list of results");
                }
            });
        };

        ////////////////////////////
        // Kill infinite scroller //
        ////////////////////////////

        /**
         * Kill an instance of an infinite scroll object. This means the object
         * will no longer respond to any events or functions
         */
        var kill = function(){
            container.html("");
            isDoingExtraSearch = true;
            container = null;
        };

        ////////////////////
        // Initialisation //
        ////////////////////

        /**
         * Get the initial list of items to add to the list
         */
        var loadInitialList = function(){
            var initial = true;
            if (initialcontent && initialcontent.length > 0){
                initial = false;
                processList({
                    "results": initialcontent
                });
            }
            loadResultList(initial);
            startInfiniteScrolling();
        };

        loadInitialList();

        return {
            "removeItems": removeItems,
            "prependItems": prependItems,
            "kill": kill
        }

    };

})(jQuery);