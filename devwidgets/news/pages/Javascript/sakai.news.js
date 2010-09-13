var sakai = sakai || {};

sakai.news = function(){
    var box = "";
    var newsPerPage = 8; // The number of messages per page.
    var currentPage = 0;
    var selectedType = "news";
    var cats = "";
    var selectedCategory = "";
    var allNews = []; // Array that will hold all the messages.
    
    var news = "news";
    var newsClass = ".news";
    var newsID = "#news";
    
    var newsTable = newsID + "_table";
    var newsTableTR = newsClass + "_tr";//newsTableMessage
    var newsListContainer = newsID + "_list_container";
    var newsTableTemplate = news + "_" + news + "_template";//inboxTableMessagesTemplate
    
    var newsTitle = newsClass + "_title";
    var newsDetail = newsID + "_detail";
    var newsDetailTitle = newsDetail + "_title";
    var newsDetailBody = newsDetail + "_body";
    var newsDetailContainer = newsDetail + "_container";
    var newsDetailContent = newsDetail + "_content";
    var newsDetailContentTemplate = newsDetailContent + "_template";
    
    
    // Display a specific news
    var displayNews = function(news) {

        if (typeof news !== "undefined") {
            $(newsDetailContent).html($.TemplateRenderer(newsDetailContentTemplate, news));
            $(newsDetailContent).show();
        }

    };
    
    // Display the news list
    var displayList = function(JSON) {
        
        // for (var j = 0, l = JSON.results.length; j < l; j++) {
        //     // temporary internal id.
        //     // Use the name for the id.
        //     JSON.results[j].nr = j;
        //     JSON.results[j].subject = JSON.results[j]["sakai:subject"];
        //     JSON.results[j].body = JSON.results[j]["sakai:body"];
        //     JSON.results[j].messagebox = JSON.results[j]["sakai:messagebox"];
        //     JSON.results[j] = formatMessage(JSON.results[j]);
        // }

        // Show news
        var tplData = {
            "news": JSON.newslist
        };
        
        // remove previous news
        removeAllNewsOutDOM();

        // Add them to the DOM
        $(newsTable).children("tbody").append($.TemplateRenderer(newsTableTemplate, tplData));
        
    };
    
    // Removes all the messages out of the DOM.
    var removeAllNewsOutDOM = function() {
        $(newsTableTR).remove();
    };
    
    // Gets all the news from the JCR.
    var loadNews = function() {

        $.ajax({
            url: "/devwidgets/news/pages/data/sakainews.json",
            type: "GET",
            success: function(data) {
                if (data.newslist) {
                    allNews = data.newslist;
                    displayList(data);
                }
            },
            error: function(xhr, textStatus, thrownError) {
                showGeneralMessage($(inboxGeneralMessagesErrorGeneral).text());
                $(inboxResults).html(sakai.api.Security.saneHTML($(inboxGeneralMessagesErrorGeneral).text()));
            }
        });
    };
    
    var getNewsByID = function(id) {
        for(var i = 0; i < allNews.length; i++) {
            if(allNews[i].id === id){
                return allNews[i];
            }
        }
        return false;
    };
    
    var showContainer = function(type) {
        if(type === "undefine"){return;}
        if(type === "list"){
            $(newsDetailContainer).hide();
            $(newsListContainer).show();
        }
        if(type === "detail"){
            $(newsDetailContainer).show();
            $(newsListContainer).hide();
        }
    };
    
    
    // This function will redirect the user to the login page.
    var redirectToLoginPage = function() {
        document.location = sakai.config.URL.GATEWAY_URL;
    };
    
    ////////////////////
    // Event Handling //
    ////////////////////
    
    // Show a specific news
    $(newsTitle).live("click", function(e){
        showContainer("detail");
        var id = e.target.id;
        displayNews(getNewsByID(id));
    });
    
    // Show news list
    $("#news_detail_backto_news_list").live("click", function(e){
        showContainer("list");
    });
    
    // Init
    var init = function(){
        
        // Check if we are logged in or out.
        var person = sakai.data.me;
        var uuid = person.user.userid;
        if (!uuid || person.user.anon) {
            redirectToLoginPage();
        }else {
            
            loadNews();
            var qs = new Querystring();
            var qs_newsid = qs.get("news");
            if (!qs_newsid) {
                showContainer("list");
            } else {
                showContainer("detail");
                var id = qs_newsid+"";
                displayNews(getNewsByID(qs_newsid));
            }
        }
    };
    init();
};

sakai.api.Widgets.Container.registerForLoad("sakai.news");
