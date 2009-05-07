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
package org.sakaiproject.kernel.util;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.File;
import java.io.FileFilter;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Utility class for working on the file system.
 */
public class FileUtil {

  private static final Log LOG = LogFactory.getLog(FileUtil.class);

  /**
   * @param f
   */
  public static void deleteAll(File f) {
    if (f.exists()) {
      if (f.isDirectory()) {
        for (File fc : f.listFiles()) {
          deleteAll(fc);
        }
      }
      if (!f.delete()) {
        LOG.warn("Failed to delete file " + f);
      }
    }
  }

  /**
   * @param string
   * @return
   */
  public static File[] findAll(String file, final String endsWith) {
    List<File> list = new ArrayList<File>();
    File f = new File(file);
    FileFilter ff = new FileFilter() {

      public boolean accept(File pathname) {

        if (pathname.isDirectory()) {
          return true;
        }
        return (pathname.getName().endsWith(endsWith));
      }

    };
    addFile(f, list, ff);
    return list.toArray(new File[0]);
  }

  /**
   * @param f
   * @param list
   * @param ff
   */
  private static void addFile(File f, List<File> list, FileFilter ff) {
    if (f.exists()) {
      if (f.isDirectory()) {
        for (File fn : f.listFiles(ff)) {
          if (fn.isDirectory()) {
            addFile(fn, list, ff);
          } else {
            list.add(fn);
          }
        }
      } else if (ff.accept(f)) {
        list.add(f);
      }
    }
  }

  public static void unpack(InputStream source, File destination) throws IOException {
    ZipInputStream zin = new ZipInputStream(source);
    ZipEntry zipEntry = null;
    FileOutputStream fout = null;
    try {
      byte[] buffer = new byte[4096];
      while ((zipEntry = zin.getNextEntry()) != null) {

        long ts = zipEntry.getTime();
        // the zip entry needs to be a full path from the
        // searchIndexDirectory... hence this is correct

        File f = new File(destination, zipEntry.getName());
        LOG.info("         Unpack " + f.getAbsolutePath());
        f.getParentFile().mkdirs();

        if (!zipEntry.isDirectory()) {
          fout = new FileOutputStream(f);
          int len;
          while ((len = zin.read(buffer)) > 0) {
            fout.write(buffer, 0, len);
          }
          zin.closeEntry();
          fout.close();
        }
        f.setLastModified(ts);
      }
    } finally {
      try {
        fout.close();
      } catch (Exception ex) {
        LOG.warn("Exception closing file output stream", ex);
      }
      try {
        zin.close();
      } catch (Exception ex) {
        LOG.warn("Exception closing file input stream", ex);
      }
    }
  }

}
