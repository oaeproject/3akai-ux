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
package org.sakaiproject.kernel.serialization.json;

import com.google.inject.Inject;
import com.google.inject.Injector;
import com.google.inject.name.Named;

import net.sf.ezmorph.Morpher;
import net.sf.ezmorph.MorpherRegistry;
import net.sf.json.JsonConfig;
import net.sf.json.util.JSONUtils;

import org.sakaiproject.kernel.KernelConstants;

import java.util.List;
import java.util.Map;

/**
 * A Json Config class suitable for serializing site definition json and pojos.
 */

public class BeanJsonLibConfig extends JsonConfig {



  /**
   * Construct the config with a Guice injector.
   *
   * @param injector
   *          the Guice injector
   * @param morphers
   */
  @Inject
  public BeanJsonLibConfig(Injector injector,
      List<ValueProcessor> valueProcessors, List<BeanProcessor> beanProcessors,
      @Named(KernelConstants.JSON_CLASSMAP) Map<String, Object> classMap,
      List<Morpher> morphers) {

    MorpherRegistry morpherRegistry = JSONUtils.getMorpherRegistry();
    for (Morpher morpher : morphers) {
      morpherRegistry.registerMorpher(morpher);
    }
    /*
     * This hook deals with the creation of new beans in the JSON -> Java Bean
     * conversion
     */
    setNewBeanInstanceStrategy(new InjectorBeanInstanceStrategy(injector));

    /*
     * We are expecting null for nulls
     */
    registerDefaultValueProcessor(String.class, new NullDefaultValueProcessor());

    setJsonPropertyFilter(new NullPropertyFilter());
    setJavaPropertyFilter(new NullPropertyFilter());

    // the classMap deals with the basic json string to bean conversion

    setClassMap(classMap);

    /*
     * mappings are required where there is a List of objects in the interface
     * with no indication of what type the list should contain. At the moment,
     * we are using 1 map for all json trees, as there is no conflict, but if
     * there is a map could be selected on the basis of the root object. It
     * would be better to do this with generics, but this is good enough and
     * compact enough for the moment.
     */
    //
    // skin needs no mappings
    // title needs no mappings
    // type needs no mappings
    // owner needs no mappings
    // icon needs no mappings
    // pubView needs no mappings
    // status needs no mappings
    // Mappings look like: classMap.put("roles", JsonSiteRole.class);

    for (ValueProcessor valueProcessor : valueProcessors) {
      registerJsonValueProcessor(valueProcessor.getParentClass(),
          valueProcessor.getKey(), valueProcessor.getJsonValueProcessor());
    }
    for (BeanProcessor beanProcessor : beanProcessors) {
      registerJsonBeanProcessor(beanProcessor.getParentClass(), beanProcessor
          .getJsonBeanProcessor());
    }

  }
}
