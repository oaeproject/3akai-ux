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
package org.sakaiproject.kernel.jcr.jackrabbit.journal;

import org.apache.jackrabbit.core.NodeId;
import org.apache.jackrabbit.core.PropertyId;
import org.apache.jackrabbit.core.journal.AbstractJournal;
import org.apache.jackrabbit.core.journal.AppendRecord;
import org.apache.jackrabbit.core.journal.JournalException;
import org.apache.jackrabbit.core.nodetype.NodeTypeDef;
import org.apache.jackrabbit.spi.Name;
import org.apache.jackrabbit.spi.Path;
import org.apache.jackrabbit.spi.Path.Element;

/**
 * The Append Record tracks writes to the record that needs adding to the journal.
 */
public class SakaiAppendRecord extends AppendRecord {

  private boolean hasdata;



  /**
   * @param journal
   * @param producerId
   */
  public SakaiAppendRecord(AbstractJournal journal, String producerId) {
    super(journal, producerId);
    hasdata = false;

  }

  /**
   * @return
   */
  public boolean hasData() {
    return hasdata;
  }

  /**
   * {@inheritDoc}
   * @see org.apache.jackrabbit.core.journal.AppendRecord#write(byte[])
   */
  @Override
  public void write(byte[] b) throws JournalException {
    hasdata = true;
    super.write(b);
  }

  /**
   * {@inheritDoc}
   * @see org.apache.jackrabbit.core.journal.AppendRecord#writeBoolean(boolean)
   */
  @Override
  public void writeBoolean(boolean b) throws JournalException {
    hasdata = true;
    super.writeBoolean(b);
  }

  /**
   * {@inheritDoc}
   * @see org.apache.jackrabbit.core.journal.AppendRecord#writeByte(int)
   */
  @Override
  public void writeByte(int n) throws JournalException {
    hasdata = true;
    super.writeByte(n);
  }

  /**
   * {@inheritDoc}
   * @see org.apache.jackrabbit.core.journal.AppendRecord#writeChar(char)
   */
  @Override
  public void writeChar(char c) throws JournalException {
    if ( c != '\0') {
      hasdata = true;
    }
    super.writeChar(c);
  }
   /**
   * {@inheritDoc}
   * @see org.apache.jackrabbit.core.journal.AppendRecord#writeInt(int)
   */
  @Override
  public void writeInt(int n) throws JournalException {
    hasdata = true;
    super.writeInt(n);
  }

  /**
   * {@inheritDoc}
   * @see org.apache.jackrabbit.core.journal.AbstractRecord#writeNodeId(org.apache.jackrabbit.core.NodeId)
   */
  @Override
  public void writeNodeId(NodeId nodeId) throws JournalException {
    hasdata = true;
    super.writeNodeId(nodeId);
  }

  /**
   * {@inheritDoc}
   * @see org.apache.jackrabbit.core.journal.AbstractRecord#writeNodeTypeDef(org.apache.jackrabbit.core.nodetype.NodeTypeDef)
   */
  @Override
  public void writeNodeTypeDef(NodeTypeDef ntd) throws JournalException {
    hasdata = true;
    super.writeNodeTypeDef(ntd);
  }

  /**
   * {@inheritDoc}
   * @see org.apache.jackrabbit.core.journal.AbstractRecord#writePath(org.apache.jackrabbit.spi.Path)
   */
  @Override
  public void writePath(Path path) throws JournalException {
    hasdata = true;
    super.writePath(path);
  }

  /**
   * {@inheritDoc}
   * @see org.apache.jackrabbit.core.journal.AbstractRecord#writePathElement(org.apache.jackrabbit.spi.Path.Element)
   */
  @Override
  public void writePathElement(Element element) throws JournalException {
    hasdata = true;
    super.writePathElement(element);
  }

  /**
   * {@inheritDoc}
   * @see org.apache.jackrabbit.core.journal.AbstractRecord#writePropertyId(org.apache.jackrabbit.core.PropertyId)
   */
  @Override
  public void writePropertyId(PropertyId propertyId) throws JournalException {
    hasdata = true;
    super.writePropertyId(propertyId);
  }

  /**
   * {@inheritDoc}
   * @see org.apache.jackrabbit.core.journal.AbstractRecord#writeQName(org.apache.jackrabbit.spi.Name)
   */
  @Override
  public void writeQName(Name name) throws JournalException {
    hasdata = true;
    super.writeQName(name);
  }

  /**
   * {@inheritDoc}
   * @see org.apache.jackrabbit.core.journal.AppendRecord#writeString(java.lang.String)
   */
  @Override
  public void writeString(String s) throws JournalException {
    // ignore this as there is always another write if the data represents a record
    super.writeString(s);
  }
  /**
   * {@inheritDoc}
   * @see org.apache.jackrabbit.core.journal.AppendRecord#update()
   */
  @Override
  public void update() throws JournalException {
    if (!hasData()) {
      cancelUpdate();
      return;
    }
    super.update();
  }

}
