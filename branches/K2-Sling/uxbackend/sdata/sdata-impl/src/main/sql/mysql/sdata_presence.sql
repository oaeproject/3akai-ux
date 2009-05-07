create table sdata_presence (
   userid varchar(255) not null,  
   lastseen bigint not null,
   primary key  (userid)
)
ENGINE = InnoDB
CHARACTER SET utf8;
