const line = require('@line/bot-sdk');
const express = require('express');
const { param } = require('express/lib/request');
const res = require('express/lib/response');

//環境変数からチャンネルアクセストークンとチャンネルシークレットを取得する
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
};

//LINE クライアントを生成する

const client = new line.Client(config);

const app = express();

app.post('/callback',line.middleware(config),(req,res) => {
    //一回のリクエストに複数のメッセージが含まれていることもあるのでイベントの配列を一件ずつ取得して処理する
    const events = req.body.events;
    Promise.all(events.map((event) => {
        return handleEvent(event).catch(() => {return null;});
    })
    .then((result) => {
        res.status(200).json({}).end();
    }));
});
/** 
*@param {*}
*@return {Promise}
*/
function handleEvent(event){
    if(event.type !== 'message' || event.message.type !== 'text'){
        return Promise.resolve(null);
    }

    const echoMessage = {
        type: 'text',
        text: `「${event.message.text}」`
        
    };

    return client.replyMessage(event.replyToken, echoMessage);
}

const port = process.env.PORT || 8080;
app.listen(port, () =>{
    console.log(`Listening on ${port}`);
});