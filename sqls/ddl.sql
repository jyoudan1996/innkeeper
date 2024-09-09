create table messages(
    id serial primary key,
    user_id integer,
    messages text,
    timestamp timestamp default CURRENT_TIMESTAMP
);

create table fsm_data(
    curr integer,
    nxt integer,
    name varchar(100),
    trans   varchar(50),
    act varchar(50),
    sts char(1),
    pri integer,
    primary key(curr, nxt, sts)
);

create table fsm_sts(
    qq integer primary key,
    nick varchar(100),
    curr integer
);


create table raid_info(
    id  serial primary key,
    name varchar(100),
    level varchar(5),
    tlevel integer,
    date    char(8)
);

create table raid_reg_flow(
    id  serial primary key,
    raid_id integer,
    qq integer,
    nick varchar(100),
    created_at timestamp

);