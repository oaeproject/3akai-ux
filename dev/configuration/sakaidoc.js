/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
define(function(){
    var sakaidocConfig = {};
    sakaidocConfig.defaultContent = "<p class='MsoNormal'></p><p class='MsoNormal'><b><span style='font-size:18.0pt;font-family:Helvetica;mso-bidi-font-family:Helvetica;color:#666666;letter-spacing:-.2pt;mso-font-kerning:.5pt' lang='EN-US'>New Sakai Document</span></b>" + 
        "<p class='MsoNormal'><span style='font-size:13.0pt;font-family:Helvetica;mso-bidi-font-family:Helvetica;color:#999999;letter-spacing:-.2pt;mso-font-kerning:.5pt' lang='EN-US'>A collaborative document to share and publish</span></p>" + 
        "<p class='MsoNormal'><b><span style='font-family: Helvetica; color: rgb(51, 51, 51);' lang='EN-US'>What is a Sakai Document?</span></b></p>" + 
        "<p class='MsoNormal'><span style='font-family:Helvetica;mso-bidi-font-family:Helvetica;color:#333333' lang='EN-US'>It's like a MS Word document where you can enter and add text and content only better<br></span></p>" +
        "<p class='MsoNormal'><span style='font-family:Helvetica;mso-bidi-font-family:Helvetica;color:#333333' lang='EN-US'>A Sakai document can have a range of other content added into it, such as; widgets, videos, links, uploaded files, lists of other documents and content from around the system or from &quot;My library&quot;<br></span></p>" +
        "<p class='MsoNormal'><span style='font-family:Helvetica;mso-bidi-font-family:Helvetica;color:#333333' lang='EN-US'>Revision history gives you an indication of when and what other collaborators have done with it over time and allow you to recover previous versions<br></span></p>" +
        "<p class='MsoNormal'><span style='font-family:Helvetica;mso-bidi-font-family:Helvetica;color:#333333' lang='EN-US'>Comments at the bottom of a Sakai document starts to make collaborating on individual documents very useful for shared work<br><br></span></p>" +
        "<p class='MsoNormal'><b><span style='font-family: Helvetica; color: rgb(51, 51, 51);' lang='EN-US'>FAQ:</span></b></p>" +
        "<p class='MsoNormal'><span style='font-family: Helvetica; color: rgb(51, 51, 51);' lang='EN-US'>Q: <b>What's the difference between a Sakai Document and a MS Word file?</b><br>A: A Sakai Document is editable within the system and can be restored through the many versions it goes through as collaborators work on it. " + 
        "A MS Word document uploaded to the system can't be edited and must be downloaded to work on, uploads by multiple collaborators can be tracked by the revision history feature, but isn't truly a collaborative document as someone has to keep cutting and pasting content into one, current MS Word document<br style=''></span></p>" +
        "<p class='MsoNormal'><span style='font-family:Helvetica;mso-bidi-font-family:Helvetica;color:#333333;mso-bidi-font-weight:bold' lang='EN-US'>Q: <b>Can a Sakai Document be a page within my course or group?</b><br>A: Yes, in face if you are the manager of a course or group you can add a page" +
        " and select &quot;Sakai Document&quot; as the page type, and the best thing is you can create multiple pages within a Sakai document and those pages will appear in your course or group as sub-pages to the Sakai Document you've created<br></span><span style='font-family:Helvetica;mso-bidi-font-family:Helvetica;color:#333333' lang='EN-US'></span></p>" +
        "<p class='MsoNormal'><span style='font-family:Helvetica;mso-bidi-font-family:Helvetica;color:#333333;mso-bidi-font-weight:bold' lang='EN-US'>Q: <b>Can I make a private Sakai Document for only myself and a selected list of other co-collaborators? </b><br> A: Yes, top right of the page there is a &quot;Settings&quot; drop down (Cog icon)," +
        "select, &quot;Permissions&quot; and choose &quot;Can be discovered by: Selected people and groups&quot;, then add these people to the &quot;Can see or edit&quot; list in the same prompt window. You can also set the same permission as you create a new Sakai Document from scratch, just look for the &quot;Permissions&quot; link</span><span style='font-family:Helvetica;mso-bidi-font-family:Helvetica;color:#333333' lang='EN-US'></span></p>" +
        "<p><span style='font-family:Helvetica;mso-bidi-font-family:Helvetica;color:#333333;mso-bidi-font-weight:bold' lang='EN-US'></span><span style='font-family:Helvetica;mso-bidi-font-family:Helvetica;color:#333333' lang='EN-US'></span></p>" +
        "<p><img src='/dev/images/sakaidoc_default.png' alt='' height='151' width='289'></p>";
    return sakaidocConfig;
});
