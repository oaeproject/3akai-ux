create table sdata_comments (
   id int not null AUTO_INCREMENT, 
   time varchar(255) not null, 
   comment text not null, 
   placement varchar(255) not null,
   userid varchar(255) not null,
   primary key  (id)
)
ENGINE = InnoDB
CHARACTER SET utf8;
