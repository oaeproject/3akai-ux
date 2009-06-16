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

package org.sakaiproject.kernel.api.jcr;

import javax.jcr.Session;

/**
 * This Interface defines some of the item names that are defined in the jcr spec 1.0,
 * using the default prefixes 'jcr', 'nt' and 'mix'. Please note that those prefixes can
 * by redefined by an application using the
 * {@link Session#setNamespacePrefix(String, String)} method. As a result, the constants
 * may not refer to the respective items.
 */
public interface JCRConstants {
  /**
   * jcr:autoCreated
   */
  String JCR_AUTOCREATED = "jcr:autoCreated";
  /**
   * jcr:baseVersion
   */
  String JCR_BASEVERSION = "jcr:baseVersion";
  /**
   * jcr:child
   */
  String JCR_CHILD = "jcr:child";
  /**
   * jcr:childNodeDefinition
   */
  String JCR_CHILDNODEDEFINITION = "jcr:childNodeDefinition";
  /**
   * jcr:content
   */
  String JCR_CONTENT = "jcr:content";
  /**
   * jcr:created
   */
  String JCR_CREATED = "jcr:created";
  /**
   * jcr:data
   */
  String JCR_DATA = "jcr:data";
  /**
   * jcr:defaultPrimaryType
   */
  String JCR_DEFAULTPRIMARYTYPE = "jcr:defaultPrimaryType";
  /**
   * jcr:defaultValues
   */
  String JCR_DEFAULTVALUES = "jcr:defaultValues";
  /**
   * jcr:encoding
   */
  String JCR_ENCODING = "jcr:encoding";
  /**
   * jcr:frozenMixinTypes
   */
  String JCR_FROZENMIXINTYPES = "jcr:frozenMixinTypes";
  /**
   * jcr:frozenNode
   */
  String JCR_FROZENNODE = "jcr:frozenNode";
  /**
   * jcr:frozenPrimaryType
   */
  String JCR_FROZENPRIMARYTYPE = "jcr:frozenPrimaryType";
  /**
   * jcr:frozenUuid
   */
  String JCR_FROZENUUID = "jcr:frozenUuid";
  /**
   * jcr:hasOrderableChildNodes
   */
  String JCR_HASORDERABLECHILDNODES = "jcr:hasOrderableChildNodes";
  /**
   * jcr:isCheckedOut
   */
  String JCR_ISCHECKEDOUT = "jcr:isCheckedOut";
  /**
   * jcr:isMixin
   */
  String JCR_ISMIXIN = "jcr:isMixin";
  /**
   * jcr:language
   */
  String JCR_LANGUAGE = "jcr:language";
  /**
   * jcr:lastModified
   */
  String JCR_LASTMODIFIED = "jcr:lastModified";
  /**
   * jcr:lockIsDeep
   */
  String JCR_LOCKISDEEP = "jcr:lockIsDeep";
  /**
   * jcr:lockOwner
   */
  String JCR_LOCKOWNER = "jcr:lockOwner";
  /**
   * jcr:mandatory
   */
  String JCR_MANDATORY = "jcr:mandatory";
  /**
   * jcr:mergeFailed
   */
  String JCR_MERGEFAILED = "jcr:mergeFailed";
  /**
   * jcr:mimeType
   */
  String JCR_MIMETYPE = "jcr:mimeType";
  /**
   * jcr:mixinTypes
   */
  String JCR_MIXINTYPES = "jcr:mixinTypes";
  /**
   * jcr:multiple
   */
  String JCR_MULTIPLE = "jcr:multiple";
  /**
   * jcr:name
   */
  String JCR_NAME = "jcr:name";
  /**
   * jcr:nodeTypeName
   */
  String JCR_NODETYPENAME = "jcr:nodeTypeName";
  /**
   * jcr:onParentVersion
   */
  String JCR_ONPARENTVERSION = "jcr:onParentVersion";
  /**
   * jcr:predecessors
   */
  String JCR_PREDECESSORS = "jcr:predecessors";
  /**
   * jcr:primaryItemName
   */
  String JCR_PRIMARYITEMNAME = "jcr:primaryItemName";
  /**
   * jcr:primaryType
   */
  String JCR_PRIMARYTYPE = "jcr:primaryType";
  /**
   * jcr:propertyDefinition
   */
  String JCR_PROPERTYDEFINITION = "jcr:propertyDefinition";
  /**
   * jcr:protected
   */
  String JCR_PROTECTED = "jcr:protected";
  /**
   * jcr:requiredPrimaryTypes
   */
  String JCR_REQUIREDPRIMARYTYPES = "jcr:requiredPrimaryTypes";
  /**
   * jcr:requiredType
   */
  String JCR_REQUIREDTYPE = "jcr:requiredType";
  /**
   * jcr:rootVersion
   */
  String JCR_ROOTVERSION = "jcr:rootVersion";
  /**
   * jcr:sameNameSiblings
   */
  String JCR_SAMENAMESIBLINGS = "jcr:sameNameSiblings";
  /**
   * jcr:statement
   */
  String JCR_STATEMENT = "jcr:statement";
  /**
   * jcr:successors
   */
  String JCR_SUCCESSORS = "jcr:successors";
  /**
   * jcr:supertypes
   */
  String JCR_SUPERTYPES = "jcr:supertypes";
  /**
   * jcr:system
   */
  String JCR_SYSTEM = "jcr:system";
  /**
   * jcr:uuid
   */
  String JCR_UUID = "jcr:uuid";
  /**
   * jcr:valueConstraints
   */
  String JCR_VALUECONSTRAINTS = "jcr:valueConstraints";
  /**
   * jcr:versionHistory
   */
  String JCR_VERSIONHISTORY = "jcr:versionHistory";
  /**
   * jcr:versionLabels
   */
  String JCR_VERSIONLABELS = "jcr:versionLabels";
  /**
   * jcr:versionStorage
   */
  String JCR_VERSIONSTORAGE = "jcr:versionStorage";
  /**
   * jcr:versionableUuid
   */
  String JCR_VERSIONABLEUUID = "jcr:versionableUuid";

  String JCR_CREATEDBY = "jcr:createdBy";

  String JCR_MODIFIEDBY = "jcr:modifiedBy";


  /**
   * Pseudo property jcr:path used with query results
   */
  String JCR_PATH = "jcr:path";
  /**
   * Pseudo property jcr:score used with query results
   */
  String JCR_SCORE = "jcr:score";

  /**
   * mix:lockable
   */
  String MIX_LOCKABLE = "mix:lockable";
  /**
   * mix:referenceable
   */
  String MIX_REFERENCEABLE = "mix:referenceable";
  /**
   * mix:versionable
   */
  String MIX_VERSIONABLE = "mix:versionable";
  /**
   * nt:base
   */
  String NT_BASE = "nt:base";
  /**
   * nt:childNodeDefinition
   */
  String NT_CHILDNODEDEFINITION = "nt:childNodeDefinition";
  /**
   * nt:file
   */
  String NT_FILE = "nt:file";
  /**
   * nt:folder
   */
  String NT_FOLDER = "nt:folder";
  /**
   * nt:frozenNode
   */
  String NT_FROZENNODE = "nt:frozenNode";
  /**
   * nt:hierarchyNode
   */
  String NT_HIERARCHYNODE = "nt:hierarchyNode";
  /**
   * nt:linkedFile
   */
  String NT_LINKEDFILE = "nt:linkedFile";
  /**
   * nt:nodeType
   */
  String NT_NODETYPE = "nt:nodeType";
  /**
   * nt:propertyDefinition
   */
  String NT_PROPERTYDEFINITION = "nt:propertyDefinition";
  /**
   * nt:query
   */
  String NT_QUERY = "nt:query";
  /**
   * nt:resource
   */
  String NT_RESOURCE = "nt:resource";
  /**
   * nt:unstructured
   */
  String NT_UNSTRUCTURED = "nt:unstructured";
  /**
   * nt:version
   */
  String NT_VERSION = "nt:version";
  /**
   * nt:versionHistory
   */
  String NT_VERSIONHISTORY = "nt:versionHistory";
  /**
   * nt:versionLabels
   */
  String NT_VERSIONLABELS = "nt:versionLabels";
  /**
   * nt:versionedChild
   */
  String NT_VERSIONEDCHILD = "nt:versionedChild";

  String MIX_SAKAIPROPERTIES = "sakaijcr:properties-mix";

  String MIX_ACL = "acl:properties-mix";

  String ACL_ACL = "acl:acl";

  String ACL_OWNER = "acl:owner";

  String JCR_SMARTNODE = "sakaijcr:smartNode";

  /**
   * true Indicates that the smart node at this point is inherited, false
   * indicates that smart node propagation stops at this point.
   */
  String JCR_SMARTNODE_INHERIT = "sakaijcr:inheritSmartNode";

  // reserved namespace for items defined by built-in node types
  String NS_JCR_PREFIX = "jcr";
  String NS_JCR_URI = "http://www.jcp.org/jcr/1.0";

  // reserved namespace for built-in primary node types
  String NS_NT_PREFIX = "nt";
  String NS_NT_URI = "http://www.jcp.org/jcr/nt/1.0";

  // reserved namespace for built-in mixin node types
  String NS_MIX_PREFIX = "mix";
  String NS_MIX_URI = "http://www.jcp.org/jcr/mix/1.0";

  // reserved namespace used in the system view XML serialization format
  String NS_SV_PREFIX = "sv";
  String NS_SV_URI = "http://www.jcp.org/jcr/sv/1.0";

  String NS_SAKAIHJCR_PREFIX = "sakaijcr";
  String NS_SAKAIHJCR_URI = "http://www.sakaiproject.org/CHS/jcr/jackrabbit/1.0";

  String NS_SAKAIH_PREFIX = "sakai";
  String NS_SAKAIH_URI = "http://www.sakaiproject.org/CHS/jcr/sakai/1.0";

  String NS_CHEF_PREFIX = "CHEF";
  String NS_CHEF_URI = "http://www.sakaiproject.org/CHS/jcr/chef/1.0";

  String NS_DAV_PREFIX = "DAV";
  String NS_DAV_URI = "http://www.sakaiproject.org/CHS/jcr/dav/1.0";

  String NS_ACL_PREFIX = "acl";
  String NS_ACL_URI = "http://www.jcp.org/acl/sv/1.0";

  String JCR_LABELS = "sakaijcr:labels";
  String JCR_MESSAGE_TYPE = "sakaijcr:messageType";
  String JCR_MESSAGE_ID = "sakaijcr:messageId";
  String JCR_MESSAGE_CHAT_CONVERSATION_ID = "sakaijcr:messageChatConversationId";
  String JCR_MESSAGE_CATEGORY = "sakaijcr:messageCategory";
  String JCR_MESSAGE_RCPTS = "sakaijcr:messageRcpts";
  String JCR_MESSAGE_DATE = "sakaijcr:messageDate";
  String JCR_MESSAGE_SUBJECT = "sakaijcr:messageSubject";
  String JCR_MESSAGE_FROM = "sakaijcr:messageFrom";
  String JCR_MESSAGE_READ = "sakaijcr:messageRead";
}
