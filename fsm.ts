
import * as Lagrange from 'lagrange.onebot/type';
import { DatabaseService } from './data';

export class FSM {

    private static instance: FSM;

    public static getInstance(): FSM {
        if (!FSM.instance) {
            FSM.instance = new FSM();
        }
        return FSM.instance;
    }

    // 转换函数集合
    private transitions: { [key: string]: (...args: any[]) => Promise<boolean> } = {

        curse: async (msg: Lagrange.GroupMessage) => msg.raw_message.startsWith("sb"),
        kneel: async (msg: Lagrange.GroupMessage) => msg.raw_message.trim() === "爹",
        register_start: async (msg: Lagrange.GroupMessage) => msg.raw_message.includes("报名") && msg.raw_message.includes("团"),
        register_succ: async (msg: Lagrange.GroupMessage) => {
            const dbService = DatabaseService.getInstance();
            const result = await dbService.execute("select id from raid_info where date=(select max(date) from raid_info)", []);
            return result.rows.some(row => row.id == msg.raw_message.trim());
        },
        default: async (msg: Lagrange.GroupMessage) => true,
    };

    // 动作函数集合，目前暂时设置为返回字符串，即reply
    private actions: { [key: string]: (...args: any[]) => Promise<string | Lagrange.Send.Default[]> } = {
        curse_back: async (msg: Lagrange.GroupMessage) => msg.raw_message.trim().substring(0, 1) + "你妈个头！",
        curse_start: async (msg: Lagrange.GroupMessage) => "你才是sb",
        forgive: async (name: Lagrange.GroupMessage) => "好的，爹爹原谅你了",
        default_1: async (msg: Lagrange.GroupMessage) => {
            var text = msg.raw_message;
            text = text.replace('name=@很可能是逆蝶]', '').trim();
            if (text.startsWith('我是')) {
                const nickname = text.replace('我是', '').trim();
                const dbService = DatabaseService.getInstance();
                await dbService.execute("update fsm_sts set nick= $1 where qq=$2", [nickname, msg.user_id]);
                return [
                    {
                        type: 'reply',
                        data: {
                            id: msg.message_id.toString()
                        }
                    }, {
                        type: 'text',
                        data: {
                            text: '好了，知道你是' + nickname + '了'
                        }
                    }
                ];
            }
            const reply = '阁下刚刚的回答 ' + text + ' 已经记录在案！';
            const dbService = DatabaseService.getInstance();
            dbService.saveMessage(msg.user_id, text);
            return reply;
        },
        register_start: async (name: Lagrange.GroupMessage) => {
            const dbService = DatabaseService.getInstance();
            var reply = "好的, 以下是本周的raid计划, 请问你要参加哪个呢? "
            const result = await dbService.execute("select * from raid_info where date=(select max(date) from raid_info)", []);
            for (const row of result.rows) {
                reply += "\r\n" + `id: ${row.id} ${row.name} 难度: ${row.level} 装等要求: ${row.tlevel}`
            }
            return reply;
        },
        register_fail: async (name: Lagrange.GroupMessage) => "不行, 必须得选一个, 请输入id",
        register_success: async (name: Lagrange.GroupMessage) => "报名成功, 期待你的参与哦",
    };



    // 动态调用转换函数
    public async callTransition(transitionName: string, ...args: any[]) {
        console.log("transition = " + transitionName);
        const func = this.transitions[transitionName];
        if (func) {
            const res = await func(...args); // 动态调用;
            console.log(res);
            return res;
        } else {
            throw new Error(`Transition Function ${transitionName} does not exist.`);
        }
    }

    // 动态调用动作函数
    public async callAction(actionName: string, ...args: any[]) {
        const func = this.actions[actionName];
        if (func) {
            return await func(...args); // 动态调用
        } else {
            throw new Error(`Action Function ${actionName} does not exist.`);
        }
    }

    public async evaluate(input: Lagrange.GroupMessage): Promise<(string | Lagrange.Send.Default[])> {
        var reply = await this.evaluateCore(input);
        console.log(typeof(reply));
        if (typeof(reply) == 'string') {
            console.log('reply is string');
            reply = [
                {
                    type: 'reply',
                    data: {
                        id: input.message_id.toString()
                    }
                }, {
                    type: 'text',
                    data: {
                        text: reply.toString()
                    }
                }
            ];
        }
        return reply;
    }

    public async evaluateCore(input: Lagrange.GroupMessage): Promise<(string | Lagrange.Send.Default[])> {
        const qq = input.user_id;
        input.raw_message = input.raw_message.replace('name=@很可能是逆蝶]', '').trim();
        console.log(input.raw_message);
        console.log(input.user_id);
        const dbService = DatabaseService.getInstance();

        ////首次和bot对话的逻辑
        const fms_sts = await dbService.execute("select curr from fsm_sts where qq=$1", [qq]);
        if (fms_sts.rowCount == 0) {
            await dbService.execute("insert into fsm_sts values($1,$2,$3)", [qq, '', '0']);
            console.log(`新用户qq: ${qq} 已注册`)
        }

        const result = await dbService.execute("select * from fsm_data where curr=(select curr from fsm_sts where qq=$1) and sts='1' order by pri desc", [qq]);
        var match = false;

        for (const row of result.rows) {
            console.log(`状态: ${row.curr} -> ${row.nxt}, 条件: ${row.trans},动作: ${row.act}, 优先级: ${row.pri}`);
            var act = "";
            if (row.trans.startsWith("!") && !await this.callTransition(row.trans.replace('!', ''), input) ||
                !row.trans.startsWith("!") && await this.callTransition(row.trans, input)) {
                console.log(`qq: ${qq}, 条件: ${row.trans} 通过！执行动作: ${row.act}`);
                act = row.act;
                match = true;
                await dbService.execute("update fsm_sts set curr=$1 where qq=$2", [row.nxt, qq]);
                break;
            }
        }
        if (match) {
            return this.callAction(act, input);
        } else {
            return "好像。。。有点不对劲？"
        }

    }

}
