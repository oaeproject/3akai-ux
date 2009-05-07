create table sdata_connections (
   id int not null AUTO_INCREMENT, 
   inviter varchar(255) not null,
   receiver varchar(255) not null,
   connectiontype int not null, 
   accepted bit not null,
   primary key  (id)
)
ENGINE = InnoDB
CHARACTER SET utf8;
