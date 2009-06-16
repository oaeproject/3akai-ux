

CREATE TABLE sdata_property_index (
  id INTEGER NOT NULL AUTO_INCREMENT,
  context VARCHAR(36),
  propertyname VARCHAR(255),
  propertyvalue VARCHAR(255),
  reference VARCHAR(255),
  INDEX context_idx(context(36)),
  INDEX propertyname_idx(propertyname),
  INDEX propertyvalue_idx(propertyvalue),
  INDEX reference_idx(reference),
  PRIMARY KEY (id)
)
ENGINE = InnoDB
CHARACTER SET utf8;
