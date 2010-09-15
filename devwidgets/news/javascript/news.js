
/**
 * @name sakai.news
 *
 * @class news
 *
 * @description
 * List the news in this widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.news = function(tuid, showSettings){
    var $newsList = $("#news_list");
    var $newsListError = $("#news_list_error");
    var $newsListTemplate = $("#news_list_template");
    var $newTitle = $(".news_title");
    var maxTextNumber = 27;
    
    // limite the text number of each title of news
    var newsTitleShowLimite = function(){
      $(".news_title").each(function () {
          if ($(this).text().length > maxTextNumber) {
            $(this).text($(this).text().substring(0, maxTextNumber));
            $(this).text($(this).text() + "...");
            }
          });
    }
    
    $(".news_add_link").live("click", function(e){
        $("#createnews_container").jqmShow();
    });
    
    var loadData = function(){
        $.ajax({
            url: "/devwidgets/news/data/news.json",
            type: "GET",
            success: function(data){
                $newsList.html($.TemplateRenderer($newsListTemplate, data));
                $newsList.show();
                newsTitleShowLimite();
            },
            error: function(){
                $newsListError.show();
            }
        });
    };
    
    $("#create_news").live("click", function(ev){
        // $("#creategroupcontainer").show();
        // Load the creategroup widget.
        // sakai.createnews.initialise();
        $("#createnews_container").jqmShow();
    });
    
    var init = function(){
      loadData();    
    };
     
    init();
};

sakai.api.Widgets.widgetLoader.informOnLoad("news");