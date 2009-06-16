create table sdata_messages (
   id int not null AUTO_INCREMENT, 
   datetime varchar(255) not null,
   sender varchar(255) not null,
   receiver varchar(255) not null,
   title text,
   message text,
   isinvite bit not null,
   isread bit not null, 
   primary key  (id)
)
ENGINE = InnoDB
CHARACTER SET utf8
COLLATE utf8_unicode_ci;
