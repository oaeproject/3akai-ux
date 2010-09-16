var sakai = sakai || {};

sakai.news = function(){
    var allNews = [];
    var news = "news";
    var newsClass = ".news";
    var newsID = "#news";
    
    var newsTable = newsID + "_table";
    var newsTableTR = newsClass + "_tr";
    var newsListContainer = newsID + "_list_container";
    var newsTableTemplate = news + "_" + news + "_template";
    
    var newsTitle = newsClass + "_title";
    var newsDetail = newsID + "_detail";
    var newsDetailTitle = newsDetail + "_title";
    var newsDetailBody = newsDetail + "_body";
    var newsDetailContainer = newsDetail + "_container";
    var newsDetailContent = newsDetail + "_content";
    var newsDetailContentTemplate = newsDetailContent + "_template";
    
    var newsOperation = newsClass + "_operation";
    var newsOperationIconEdit = newsOperation + "_icon_edit";//newsOperationIconEdit
    var newsOperationIconDelete = newsOperation + "_icon_delete";//newsOperationIconDelete
    
    ///////////////////////////
    // Load and display news //
    ///////////////////////////
    
    // Gets a specific news from the JCR and display
    var loadNewsByID = function(newsid) {
        $.ajax({
            url: "/devwidgets/news/pages/data/onenews.json",
            type: "GET",
            success: function(data) {
                $(newsDetailContent).html($.TemplateRenderer(newsDetailContentTemplate, data));
                $(newsDetailContent).show();
            },
            error: function(xhr, textStatus, thrownError) {
                showGeneralMessage($(inboxGeneralMessagesErrorGeneral).text());
                $(inboxResults).html(sakai.api.Security.saneHTML($(inboxGeneralMessagesErrorGeneral).text()));
            }
        });
    };
    
    // Gets all the news from the JCR.
    var loadNewsList = function() {

        $.ajax({
            url: "/devwidgets/news/pages/data/sakainews.json",
            type: "GET",
            success: function(data) {
                if (data.newslist) {
                    initPager(data.newslist);
                    allNews = data.newslist;
                }
            },
            error: function(xhr, textStatus, thrownError) {
                showGeneralMessage($(inboxGeneralMessagesErrorGeneral).text());
                $(inboxResults).html(sakai.api.Security.saneHTML($(inboxGeneralMessagesErrorGeneral).text()));
            }
        });
    };
    
    /////////////////
    // Delete news //
    /////////////////
    var deleteNews = function(newsid){
        $.ajax({
            url: "/devwidgets/news/pages/data/onenews.json",
            type: "POST",
            data: {
                "action": "delete",
                "id": newsid
            },
            success: function(data) {
            },
            error: function(xhr, textStatus, thrownError) {
                alert("Cann't delete the news!");
            }
        });
    };
    
    var newsOperationAction = function(){
        $(newsTableTR).live("mouseover", function(e){
           $(this).children(newsOperation).children(newsOperationIconEdit).show();
           $(this).children(newsOperation).children(newsOperationIconDelete).show();
         })
         $(newsTableTR).live("mouseout", function(e){
           $(this).children(newsOperation).children(newsOperationIconEdit).hide();
           $(this).children(newsOperation).children(newsOperationIconDelete).hide();
         })
    }
    
    // Switch to the list or a specific news
    var showContainer = function(type) {
        if(type === "undefined"){return;}
        if(type === "list"){
            $(newsDetailContainer).hide();
            $(newsListContainer).show();
            newsOperationAction();
        }else if(type === "detail"){
            $(newsDetailContainer).show();
            $(newsListContainer).hide();
        }
    };
    
    // This function will redirect the user to the login page.
    var redirectToLoginPage = function() {
        document.location = sakai.config.URL.GATEWAY_URL;
    };
    
    var getIDByTitle = function(title){
        for(var i = 0; i < allNews.length ; i++){
            if(allNews[i].title === title){
                return allNews[i].id;
            }
        }
    };
    
    ////////////////////
    // Event Handling //
    ////////////////////
    //add the edit and delete icon
    
    //edit a news
    $(".news_operation_icon_edit").live("click", function(ev){
        // $("#creategroupcontainer").show();
        // Load the creategroup widget.
        // sakai.createnews.initialise();
      $("#createnews_container").jqmShow();
      
      $("#createnews_add_cancel1").show(); 
      $("#createnews_add_save1").show();     
        
      $.ajax({
          url: "/devwidgets/news/pages/data/onenews.json",
          type: "GET",
          success: function(data) {
              $("#createnews_add_title").val(data.title);
              $("#createnews_add_content").val(data.body);
          },
          error: function(xhr, textStatus, thrownError) {
              alert("error");
          }
      });
        
    });
    
    //add a news
    $("#create_news_link").live("click", function(ev){
        // $("#creategroupcontainer").show();
        // Load the creategroup widget.
        // sakai.createnews.initialise();
        $("#createnews_container").jqmShow();
        
        $("#createnews_add_title").val("");
        $("#createnews_add_content").val("");
        
    });
    
    // Show a specific news
    $(newsTitle).live("click", function(e){
        showContainer("detail");
        var id = getIDByTitle(e.target.text);
        loadNewsByID(id);
    });
    
    // Show news list
    $("#news_detail_backto_news_list").live("click", function(e){
        showContainer("list");
    });
    
    // Delete a news
    $(".news_operation_icon_delete").live("click", function(){
        $(this).parent().parent().remove();
        var title = $(this).parent().siblings("#news_title_td").children()[0].text;
        var id = getIDByTitle(title);
        deleteNews(id);
    });
    
    //////////////////////////////////////////////
    // Fluid Pager and News List Initialization //
    //////////////////////////////////////////////
    var initPager = function (userTable) {
        var options = {
            dataModel: userTable,
            columnDefs: "explode",
            bodyRenderer: {
              type: "fluid.pager.selfRender",
              options: {
                selectors: {
                    root: "#body-template"
                },
                row: "row:"
              }
            },
            pagerBar: {type: "fluid.pager.pagerBar", options: {
              pageList: {type: "fluid.pager.renderedPageList",
                options: { 
                  linkBody: "a"
                }
              }
            }}
        };
        
        fluid.pager("#news_pager", options);
    };
    
    // Initialization
    var init = function(){
        
        // Check if we are logged in or out.
        var person = sakai.data.me;
        var uuid = person.user.userid;
        if (!uuid || person.user.anon) {
            redirectToLoginPage();
        }else {
            loadNewsList();
            var qs = new Querystring();
            var newsid = qs.get("news");
            if (newsid) {
                showContainer("detail");
                loadNewsByID(newsid);
            } else {
                showContainer("list");
            }
        }
    };
    init();
};


sakai.api.Widgets.Container.registerForLoad("sakai.news");