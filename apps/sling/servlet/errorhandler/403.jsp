<%
  response.setStatus(403);
%><!DOCTYPE HTML>
<html xmlns="http://www.w3.org/1999/xhtml">

    <head>

        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <!-- Sakai 3 R&amp;D - Access denied -->
        <title></title>

        <!-- Sakai Core CSS -->
        <link rel="stylesheet" type="text/css" href="/dev/css/sakai/main.css" />

        <!-- Sakai Error CSS -->
        <link rel="stylesheet" type="text/css" href="/dev/css/sakai/sakai.error.css" />

        <!-- Sakai Page CSS -->
        <link rel="stylesheet" type="text/css" href="/dev/css/sakai/sakai.index.css" />

    </head>

    <body class="fl-centered error403 i18nable">

        <!-- TOP BANNER -->
        <div id="top_banner"><!-- --></div>

        <div id="widget_topnavigation" class="widget_inline"></div>

        <div class="index-container fl-centered permissions_error"><span style="display:none;"><br /></span>
            <div id="permission_error_logged_out_template" style="display:none;"><!--

                <div class="index-container fl-centered">

                <div id="widget_login" class="widget_inline"></div>


                <div class="login-box fl-container">
                    <div class="login-box-top">
                    </div>
                    <div class="login-box-content">
                        <div class="preview-box fl-left">

                            <div class="header-title">
                                <p class="sakai_logo_index"></p>
                            </div>

                            <div class="header-byline">
                                __MSG__HEADER_BYLINE__
                            </div>


                            <div id="page_not_found_error">
                                <div class="preview-box">
                                    <span id="error_title">__MSG__YOU_DONT_HAVE_PERMISSION_TO_VIEW_REQUESTED_PAGE__</span>
                                    <p>
                                        __MSG__YOU_TRIED_TO_ACCESS_PAGE_WITHOUT_PERMISSIONS__
                                    </p>
                                    __MSG__YOU_CAN__
                                    <ul>
                                        <li>
                                            __MSG__SIGN_INTO_SAKAI_ACCOUNT_WITH_CORRECT_PERMISSIONS__
                                        </li>
                                        <li>
                                            __MSG__TRY_TO_CONTACT_PAGE_ADMIN_REQUEST_ACCESS__
                                        </li>
                                    </ul>
                                </div>
                                <div class="login-container">
                                    <div id="widget_login" class="widget_inline"></div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div class="login-box-bottom">
                    </div>
                </div>
                <div id="widget_footer" class="widget_inline footercontainer"></div>

                --></div>
                <div id="permission_error_logged_in_template" style="display:none;"><!--
                </div>
                <div class="fl-container-flex header s3d-header">
                    <div class="fl-fix fl-centered fixed-container s3d-fixed-container">
                        <div class="s3d-decor">
                        </div>
                        <div id="permission_error">
                            <span id="error_title">__MSG__YOU_DONT_HAVE_PERMISSION_TO_VIEW_REQUESTED_PAGE__</span>
                            <p>
                                __MSG__YOU_TRIED_TO_ACCESS_PAGE_WITHOUT_PERMISSIONS__
                            </p>
                            __MSG__YOU_CAN__
                            <ul>
                                <li>
                                    __MSG__TRY_TO_CONTACT_PAGE_ADMIN_REQUEST_ACCESS__
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div id="widget_footer" class="widget_inline footercontainer"></div>

                <div id="widget_chat" class="widget_inline"></div>
                --></div>
        </div>

        <!-- Dependency JS -->
        <script data-main="/dev/lib/sakai/sakai.dependencies.js" src="/dev/lib/jquery/require-jquery.js"></script>

        <!-- 403 JS -->
        <script>require(["/dev/javascript/sakai.403.js"]);</script>
    </body>
</html>
