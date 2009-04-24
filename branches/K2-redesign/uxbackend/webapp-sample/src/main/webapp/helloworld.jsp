
<%@page import="org.sakaiproject.kernel.api.Kernel"%>
<%@page import="org.sakaiproject.kernel.api.KernelManager"%>
<%@page import="org.sakaiproject.kernel.api.ServiceSpec"%>
<%@page import="org.sakaiproject.componentsample.api.HelloWorldService"%>

<%@page import="java.util.Map.Entry"%>
<html>
<!--
  Copyright 2004 The Apache Software Foundation

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->

<body bgcolor="white">
<h1> Hello JSP  Information </h1>
<font size="4">
<% 
KernelManager km = new KernelManager();
Kernel kernel = km.getKernel();
HelloWorldService  hello = kernel.getServiceManager().getService(new ServiceSpec(HelloWorldService.class));
%>
<p>
From deep within the kernel somewhere the HelloWorldSevice is whispering : <%= hello.getGreeting() %>
</p>
<h3>JCR Sample</h3>
<p>
<dl>
<% for (Entry e : hello.getJCRInfo().entrySet()) { %>
<dt><%= e.getKey() %></dt>
<dd><%= e.getValue() %></dd>
<% } %>
</dl>	
</p>
<h3>JPA Sample</h3>
<p>
<dl>
<% for (Entry e : hello.getJPAInfo().entrySet()) { %>
<dt><%= e.getKey() %></dt>
<dd><%= e.getValue() %></dd>
<% } %>
</dl>
</p>
</font>
</body>
</html>
