create table sdata_lastlogin (
  userid varchar(255) not null, 
  usereid varchar(255) not null, 
  userdate timestamp not null, 
  primary key(userid)
)
ENGINE = InnoDB
CHARACTER SET utf8;


create table sdata_indexqueue (
   id int not null AUTO_INCREMENT, 
   version timestamp not null, 
   name varchar(255) not null, 
   context varchar(255) not null, 
   tool varchar(255) not null, 
   primary key  (id)
)
ENGINE = InnoDB
CHARACTER SET utf8;




