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

package org.sakaiproject.resteasy;

import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.ext.MessageBodyWriter;
import javax.ws.rs.ext.Provider;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.annotation.Annotation;
import java.lang.reflect.Type;

/**
 * Provides a means to send {@link InputStream}s to the servlet response's
 * {@link OutputStream}. RestEasy includes a provider for inputstreams, but its
 * type checking is either broken or so severe that it's unusable.
 */
@Provider
@Produces("*/*")
public class InputStreamProvider implements MessageBodyWriter<InputStream> {
  /**
   * {@inheritDoc}
   *
   * @see javax.ws.rs.ext.MessageBodyWriter#isWriteable(java.lang.Class,
   *      java.lang.reflect.Type, java.lang.annotation.Annotation[],
   *      javax.ws.rs.core.MediaType)
   */
  public boolean isWriteable(Class<?> type, Type genericType,
      Annotation[] annotations, MediaType mediaType) {
    return InputStream.class.isAssignableFrom(type);
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.ws.rs.ext.MessageBodyWriter#getSize(java.lang.Object,
   *      java.lang.Class, java.lang.reflect.Type,
   *      java.lang.annotation.Annotation[], javax.ws.rs.core.MediaType)
   */
  public long getSize(InputStream inputStream, Class<?> type, Type genericType,
      Annotation[] annotations, MediaType mediaType) {
    return -1;
  }

  /**
   * {@inheritDoc}
   *
   * @see javax.ws.rs.ext.MessageBodyWriter#writeTo(java.lang.Object,
   *      java.lang.Class, java.lang.reflect.Type,
   *      java.lang.annotation.Annotation[], javax.ws.rs.core.MediaType,
   *      javax.ws.rs.core.MultivaluedMap, java.io.OutputStream)
   */
  public void writeTo(InputStream is, Class<?> type, Type genericType,
      Annotation[] annotations, MediaType mediaType,
      MultivaluedMap<String, Object> headers, OutputStream os)
      throws IOException {
    int c;
    while ((c = is.read()) != -1) {
      os.write(c);
    }
  }
}
