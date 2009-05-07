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
package org.sakaiproject.kernel.jcr.jackrabbit.search.wordnet;

import com.google.common.collect.Sets;

import edu.emory.mathcs.backport.java.util.Arrays;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.jackrabbit.core.fs.FileSystemException;
import org.apache.jackrabbit.core.fs.FileSystemResource;
import org.apache.jackrabbit.core.fs.local.LocalFileSystem;
import org.apache.jackrabbit.core.query.lucene.SynonymProvider;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.Hits;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.wordnet.Syns2Index;
import org.sakaiproject.kernel.util.FileUtil;
import org.sakaiproject.kernel.util.ResourceLoader;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Set;

/**
 *
 */
public class WordnetSynonymProvider implements SynonymProvider {

  private static final Log LOG = LogFactory.getLog(WordnetSynonymProvider.class);
  private static final String WORDNET_INDEX_ZIP = "res://wordnet/wordnetindex.zip";
  private IndexSearcher syns;

  /**
   * {@inheritDoc}
   *
   * @see org.apache.jackrabbit.core.query.lucene.SynonymProvider#getSynonyms(java.lang.String)
   */
  public String[] getSynonyms(String term) {
    try {
      Hits hits = syns.search(new TermQuery(new Term(Syns2Index.F_WORD, term)));
      Set<String> words = Sets.newHashSet();
      for (int i = 0; i < hits.length(); i++) {
        Document doc = hits.doc(i);
        String[] values = doc.getValues(Syns2Index.F_SYN);
        for (int j = 0; j < values.length; j++) {
          words.add(values[j]);
        }
      }
      LOG.info("Expanded to "+Arrays.toString(words.toArray()));
      return words.toArray(new String[0]);
    } catch (IOException e) {
      LOG.warn("Wordnet Synonym Expansion failed " + e.getMessage());
      return new String[] { term };
    }
  }

  /**
   * {@inheritDoc}
   *
   * @see org.apache.jackrabbit.core.query.lucene.SynonymProvider#initialize(org.apache.jackrabbit.core.fs.FileSystemResource)
   */
  public void initialize(FileSystemResource fsr) throws IOException {

    try {
      if (fsr == null) {
        throw new IOException("WordnetSynonymProvider requires a path configuration");
      }
      LocalFileSystem fs = (LocalFileSystem) fsr.getFileSystem();

      File f = new File(fs.getPath(),fsr.getPath());

      File index = new File(f, "index");

      if (!index.exists()) {
        unpackWordnetIndex(index);
        if (!index.exists()) {
          throw new IOException("Failed to create the synonyms index ");
        }
      }
      FSDirectory directory = FSDirectory.getDirectory(index);
      syns = new IndexSearcher(directory);
    } catch (RuntimeException e) {
      throw e;
    } catch (IOException e) {
      throw e;
    } catch (Throwable e) {
      throw new IOException(e.getMessage());
    }
  }

  /**
   * @param destination
   * @throws IOException
   * @throws FileSystemException
   */
  private void unpackWordnetIndex(File destination) throws IOException, FileSystemException {
    InputStream in = ResourceLoader.openResource(WORDNET_INDEX_ZIP, this.getClass()
        .getClassLoader());
    FileUtil.unpack(in, destination);

  }

}
