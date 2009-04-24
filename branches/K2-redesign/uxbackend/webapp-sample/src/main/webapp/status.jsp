<%@page import="org.sakaiproject.kernel.api.Kernel"%>
<%@page import="org.sakaiproject.kernel.api.KernelManager"%>
<%@page import="org.sakaiproject.kernel.api.ServiceSpec"%>
<%@page import="org.sakaiproject.kernel.api.PackageRegistryService"%>
<%@page import="java.util.Map"%>
<%@page import="java.util.Map.Entry"%>
<%@page import="java.io.InputStream"%>
<%@page import="org.sakaiproject.kernel.api.Exporter" %>
<DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" 
  "http://www.w3.org/TR/html4/loose.dtd">

<%@page import="java.util.Collections"%>
<%@page import="java.util.List"%>
<%@page import="java.util.ArrayList"%><html>
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
<title>Classloader Test Page</title>
<body bgcolor="white">
<h1>K2 Exported Packages Information</h1>
<%
  KernelManager km = new KernelManager();
  Kernel kernel = km.getKernel();
  PackageRegistryService packageRegistryService = km
  .getService(PackageRegistryService.class);
  Map<String, String> exports = packageRegistryService.getExports();
  String testclass = request.getParameter("testclass");
  String input = testclass;
  if (testclass == null) {
    testclass = "org.sakaiproject.kernel.api.jcr.support.JCRNodeFactoryService";
  }
%>

<h1>Classloader Test Utility</h1>
<p>Enter the full name of a class form org.sakaiproject.x.y.z and
the utility will try and find the class and the class definition. This
class may be in the current webapp, exported from a component or in one
of the shared classloaders. The utility is intended to allow you to
check the visibility of these classes to a webapp.</p>
<form action="#"><input type="text" maxlength="255" size="100"
	name="testclass" value="<%=testclass%>" /> <input type="submit"
	name="go" value="Find" />
</form>
<h1>Test: Load the Class</h1>
<pre>
<%
  try {
    Class<?> c = this.getClass().getClassLoader().loadClass(testclass);
%> Loaded <%=testclass%> as: 
<%=c%>
<%
  } catch (ClassNotFoundException cnf) {
%>
Class <%=testclass%> was not found.
<%
  }
%>

</pre>

<h1>Test: Find Resource Stream</h1>
<pre>
<%
  String resource = testclass.replace('.', '/') + ".class";
  InputStream in = this.getClass().getClassLoader().getResourceAsStream(
      resource);
  if (in != null) {
%> 
Found Resource Stream for <%=resource%> as : 
<%=in%>
<%
  } else {
%>
No Resource Stream found  for <%=resource%>
<%
  }
%> 
</pre>
<h1>Test:  Exporter</h1>
<%
  Exporter ce = packageRegistryService.findClassloader(testclass);
  String test1Result = "The Class " + testclass + " has not been exported ";
  if (ce != null) {
    test1Result = "The Class " + testclass + " has been exported by \n"
    + ce;
  }
%>
<pre><%=test1Result%></pre>
<h1>Export Details</h1>
<ul>
	<%
	List<String> keys = new ArrayList<String>();
	for ( String k : exports.keySet() ) {
	  keys.add(k);
	}
	Collections.sort(keys);
	for (String k : keys )  {
	%>
	<li><pre>
Key <%=k%>,
Exporter <%=exports.get(k)%> 
</pre></li>
	<%
	  }
	%>
	</ul>
</body>
</html>