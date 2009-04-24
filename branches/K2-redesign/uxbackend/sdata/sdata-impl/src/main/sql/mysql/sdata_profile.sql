create table sdata_profile (
   userid varchar(255) not null,  
   basic text,
   aboutme text,
   contactinfo text,
   education text,
   job text,
   websites text,
   academic text,
   picture text,
   primary key  (userid)
)
ENGINE = InnoDB
CHARACTER SET utf8;
