create table sdata_chat (
   id INTEGER NOT NULL AUTO_INCREMENT,
   text varchar(255) not null,  
   sender varchar(255) not null, 
   receiver varchar(255) not null, 
   senttime varchar(255) not null,
   isread bigint not null,
   readwhen varchar(255),
   primary key  (id)
)
ENGINE = InnoDB
CHARACTER SET utf8;
