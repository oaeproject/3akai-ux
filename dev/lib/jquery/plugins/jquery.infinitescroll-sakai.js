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

        var isDoingExtraSearch = false;

        var startInfiniteScrolling = function(){
            $(window).scroll(function() {
                if (!isDoingExtraSearch){
                    var pixelsRemainingUntilBottom = $(document).height() - $(window).height() - $(window).scrollTop();
                    if (pixelsRemainingUntilBottom < 500){
                        currentPage++;
                        loadResultList();
                    }
                }
            });
        };

        ///////////////////////
        // List manipulation //
        ///////////////////////

        var removeItems = function(items){
            $.each(items, function(i, item){
                $("#" + item, container).fadeOut();
            });
            isDoingExtraSearch = false;
            if ($('div:visible', container).size() === 0){
                if ($.isFunction(emptylistprocessor)){
                    emptylistprocessor();
                };
            }
        };

        var prependItems = function(items){
            processList({
                "results": items
            }, true);
        };

        ////////////////////
        // List rendering //
        ////////////////////

        var renderList = function(data, prepend){
            // Filter out items that are already in the list
            var filteredresults = [];
            $.each(data.results, function(i, result){
                if (result.id){
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
        };

        var processList = function(data, prepend){
            if (data.results.length === 0){
                return false;
            };
            if ($.isFunction(postprocessor)){
                postprocessor(data.results, function(items){
                    data.results = items;
                    renderList(data, prepend);
                });
            } else {
                renderList(data, prepend);
            }
        };

        var loadResultList = function(initial){
            isDoingExtraSearch = true;
            parameters.page = currentPage;
            parameters.items = itemsPerPage;
            $.ajax({
                "url": url,
                "data": parameters,
                "success": function(data){
                    if (initial && data.results.length === 0){
                        if ($.isFunction(emptylistprocessor)){
                            emptylistprocessor();
                        };
                        return false;
                    };
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

        var kill = function(){
            container.html("");
            isDoingExtraSearch = true;
            container = null;
        };

        ////////////////////
        // Initialisation //
        ////////////////////

        var loadInitialList = function(){
            if (initialcontent){
                processList({
                    "results": initialcontent
                });
            }
            loadResultList(true);
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