// main.ts
import { server } from 'lagrange.onebot';
import './impl';

// server 刚启动的时候要做的事情
server.onMounted(c => {
    // 向 QQ 号为 1193466151 的好友发送文本信息 "成功上线"
    c.sendPrivateMsg(1614684804, '成功上线');
});

// server 即将关闭时要做的事情
server.onUnmounted(c => {
    // 向 QQ 号为 1193466151 的好友发送文本信息 "成功下线"
    c.sendPrivateMsg(1614684804, '成功下线');
})

server.run({
    // 拉格朗日服务器中的配置参数
    host: '127.0.0.1',
    port: 19981,
    path: '/onebot/v11/ws',

    // 阁下启动的机器人的 QQ 号
    qq: 3496154176
});
