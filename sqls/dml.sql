insert into fsm_sts values(1614684804,'第四个暗牧', 0);
insert into fsm_sts values(452788198,'率性野莓味', 0);

insert into fsm_data values(0,0, '初始节点自循环', 'default','default_1','1',1);
insert into fsm_data values(0,1, '初始节点到辱骂节点', 'curse','curse_start','1',5);
insert into fsm_data values(1,1, '辱骂节点自循环', '!kneel','curse_back','1',100);
insert into fsm_data values(1,0, '辱骂节点到初始节点', 'kneel','forgive','1',1);
insert into fsm_data values(0,2, '初始节点到报名节点', 'register_start','register_start','1',10);
insert into fsm_data values(2,2, '报名节点自循环', '!register_succ','register_fail','1',10);
insert into fsm_data values(2,0, '报名节点返回', 'register_succ','register_success','1',10);


insert into raid_info (name , level , tlevel , date ) values('sx团','M', '630', '20240905');
insert into raid_info (name , level , tlevel , date ) values('sgz团','H', '615', '20240905');
insert into raid_info (name , level , tlevel , date ) values('xx团','PT', '600', '20240905');