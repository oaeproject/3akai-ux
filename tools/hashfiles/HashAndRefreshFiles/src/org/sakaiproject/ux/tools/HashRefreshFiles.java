package org.sakaiproject.ux.tools;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
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
  public String BASE_DIR = "basedir";
  public String HASH_TYPES = "hash_file_types";
  public String PROCESSING_FILE_TYPES = "need_to_change_file_types";
  public String IGNORE_FILE_PATHS = "ignore_file_paths";
  public String REQUIRE_BASE_URL = "require_base_url";
  public String REQUIRE_PATHS = "require_paths";
  public String REQUIRE_DEPENDENCY_FILE = "require_dependency_file";
  
  public Set<String> hashFileTypes = new HashSet<String>();
  public Set<String> ignoreFilePaths = new HashSet<String>();
  public Set<String> processingFileTypes = new HashSet<String>();
  public File rootDir;
  public String requireBaseUrl = ".";
  public Map<String, String> requirePaths = new HashMap<String, String>() ;
  public Map<String, String> hashedResults = new HashMap<String, String>();
  public String requireDependencyFile = "";
  
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
  
  public void hashFiles (File file, String rootPath) throws Exception{
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
      File[] files = file.listFiles();
      if (files != null) {
        for ( File f : files) {
          hashFiles(f, rootPath);
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
    String relativePath = path.substring(rootPath.length());
    String newPath = relativePath.substring(0, relativePath.length() - fileName.length()) + newName;
    file.renameTo(new File(path.substring(0, path.length() - fileName.length()) + newName));
    this.hashedResults.put(relativePath, newPath);
    System.out.println("hashed file: {" + relativePath + ", " + newPath + "}");
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
    FileInputStream input = new FileInputStream(file);
    StringBuffer sb = new StringBuffer("");
    int ch;
    while ((ch = input.read()) >= 0){
      sb.append((char)ch);
    }
    input.close();
    String all = sb.toString();
    for (String s : hashedResults.keySet()) {
      if (all.contains(s)) {
        System.out.println("processing file: " + file.getAbsolutePath());
        System.out.println("replace path: {" + s + ", " + hashedResults.get(s) + "}");
        all = all.replaceAll(s, hashedResults.get(s));
      }
    }
    BufferedWriter bw = new BufferedWriter (new FileWriter (file));
    bw.write(all);
    bw.close();
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
    
    if (hashedResults != null && hashedResults.size() > 0) {
      Set<String> keys = hashedResults.keySet();
      if (keys != null && keys.size() > 0) {
        for (String key : keys) {
          if (key.startsWith(this.requireBaseUrl)) {
            String newKey = key.substring(this.requireBaseUrl.length());
            String newValue = hashedResults.get(key).substring(this.requireBaseUrl.length());
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
      }
    }
    if (this.requirePaths == null || this.requirePaths.size() == 0)
      return;
    String newline = "paths:{";
    int index = 0;
    for (String key : this.requirePaths.keySet()) {
      newline = newline + "\"" + this.requirePaths.get(key) + "\":\"" + key + "\"";
      index ++;
      if (index < this.requirePaths.size())
        newline += ",";
    }
    newline += "}";
    System.out.println("proceeded require js dependency file: " + requireDependencyFile);
    FileInputStream input = new FileInputStream(dFile);
    StringBuffer sb = new StringBuffer("");
    int ch;
    while ((ch = input.read()) >= 0){
      sb.append((char)ch);
    }
    input.close();
    String all = sb.toString();
    int loc = all.indexOf("require({baseUrl:");
    loc = all.indexOf("paths", loc);
    if (loc < 0)
      return; 
    int endloc = all.indexOf("}", loc);
    if (endloc < 0)
      return ;
    String oldline = all.substring(loc, endloc + 1);
    all = all.replace(oldline, newline);
    BufferedWriter bw = new BufferedWriter (new FileWriter (dFile));
    bw.write(all);
    bw.close();
  }
  
  public void processData () throws Exception{
    readProperties(configName);
    if (props.get(BASE_DIR) == null || props.get(BASE_DIR).trim().length() == 0) {
      return;
    }
    
    putString (props.get(HASH_TYPES), ",", this.hashFileTypes);
    putString (props.get(PROCESSING_FILE_TYPES), ",", this.processingFileTypes);
    putString (props.get(IGNORE_FILE_PATHS), ",", this.ignoreFilePaths);
    
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
    hashFiles (rootDir, rootDir.getAbsolutePath());
    replaceWithNewPaths(rootDir);
    handleRequireJS();
  }
  
  public static void main (String[] args) throws Exception{
    HashRefreshFiles hrf = new HashRefreshFiles();
    hrf.processData();
  }
  
}
