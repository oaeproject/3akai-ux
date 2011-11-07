<%@ page session="false" %>
<%
response.setStatus(403);
%><!DOCTYPE HTML>
<html xmlns="http://www.w3.org/1999/xhtml">

    <head>

        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <!-- Sakai 3 R&amp;D - Access denied -->
        <title></title>

        <!-- Sakai Core CSS -->
        <link rel="stylesheet" type="text/css" href="/dev/css/sakai/main.css" />
        <link rel="stylesheet" type="text/css" href="/dev/css/sakai/sakai.corev1.css" />

        <!-- Sakai Error CSS -->
        <link rel="stylesheet" type="text/css" href="/dev/css/sakai/sakai.error.css" />

    </head>

    <body class="fl-centered error403 i18nable">

        <!-- HEADER -->
        <div class="fl-container-flex header s3d-header">
            <div class="s3d-navigation-container">
                <div id="widget_topnavigation" class="widget_inline"></div>
            </div>
            <div class="fl-fix fl-centered fixed-container s3d-fixed-container">
                <div class="s3d-container-shadow-left"><!----></div>
                <div class="s3d-container-shadow-right"><!----></div>
                <div class="s3d-page-header">
                    <div id="widget_institutionalskinning" class="widget_inline"></div>
                </div>
            </div>
        </div>
        <div class="fl-fix fl-centered fixed-container s3d-main-container">
            <div id="error_content">
                <div id="error_content_second_column">
                    <div id="error_sign_in_button">
                        <p class="error_signin_button"><button>__MSG__SIGN_IN__</button></p>
                        <p id="error_sign_up">__MSG__NO_ACCOUNT__ <a class="s3d-regular-links s3d-bold" href="/register">__MSG__SIGN_UP__</a></p>
                    </div>
                    <div class="error_content_second_column_box">
                        <div class="s3d-contentpage-title">__MSG__ARE_YOU_LOOKING_FOR__</div>
                        <div id="error_content_second_column_box_container">
                            <div class="error_content_second_column_box_item_container">
                                <div class="error_content_second_column_box_item_content">
                                    <a class="s3d-regular-links s3d-bold" href="/search#l=content">__MSG__CONTENT__</a>
                                </div>
                            </div>
                            <hr class="s3d-split-line fl-push" />
                            <div class="error_content_second_column_box_item_container">
                                <div class="error_content_second_column_box_item_content">
                                    <a class="s3d-regular-links s3d-bold" href="/search#l=people">__MSG__PEOPLE__</a>
                                </div>
                            </div>
                            <hr class="s3d-split-line fl-push" />
                            <div id="error_second_column_links_template" style="display:none"><!--
                            {for w in worlds}
                                <div class="error_content_second_column_box_item_container">
                                    <div class="error_content_second_column_box_item_content">
                                        <a class="s3d-regular-links s3d-bold" href="/search#l=\${w.id}">\${w.label}</a>
                                    </div>
                                </div>
                                {if !w.last}
                                    <hr class="s3d-split-line fl-push" />
                                {/if}
                            {/for}
                            <div class="error_content_second_column_box_footer"></div>
                            --></div>
                        </div>
                    </div>

                    <div class="error_content_second_column_box browse_cats">
                        <div class="s3d-contentpage-title">__MSG__BROWSE_CATEGORIES__</div>
                        <div id="error_content_second_column_box_browse_container">
                            <div class="error_content_second_column_box_item_container">
                                <div class="error_content_second_column_box_item_content">
                                    <p>__MSG__YOU_CAN_BROWSE_THIS_INSTITUTION__ <a href="/categories"><span class="error_browse_cats"><span id="error_browse_category_number"></span> __MSG__CATEGORIES_LC__</span></a> __MSG__WHERE_YOU_CAN_CONNECT_WITH_PEOPLE_VIEW_COURSE_DETAILS_SEARCH_FOR_CONTENT_AND_JOIN_GROUPS__</p>
                                </div>
                            </div>
                         <div class="error_content_second_column_box_footer">
                            <a href="/categories" id="error_browse_categories_button">
                                <button class="s3d-button s3d-overlay-button">__MSG__BROWSE_CATEGORIES__</button>
                            </a>
                         </div>
                        </div>
                    </div>
                </div>
                <div id="error_content_first_column">
                    <img src="/dev/images/403_sinking.png" alt="__MSG__YOU_ARE_NOT_ALLOWED_TO_SEE_THIS_PAGE__" />
                    <div id="error_content_first_column_content">
                        <h1>__MSG__YOU_ARE_NOT_ALLOWED_TO_SEE_THIS_PAGE__</h1>
                        <h3 class="first">__MSG__YOU_TRIED_TO_ACCESS_PAGE_WITHOUT_PERMISSIONS__</h3>

                        <h3>__MSG__WHAT_TO_DO_NOW_HERE_ARE_SOME_SUGGESTIONS__</h3>
                        <div class="s3d-search-container">
                            <input type="text" tabindex_none="40" id="errorsearch_text" title="__MSG__SEARCH_FOR__" class="s3d-search-inputfield" maxlength="255"/>
                            <button type="button" class="s3d-button s3d-overlay-button s3d-search-button">
                                <img src="/dev/images/search_icon.png" alt="__MSG__SEARCH_FOR__"/>
                            </button>
                        </div>

                        <div id="error_page_links_container"></div>
                        <div id="error_page_links_template" style="display:none"><!--
                            <ul>
                                {for w in links.whatToDo}
                                    <li><a class="s3d-regular-links s3d-bold" href="\${w.url}">\${sakai.api.i18n.getValueForKey(w.title)}</a></li>
                                {/for}
                                <li><a href="{if document.referrer === ""}/{else}\${document.referrer}{/if}" class="s3d-regular-links s3d-bold">__MSG__GO_BACK_BY_USING_YOUR_BROWSER_BACK_BUTTON__</a></li>
                            </ul>

                            {if links.getInTouch && links.getInTouch.length > 0}
                                <h3>__MSG__GET_IN_TOUCH__</h3>
                                <ul>
                                    {for g in links.getInTouch}
                                        <li><a class="s3d-regular-links s3d-bold" href="\${g.url}">\${sakai.api.i18n.getValueForKey(g.title)}</a></li>
                                    {/for}
                                </ul>
                            {/if}
                        --></div>
                    </div>
                </div>
            </div>
        </div>
        <!-- FOOTER WIDGET -->
        <div id="widget_footer" class="widget_inline footercontainer"></div>

        <!-- Dependency JS -->
        <script data-main="/dev/lib/sakai/sakai.dependencies.js" src="/dev/lib/jquery/require.js"></script>

        <!-- 403 JS -->
        <script>require(["/dev/javascript/sakai.403.js"]);</script>
    </body>
</html>
