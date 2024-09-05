// impl.ts

import { mapper, LagrangeContext, PrivateMessage, GroupMessage } from 'lagrange.onebot';
import { DatabaseService } from './data'; 
import { FSM } from './fsm'; 



export class Impl {
    


    // 将对于用于 1193466151 的应答函数装配进管线中
    @mapper.onPrivateUser(1614684804)
    async handlePrivateMsg(c: LagrangeContext<PrivateMessage>) {
        /**
         * c 是 lagrange.onebot 中最核心的上下文，它包含了所有满足 
         * onebot v11 协议的 API
         * c.message 是当前事务的消息
        */

        const msg = c!.message.raw_message;
        const reply = '阁下刚刚的回答是 ' + msg;
        c.sendPrivateMsg(c!.message.user_id, reply);
        // 和下面几种写法完全等价
        // c.sendPrivateMsg(1193466151, reply);
        // c.sendMessage(reply);


        // finishSession 会标记当前事务为“已完成”，此时 c.fin 为 true
        // c.fin 为 true 的情况下，所有 onebot v11 API 全部失效
        c.finishSession();
    }

    @mapper.onGroup(789720073, { at: true })
    async handleTestGroup(c: LagrangeContext<GroupMessage>) {
        const fms = FSM.getInstance();
        const reply = await fms.evaluate(c!.message);
        // var msg = c!.message.raw_message;
        // const msg_id = c!.message!.message_id.toString();
        // msg = msg.replace('name=@很可能是逆蝶]','').trim();
        // if(msg.startsWith('我是')){
        //     const reply = msg.replace('我是','').trim();
        //     c.sendMessage([
        //         {
        //             type: 'reply',
        //             data: {
        //                 id: msg_id
        //             }
        //         },{
        //             type: 'text',
        //             data: {
        //                 text: '好了，知道你是'+reply+'了'
        //             }
        //         }
        //     ]);
        //     return;
        // }
        // const reply = '阁下刚刚的回答 ' + msg + ' 已经记录在案！';
        // const dbService = DatabaseService.getInstance();
        // await dbService.saveMessage(c.message.user_id, msg);
        // //c.sendGroupMsg(c!.message.group_id, reply);
        c.sendMessage(reply);
    }
}