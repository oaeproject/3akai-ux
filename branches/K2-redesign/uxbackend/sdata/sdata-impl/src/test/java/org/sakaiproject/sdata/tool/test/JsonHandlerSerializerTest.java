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

import static org.easymock.EasyMock.anyInt;
import static org.easymock.EasyMock.anyObject;
import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.reset;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import net.sf.json.JSONObject;

import org.easymock.IAnswer;
import org.junit.Test;
import org.sakaiproject.sdata.tool.api.Handler;
import org.sakaiproject.sdata.tool.api.SDataException;
import org.sakaiproject.sdata.tool.json.JsonHandlerSerializer;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 
 */
public class JsonHandlerSerializerTest {


  /**
   * Test method for {@link org.sakaiproject.sdata.tool.json.JsonHandlerSerializer#sendError(org.sakaiproject.sdata.tool.api.Handler, javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse, java.lang.Throwable)}.
   * @throws IOException 
   */
  @Test
  public void testSendError() throws IOException {
    Handler handler = createMock(Handler.class);
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    SDataException sde = new SDataException(403,"testing");
    Exception ex = new Exception("error");
    
    response.reset();
    expectLastCall().once();
    handler.setHandlerHeaders(request, response);
    expectLastCall().once();
    response.sendError(403, "testing");
    expectLastCall().once();
    
    replay(handler,request,response);
    JsonHandlerSerializer jsonHandler = new JsonHandlerSerializer();
    jsonHandler.sendError(handler, request, response, sde);
    verify(handler,request,response);
    
   
    reset(handler,request,response);
    response.reset();
    expectLastCall().once();
    handler.setHandlerHeaders(request, response);
    expectLastCall().once();
    response.sendError(500, "Failed with error");
    expectLastCall().once();

    replay(handler,request,response);
    jsonHandler.sendError(handler, request, response, ex);
    verify(handler,request,response);

  }

  /**
   * Test method for {@link org.sakaiproject.sdata.tool.json.JsonHandlerSerializer#sendMap(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse, java.util.Map)}.
   * @throws IOException 
   */
  @Test
  public void testSendMap() throws IOException {
    Map<String, Object> m = new HashMap<String, Object>();
    m.put("key1", "value1");
    m.put("key2", "value2");
    m.put("key3", "value3");
    m.put("key4", "value4");
    HttpServletRequest request = createMock(HttpServletRequest.class);
    HttpServletResponse response = createMock(HttpServletResponse.class);
    
    response.setHeader((String)anyObject(),(String)anyObject());
    expectLastCall().anyTimes();
    response.setContentType((String)anyObject());
    expectLastCall().atLeastOnce();
    response.setContentLength(anyInt());
    expectLastCall().atLeastOnce();
    final ByteArrayOutputStream baos = new ByteArrayOutputStream();
    final ServletOutputStream out = new ServletOutputStream() {

      @Override
      public void write(int b) throws IOException {
        baos.write(b);
      }
      
    };
    expect(response.getOutputStream()).andAnswer(new IAnswer<ServletOutputStream>() {

      public ServletOutputStream answer() throws Throwable {
        return out;
      }
      
    }).atLeastOnce();
    
    
    replay(request,response);
    JsonHandlerSerializer jsonHandler = new JsonHandlerSerializer();
    jsonHandler.sendMap(request, response, m);
    verify(request,response);
    
    String s = new String(baos.toByteArray(),"UTF-8");
    assertNotNull(s);
    assertTrue(s.length()> 0);
    JSONObject json = JSONObject.fromObject(new String(baos.toByteArray(),"UTF-8"));
    assertEquals("value1", json.get("key1"));
    assertEquals("value2", json.get("key2"));
    assertEquals("value3", json.get("key3"));
  }

}
