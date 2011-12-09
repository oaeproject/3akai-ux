package org.sakaiproject.ux.tools;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

public class HashRefreshFiles {
  public String configName = "config.properties";
  public HashMap<String, String> props = new HashMap<String, String>();
  public final String BASE_DIR = "basedir";
  public final String HASH_TYPES = "hash_file_types";
  public final String PROCESSING_FILE_TYPES = "need_to_change_file_types";
  public final String IGNORE_FILE_PATHS = "ignore_file_paths";
  public final String REQUIRE_BASE_URL = "require_base_url";
  public final String REQUIRE_PATHS = "require_paths";
  public final String REQUIRE_DEPENDENCY_FILE = "require_dependency_file";
  public final String MANAGE_FOLDERS = "folder_libs";
  
  public Set<String> hashFileTypes = new HashSet<String>();
  public Set<String> ignoreFilePaths = new HashSet<String>();
  public Set<String> processingFileTypes = new HashSet<String>();
  public File rootDir;
  public String requireBaseUrl = ".";
  public Map<String, String> requirePaths = new HashMap<String, String>() ;
  public Map<String, String> hashedResults = new HashMap<String, String>();
  public String requireDependencyFile = "";
  public Set<String> manageFolders = new HashSet<String>();
  
  public final String charSet = "UTF-8";
  
  public void readProperties (String fileName) throws Exception{
    FileInputStream fis = new FileInputStream(new File(fileName));
    BufferedReader reader = new BufferedReader(new InputStreamReader(fis));
    Properties props = new Properties();
    props.load(reader);
    Enumeration<?> names = props.propertyNames();
    if (names != null) {
      while (names.hasMoreElements()) {
        String name = (String)names.nextElement();
        this.props.put(name, props.getProperty(name));
      }
    }
    System.out.println("props: ");
    if (this.props != null && this.props.size() > 0) {
      for (String s : this.props.keySet()) {
        System.out.println(s + " " + this.props.get(s));
      }
    }
    System.out.println("===========================");
    fis.close();
  }
  
  private void putString (String data, String split, Set<String> set) {
    if (data != null && data.length() > 0) {
      String[] names = data.split(split);
      if (names != null && names.length > 0 ) {
        for (String name : names) {
          set.add(name.trim());
        }
      }
    }
  }
  
  public String getCheckSum (File file) throws Exception {
    InputStream is = new FileInputStream (file);
    byte[] buffer = new byte[2048];
    MessageDigest md = MessageDigest.getInstance("MD5");
    int nums;
    while ((nums = is.read()) >= 0) {
      if (nums > 0)
        md.update(buffer, 0, nums);
    }
    is.close();
    BigInteger bi = new BigInteger(1, md.digest());
    return bi.toString(16);
  }
  /**
   *  return the relative path of path2 file in path1 file
   *  for example: path1: /a/b/d/e/t.js, path2: /a/b/c/x.js
   *  return: ../../c/x.js
   * @param path1
   * @param path2
   * @return
   */
  public String getRelativePath (String path1, String path2) { 
    if (path1 == null || path2 == null)
      return null;
    if (path1.equals(path2))
      return null;
    
    String lastDir = "../";
    String result = "";
    String[] allPath1 = path1.split("/");
    String[] allPath2 = path2.split("/");
    int i = 0;
    for ( i = 0; i < allPath1.length - 1; i++) {
      if (i >= allPath2.length - 1 || (!allPath1[i].equals(allPath2[i]))) {
        for (int j = i; j < allPath1.length - 1; j++) {
          result += lastDir;
        }
        break;
      }
    }
    for (int j = i ; j < allPath2.length; j++) {
      result += allPath2[j];
      if (j != allPath2.length - 1)
         result += "/";
    }
    return result;
  }
  
  public String hashFolders (File file) throws Exception{
    if (file == null || ! file.exists())
      return null;
    if (!file.isDirectory())
      return getCheckSum (file);
    File[] files = file.listFiles();
    StringBuilder sb = new StringBuilder("");
    if (files != null && files.length > 0) {
      for (File f : files) {
        String s = hashFolders(f);
        if (s != null)
          sb.append(s);
      }
    }
    MessageDigest md = MessageDigest.getInstance("MD5");
    md.update(sb.toString().getBytes());
    BigInteger bi = new BigInteger(1, md.digest());
    return bi.toString(16);
  }

  public void hashFiles (File file) throws Exception{
    if (!file.exists())
      return;
    if (this.ignoreFilePaths != null && ignoreFilePaths.size() > 0) {
      for (String s : ignoreFilePaths) {
        if (file.getAbsolutePath().toLowerCase().endsWith(s.toLowerCase())) {
          System.out.println("ignored file: " + file.getAbsolutePath());
          return;
        }
      }
    }
    if (file.isDirectory()) {
      if (this.manageFolders != null && manageFolders.size() > 0) {
        for (String s : manageFolders) {
          if (file.getAbsolutePath().toLowerCase().endsWith(s.toLowerCase())) {
            String oldPath = file.getAbsolutePath();
            String newPath = oldPath + "-" + hashFolders(file);
            file.renameTo(new File(newPath));
            oldPath = oldPath.substring(rootDir.getAbsolutePath().length()) + "/";
            newPath = newPath.substring(rootDir.getAbsolutePath().length()) + "/";
            this.hashedResults.put(oldPath, newPath);
            System.out.println("hashed file: {" + oldPath + ", " + newPath + "}");
            return;
          }
        }
      }
    }
    if (file.isDirectory()) {
      File[] files = file.listFiles();
      if (files != null) {
        for ( File f : files) {
          hashFiles(f);
        }
      }
      return;
    }
    
    String fileName = file.getName();
    if (this.hashFileTypes != null && hashFileTypes.size() > 0) {
      boolean isToHash = false;
      for (String suffix : hashFileTypes) {
        if (fileName.toLowerCase().endsWith(suffix.toLowerCase())){
          isToHash = true;
          break;
        }
      }
      if (!isToHash)
        return ;
    }
    String prefix = fileName;
    String suffix = "";
    if (fileName.lastIndexOf('.') > 0) {
      prefix = fileName.substring(0, fileName.lastIndexOf('.'));
      suffix = fileName.substring(fileName.lastIndexOf('.'));
    }
    
    String newName = prefix + "-" + getCheckSum(file) + suffix;
    String path = file.getAbsolutePath();
    String relativePath = path.substring(rootDir.getAbsolutePath().length());
    String newPath = relativePath.substring(0, relativePath.length() - fileName.length()) + newName;
    file.renameTo(new File(path.substring(0, path.length() - fileName.length()) + newName));
    this.hashedResults.put(relativePath, newPath);
    System.out.println("hashed file: {" + relativePath + ", " + newPath + "}");
  }
  
  public String readFile (File file) throws Exception{
    if (file == null || !file.exists() || file.isDirectory())
      return null;
    StringBuffer sb = new StringBuffer("");
    BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(file), charSet));
    char[] buffer = new char[1024];

    int readNum = 0;
    while ((readNum = br.read(buffer)) >= 0) {
      sb.append(buffer, 0, readNum);
    }
    br.close();
    return sb.toString();
  }
  
  public void writeToFile (File file, String text) throws Exception {
    if (file == null || !file.exists() || file.isDirectory())
      return;
    FileOutputStream fos = new FileOutputStream(file);
    fos.write(text.getBytes(charSet));
    fos.close();
  }
  
  public void replaceWithNewPaths(File file) throws Exception{
    if (file == null || !file.exists())
      return;
    if (this.hashedResults == null || this.hashedResults.size() == 0) {
      return;
    }
    if (file.isDirectory()) {
      File[] allFiles = file.listFiles();
      if (allFiles != null && allFiles.length > 0) {
        for (int i = 0; i < allFiles.length; i++)
          replaceWithNewPaths(allFiles[i]);
      }
      return;
    }
    if (this.processingFileTypes != null && this.processingFileTypes.size() > 0) {
      boolean flag = false;
      for (String s : this.processingFileTypes) {
        if (file.getAbsolutePath().endsWith(s)) {
          flag = true;
          break;
        }
      }
      if (!flag)
        return;
    }

    String all = readFile(file);
    StringBuilder sb = new StringBuilder(all);
   
    boolean modifiedFlag = false;
    String filePath = file.getAbsolutePath().substring(rootDir.getAbsolutePath().length());
    for (String s : hashedResults.keySet()) {
      if (sb.indexOf(s) >= 0) {
        int loc = sb.indexOf(s);
        while (loc >= 0) {
          char c = sb.charAt(loc + s.length());
          if ((!s.endsWith("/")) && ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')
             || c == '(')) {
            loc = sb.indexOf(s, loc + s.length());
            continue;
          }
          sb.replace(loc, loc + s.length(), hashedResults.get(s));
          loc = sb.indexOf(s, loc + s.length());
          System.out.println("processing file: " + filePath);
          System.out.println("replace path: {" + s + ", " + hashedResults.get(s) + "}");
          modifiedFlag = true;
        }
        continue;
      }
      String relativePath = this.getRelativePath(filePath, s);
      if (relativePath != null && sb.indexOf(relativePath) >= 0) {
        String newPath = hashedResults.get(s);
        newPath = relativePath.substring(0, relativePath.lastIndexOf("/") + 1) + newPath.substring(newPath.lastIndexOf("/") + 1);
        if (relativePath.equals(newPath))
          continue;
        int loc = sb.indexOf(relativePath);
        while (loc >= 0) {
          char c = sb.charAt(loc + relativePath.length());
          if ((!relativePath.endsWith("/")) && ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')
              || c == '(')) {
            loc = sb.indexOf(relativePath, loc + relativePath.length());
            continue;
          }
          sb.replace(loc, loc + relativePath.length(), newPath);
          loc = sb.indexOf(relativePath, loc + newPath.length());
          System.out.println("processing file: " + filePath);
          System.out.println("replace relative path: {" + relativePath + ", " + newPath + "}");
          modifiedFlag = true;
        }
      }
    }
    if (modifiedFlag)
      writeToFile (file, sb.toString());
  }
  
  public void handleRequireJS () throws Exception{
    if (this.requireDependencyFile == null || this.requireDependencyFile.trim().length() == 0)
      return;
    if (this.hashedResults.containsKey(requireDependencyFile)) {
      this.requireDependencyFile = this.hashedResults.get(requireDependencyFile);
    }
    
    this.requireDependencyFile = props.get(BASE_DIR) + this.requireDependencyFile;
    
    File dFile = new File (requireDependencyFile);
    if (!dFile.exists())
      return;
    if (hashedResults == null || hashedResults.size() == 0)
      return;
   
    String all = readFile(dFile);
    int loc = 0, endloc = 0;
    String newline = "";
    boolean isLibHashed = false;
    if (this.manageFolders != null && this.requireBaseUrl != null) {
      for (String s : manageFolders) {
        if (s.equals(requireBaseUrl)) {
          String newLibPath = this.hashedResults.get(s);
          isLibHashed = true;
          loc = all.indexOf("{baseUrl:");
          endloc = all.indexOf(",", loc) - 1;
          newline = "{baseUrl:";
          newline += "\"" + newLibPath + "\"";
        } else if (requireBaseUrl.startsWith(s)) {
          return;
        }
      }
    }
    if (!isLibHashed) {
      Set<String> keys = hashedResults.keySet();
      for (String key : keys) {
        if (key.startsWith(this.requireBaseUrl)) {
          String newKey = key.substring(this.requireBaseUrl.length() + 1);
          String newValue = hashedResults.get(key).substring(
              this.requireBaseUrl.length() + 1);
          if (newKey.lastIndexOf('.') > 0)
            newKey = newKey.substring(0, newKey.lastIndexOf('.'));
          if (newValue.lastIndexOf('.') > 0)
            newValue = newValue.substring(0, newValue.lastIndexOf('.'));
          if (this.requirePaths.containsKey(newKey)) {
            String v = this.requirePaths.get(newKey);
            this.requirePaths.remove(newKey);
            this.requirePaths.put(newValue, v);
          } else {
            this.requirePaths.put(newValue, newKey);
          }
        }
      }
      if (this.requirePaths == null || this.requirePaths.size() == 0)
        return;
      newline = "paths:{";
      int index = 0;
      for (String key : this.requirePaths.keySet()) {
        newline = newline + "\"" + this.requirePaths.get(key) + "\":\"" + key + "\"";
        index ++;
        if (index < this.requirePaths.size())
          newline += ",";
      }
      newline += "}";
      loc = all.indexOf("require({baseUrl:");
      loc = all.indexOf("paths", loc);
      if (loc < 0)
        return; 
      endloc = all.indexOf("}", loc);
      if (endloc < 0)
        return ;
    }
    
    System.out.println("proceeded require js dependency file: " + requireDependencyFile);
    String oldline = all.substring(loc, endloc + 1);
    all = all.replace(oldline, newline);
    writeToFile (dFile, all);
  }
  
  public void processData () throws Exception{
    readProperties(configName);
    if (props.get(BASE_DIR) == null || props.get(BASE_DIR).trim().length() == 0) {
      return;
    }
    
    putString (props.get(HASH_TYPES), ",", this.hashFileTypes);
    putString (props.get(PROCESSING_FILE_TYPES), ",", this.processingFileTypes);
    putString (props.get(IGNORE_FILE_PATHS), ",", this.ignoreFilePaths);
    putString (props.get(MANAGE_FOLDERS), ",", this.manageFolders);
    
    this.requireBaseUrl = props.get(REQUIRE_BASE_URL);
    this.requireDependencyFile = props.get(REQUIRE_DEPENDENCY_FILE);
    if (this.requireBaseUrl != null && this.requireDependencyFile != null) {
      Set<String> pathKeys = new HashSet<String>();
      putString (props.get(REQUIRE_PATHS), ",", pathKeys);
      if (pathKeys != null && pathKeys.size() > 0) {
        for (String s : pathKeys) {
          if (s.split(":").length == 2)
            this.requirePaths.put(s.split(":")[1].trim(),
                s.split(":")[0].trim());
        }
      }
    }
    rootDir = new File (props.get(BASE_DIR));
    hashFiles (rootDir);
    replaceWithNewPaths(rootDir);
    handleRequireJS();
  }
  
  public static void main (String[] args) throws Exception{
    HashRefreshFiles hrf = new HashRefreshFiles();
    if (args != null && args.length > 0)
      hrf.configName = args[0];
    hrf.processData();
  }
}
