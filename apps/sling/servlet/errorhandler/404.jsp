<%
  response.setStatus(404);
%><!DOCTYPE HTML>
<html xmlns="http://www.w3.org/1999/xhtml">

    <head>

        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title></title>

        <!-- Sakai Core CSS -->
        <link rel="stylesheet" type="text/css" href="/dev/css/FSS/fss-base.css" />
        <link rel="stylesheet" type="text/css" href="/dev/css/sakai/sakai.base.css" />
        <link rel="stylesheet" type="text/css" href="/dev/css/sakai/sakai.core.2.css" />
        <link rel="stylesheet" type="text/css" href="/dev/css/sakai/sakai.3.css" />

        <!-- Sakai Error CSS -->
        <link rel="stylesheet" type="text/css" href="/dev/css/sakai/sakai.error.css" />

        <!-- Sakai Page CSS -->
        <link rel="stylesheet" type="text/css" href="/dev/css/sakai/sakai.index.css" />

        <!-- 3rd party CSS -->

        <!-- Sakai Config JS -->
        <script type="text/javascript" src="/dev/configuration/widgets.js"></script>
        <script type="text/javascript" src="/var/widgets.json?callback=sakai.storeWidgets"></script>
        <script type="text/javascript" src="/dev/configuration/config.js"></script>
        <script type="text/javascript" src="/dev/configuration/config_custom.js"></script>

        <!-- Core 3rd-party JS -->
        <script type="text/javascript" src="/dev/lib/jquery/jquery.js"></script>
        <script type="text/javascript" src="/dev/lib/jquery/jquery-ui.full.js"></script>
        <script type="text/javascript" src="/dev/lib/fluid/3akai_Infusion.js"></script>
        <script type="text/javascript" src="/dev/lib/misc/l10n/globalization.js"></script>
        <script type="text/javascript" src="/dev/lib/jquery/plugins/jquery.json.js"></script>
        <script type="text/javascript" src="/dev/lib/misc/google/html-sanitizer-minified.js"></script>

        <!-- Sakai Core JS -->
        <script type="text/javascript" src="/dev/lib/sakai/sakai.api.core.js"></script>
        <script type="text/javascript" src="/dev/lib/sakai/sakai.api.util.js"></script>
        <script type="text/javascript" src="/dev/lib/sakai/sakai.api.i18n.js"></script>
        <script type="text/javascript" src="/dev/lib/sakai/sakai.api.l10n.js"></script>
        <script type="text/javascript" src="/dev/lib/sakai/sakai.api.user.js"></script>
        <script type="text/javascript" src="/dev/lib/sakai/sakai.api.widgets.js"></script>

        <!-- 3rd party JS -->
        <script type="text/javascript" src="/dev/lib/misc/trimpath.template.js"></script>
        <script type="text/javascript" src="/dev/lib/misc/querystring.js"></script>
        <script type="text/javascript" src="/dev/lib/jquery/plugins/jqmodal.sakai-edited.js"></script>
        <script type="text/javascript" src="/dev/lib/jquery/plugins/jquery.cookie.js"></script>
        <script type="text/javascript" src="/dev/lib/jquery/plugins/jquery.pager.js"></script>

        <!-- 404 JS -->
        <script type="text/javascript" src="/dev/javascript/sakai.404.js"></script>

    </head>

    <body class="fl-centered index i18nable">

        <!-- TOP BANNER -->
        <div id="top_banner"><!-- --></div>

        <div class="index-container fl-centered page_not_found_error"><span style="display:none;"><br /></span>
            <div id="page_not_found_error_logged_out_template" style="display:none;"><!--
                <div class="header-title">
                    <img src="/dev/images/sakai_logo_index.png" alt="__MSG__INSTANCE_NAME__" />
                </div>

                <div class="header-byline">
                    __MSG__HEADER_BYLINE__
                </div>

                <div class="login-box">
                    <div id="page_not_found_error">
                        <div class="preview-box">
                            <span id="error_title">The page you requested was not found.</span>
                            <p>
                                You may have clicked a broken link or mistyped the web address (some url addresses are case sensitive). It's also possible you don't have permission to access this page.
                            </p>
                            You can
                            <ul>
                                <li>
                                    Verify the link in the address bar
                                </li>
                                <li>
                                    Go back to the previous page by clicking the back button in your browser
                                </li>
                                <li>
                                	Try to contact the page administrator to request access permissions if you think you should have
                                </li>
                            </ul>
                            <p>
                                If you continue to receive this error, the page may have been moved or no longer exists.
                            </p>
                        </div>
                        <div class="login-container">
                            <button class="s3d-button s3d-button-primary" type="submit"><span class="s3d-button-inner">Sign In</span></button>
                            <p>
                                If you have an account, you may wish to sign in to search available pages.
                            </p>
                        </div>
                    </div>
                </div>
            --></div>
            <div id="page_not_found_error_logged_in_template" style="display:none;"><!--
                <div id="widget_topnavigation" class="widget_inline">
                </div>
                <div class="fl-container-flex header">
                    <div class="fl-fix fl-centered fixed-container">
                        <div class="decor">
                        </div>
                        <div id="page_not_found_error">
                            <div class="preview-box">
                                <span id="error_title">The page you requested was not found.</span>
                                <p>
                                    You may have clicked a broken link or mistyped the web address (some url addresses are case sensitive). It's also possible you don't have permission to access this page.
                                </p>
                                You can
                                <ul>
                                    <li>
                                        Verify the link in the address bar
                                    </li>
                                    <li>
                                        Go back to the previous page by clicking the back button in your browser
                                    </li>
                                    <li>
                                	    Try to contact the page administrator to request access permissions if you think you should have
                                    </li>
                                </ul>
                                <p>
                                    If you continue to receive this error, the page may have been moved or no longer exists.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="widget_footer" class="widget_inline footercontainer"></div>

                <div id="widget_chat" class="widget_inline"></div>
            --></div>
        </div>
    </body>
</html>