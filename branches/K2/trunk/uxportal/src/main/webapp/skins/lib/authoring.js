var fckInstance = false;
var floatToolbar = false;
var menuWidth = false;
var contentMargin = false;
var shrinkit = null;

var panelId = '';

var formAction = null;

function switchStyle(theme) {
    $("link[@rel*=style][@title]").each(function() {
        this.disabled = true;
        ss = this.href;
        //ss = ss.replace(theme + ".css", theme + "_edit.css");
        if (this.getAttribute("title") == theme) {
            this.disabled = false;
            //$("#portfolio_footer").load(ss);
            if (fckInstance) {
                var div = $("#portfolio_toolbar").get(0);
                if (floatToolbar) {
                div.style.position = "fixed";
                div.style.top = "0";
                div.style.left = "0";
                div.style.right = "0";
            }
            else {
                div.style.position = "static";
                div.style.top = "auto";
                div.style.left = "auto";
                div.style.right = "auto";
            }
            //fckInstance.Config['CustomConfigurationsPath'] = "./lib/fck_files/config.js";		
            //fckInstance.Config['SkinPath'] = 'lib/fckeditor/editor/skins/default/';
            fckInstance.Config['AutoGrowMax'] = 4000;			
            fckInstance.Config['EditorAreaCSS'] = [ss];
            fckInstance.Config['ToolbarComboPreviewCSS'] = [ss];
            fckInstance.ToolbarSet.Load(fckInstance.ToolbarSet.Name);
            fckInstance.UpdateLinkedField();
            fckInstance.StartEditor();
            }
        }
    });
}

function setPanelSize() {
    if (panelId != '')
        setMainFrameHeight(panelId);
}

function fitSize() {
    //fckInstance.Commands.GetCommand('FitContent').Execute();
    setPanelSize();
}

function originalSize() {
    //fckInstance.Commands.GetCommand('OriginalSize').Execute();
    setPanelSize();
}

function switchModes() {
	$(".portfolio_page_content").toggleClass('examplePage').toggleClass('portfolioPage');
	activatePage('#' + $("div.portfolio_page_content:first").attr("id"));
}

function viewPortfolio() {
    theme = $("#theme option:selected").val();
    top.location.port
    top.document.location = top.location.protocol + '//' + top.location.host + "/portfolio.html?theme=" + theme;
}

function checkAutoSave() {
	//totally disable everything autosave related
}

function FCKeditor_OnComplete(instance) {
	fckInstance = instance;
	updateStyle();
	$("#floater").click(function() {
		floatToolbar = !floatToolbar;
		updateStyle();
	});
	$("div.act input").click(function(evt) { formAction = evt; shrinkit.expandNav(); return true; });
    setPanelSize();
}

function updateStyle() {
    switchStyle($("#theme option:selected").val());
}

function blockNavigation(evt) {
	if (formAction == null) {
		//if (fckInstance && fckInstance.IsDirty()) {
			//return "You have unsaved changes to your page. Navigating away now may cause you to lose work.";
		//}
		//else {
			return "When editing pages, you should always use the Save and Cancel buttons at the bottom of the page.  If you navigate away with other links or the Back button, you may encounter an error.";
		//}
	}
}

function setupMenuHover() {
	var container = $(top.document.body).find("#portalContainer #container");
	menu = container.find("#toolMenuWrap").get(0);
	content = container.find("#content").get(0);
	//alert(menu.size());
	//alert(content.size());
	//menuWidth = "9.6em";
	//contentMargin = "11em";
	
	function shrinker(m, c) {
		this.menu = m;
		this.content = c;
		this.menuWidth = this.menu.style.width;
		this.contentMargin = this.content.style.marginLeft;
		
		this.hidden = (this.menu.style.display == "none");

		this.logo = $(m).find("#worksiteLogo").get(0);
		//this.logoWidth = this.logo.style.width;
		this.toolmenu = $(m).find("#toolMenu").get(0);
		//this.toolmenuWidth = this.toolmenu.style.width;
		this.presencewrap = $(m).find("#presenceWrapper").get(0);
		//this.presencewrapWidth = this.presencewrap.style.width;
		this.presenceframe = $(m).find("#presenceIframe").get(0);
		//this.presenceframeWidth = this.presenceframe.style.width;
		this.titlewrap = $(c).find(".portletTitleWrap").get(0);		

		var me = this;
		this.shrinkNav = function () {
			//me.menu.style.width = "8px";
			me.menu.style.display = "none";
			me.logo.style.display = "none";
			me.toolmenu.style.display = "none";
			me.presencewrap.style.display = "none";
			me.presenceframe.style.display = "none";
			me.titlewrap.style.display = "none";
			//me.content.style.marginLeft = "10px";
			me.content.style.marginLeft = "0";
			me.content.style.marginTop = "0";
			//me.logo.style.width = "8px";
			//me.toolmenu.style.width = "1px";
			//me.presencewrap.style.width = "4px";
			//me.presenceframe.style.width = "8px";
			me.hidden = true;
		}
		this.expandNav = function() {
			//me.menu.style.width = me.menuWidth;
			me.menu.style.display = "block";
			me.logo.style.display = "block";
			me.toolmenu.style.display = "block";
			me.presencewrap.style.display = "block";
			me.presenceframe.style.display = "block";
			me.titlewrap.style.display = "block";
			//me.content.style.marginLeft = contentMargin;
			me.content.style.marginLeft = "";
			me.content.style.marginTop = "";
			//me.logo.style.width = me.logoWidth;
			//me.toolmenu.style.width = me.toolmenuWidth;
			//me.presencewrap.style.width = me.presencewrapWidth;
			//me.presenceframe.style.width = me.presenceframeWidth;	
			me.hidden = false;		
		}
		this.toggle = function() {
			if (me.hidden)
				me.expandNav();
			else
				me.shrinkNav();
		}
	}
	shrinkit = new shrinker(menu, content);
		
	//$(menu).hover(callback.expandNav, callback.shrinkNav);
	$("#hider").click(shrinkit.toggle);
}

$(document).ready(function() {
    formPanelId = $("#panelId").text();
    if (formPanelId && formPanelId != '')
        panelId = formPanelId;

	$("link[@rel*=style][@title]").each(function() {
		$("#theme").append('<option value="' + this.getAttribute("title") + '">' + this.getAttribute("title") + '</option>');
	});
	$("#theme option:first").attr('selected', 'selected');


	setupMenuHover();
	$("#theme").change(function() { updateStyle(); });
	$("#fitSizer").click(function() { fitSize(); });
	$("#smallSizer").click(function() { originalSize(); });
	$("#modeSwitcher").click(function() { switchModes(); });
	$("#portfolioViewer").click(function() { viewPortfolio(); });
	updateStyle();

});

