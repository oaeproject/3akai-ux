var theme = 'standard';

function setPortfolioCSS(theme) {
	ss = $("link[@rel*=style][@title]:first").attr("href");
	$("link[@rel*=style][@title]").each(function() {
		this.disabled = true;
		if (this.getAttribute("title") == theme) {
			this.disabled = false;
			ss = this.href;        
		}
	});
	return ss;
}

$(document).ready(function () {
	theme = /[&?]theme=([^&+]*)/.exec(document.location.search);
	if (theme && theme.length > 0)
		theme = theme[1];
	else
		theme = 'standard';
	if (portfolioMode == null || portfolioMode == 'view')
	    ss = setPortfolioCSS(theme);

	activatePage('#' + $("div.portfolio_page_content:first").attr("id"));
	$("#primary_nav_list a, #secondary_nav_list a").click(function () {
		if (portfolioMode == null || portfolioMode == 'view')
			activatePage($(this).attr("href"));
		return false;
	});
});

function hideAllPages() {
	$("#primary_nav_list a").removeClass("active");
	$("div.portfolio_page_content").addClass("hidden_block");
	$("#portfolio_secondary_navigation").addClass("hidden_block");
}

function activatePage(href) {
	hideAllPages();
	topLink = href;
	if ($(href).removeClass("hidden_block").hasClass("examplePage")) {
		$("#portfolio_secondary_navigation").removeClass("hidden_block");
		$("#secondary_nav_list li").removeClass("active");
		$("#secondary_nav_list a[@href='" + href + "']").parents("li").addClass("active");
		topLink = $("#secondary_nav_list a:first").attr("href");
	}
	$("#primary_nav_list a[@href='" + topLink + "']").addClass("active");
}
