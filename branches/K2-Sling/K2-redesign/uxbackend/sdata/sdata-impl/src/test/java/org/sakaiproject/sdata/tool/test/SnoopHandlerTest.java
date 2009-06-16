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
package org.sakaiproject.sdata.tool.test;


import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.reset;
import static org.easymock.EasyMock.verify;

import org.easymock.IAnswer;
import org.junit.Test;
import org.sakaiproject.sdata.tool.SnoopHandler;

import java.io.IOException;
import java.util.Enumeration;
import java.util.Vector;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
/**
 * 
 */
public class SnoopHandlerTest {


  @Test
  public void testHandler() throws ServletException, IOException {
   HttpServletRequest request = createMock(HttpServletRequest.class);
   HttpServletResponse response = createMock(HttpServletResponse.class);
   
   SnoopHandler handler = new SnoopHandler();
   
   generateCallSequence("DELETE",request,response);
   handler.doDelete(request, response);
   verify(request,response);
   generateCallSequence("GET",request,response);
   handler.doGet(request, response);
   verify(request,response);
   generateCallSequence("HEAD",request,response);
   handler.doHead(request, response);
   verify(request,response);
   generateCallSequence("POST",request,response);
   handler.doPost(request, response);
   verify(request,response);
   generateCallSequence("PUT",request,response);
   handler.doPut(request, response);   
   verify(request,response);
    
    
  }

  /**
   * @param string
   * @param request
   * @param response
   */
  private void generateCallSequence(String method, HttpServletRequest request,
      HttpServletResponse response) {
    reset(request,response);
    expect(request.getPathInfo()).andReturn("/path/info.txt");
    expect(request.getMethod()).andReturn(method);
    expect(request.getHeaderNames()).andAnswer(new IAnswer<Enumeration<String>>(){

     public Enumeration<String> answer() throws Throwable {
       Vector<String> v = new Vector<String>();
       v.add("content-type");
       v.add("content-length");
       return v.elements();
     }
      
    });
    expect(request.getHeader("content-type")).andReturn("text/plain");
    expect(request.getHeader("content-length")).andReturn("100");

    expect(request.getParameterNames()).andAnswer(new IAnswer<Enumeration<String>>(){

      public Enumeration<String> answer() throws Throwable {
        Vector<String> v = new Vector<String>();
        v.add("v");
        v.add("t");
        return v.elements();
      }
       
     });
     expect(request.getParameter("v")).andReturn("v parameter");
     expect(request.getParameter("t")).andReturn("t parameter");
     expect(request.getParameter("doc")).andReturn("t parameter").anyTimes();

     expect(request.getCookies()).andAnswer(new IAnswer<Cookie[]>(){

       public Cookie[] answer() throws Throwable {
         Cookie[] c = new Cookie[2];
         c[0] = new Cookie("test1","test value 1");
         c[1] = new Cookie("test2","test value 2");
         return c;
       }
        
      }).times(2);
     
     expect(request.getAttributeNames()).andAnswer(new IAnswer<Enumeration<String>>(){

       public Enumeration<String> answer() throws Throwable {
         Vector<String> v = new Vector<String>();
         v.add("v");
         v.add("t");
         return v.elements();
       }
        
      });
     expect(request.getAttribute("v")).andReturn("v attribute");
     expect(request.getAttribute("t")).andReturn("t attribute");
     expect(request.getSession()).andReturn(null);
     expect(request.getRemoteUser()).andReturn("user");
   

     
    replay(request,response);
    
  }
  

}
