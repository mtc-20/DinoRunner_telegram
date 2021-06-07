const express = require('express')
const path = require('path')
const TelegramBot = require('node-telegram-bot-api')
const { query } = require('express')
const TOKEN = '1899007722:AAFeSpZsYIBZPu5gmmfEnpRY4RXZ4QX-28A'

const server = express()
const bot = new  TelegramBot(TOKEN, {polling: true})
const port = process.env.PORT || 5000

const gameName = 'dinoRunner'
const queries = {}

server.use(express.static(path.join(__dirname, 'public')));

bot.onText(/help/, (msg)=> {
    bot.sendMessage(msg.from.id, "This bot implements a T-Rex runner game. Say /game if you want to play.")
});

bot.onText(/start|game/, (msg)=> bot.sendGame(msg.from.id, gameName));
bot.on('callback_query', function(query) {
    if(query.game_short_name !== gameName) {
        bot.answerCallbackQuery(query.id, "Sorry "+ query.game_short_name + "is not available." )
    }
    else {
        queries[query.id] = query;

        let gameURL = 'https://dinorunner-telegram.herokuapp.com/index.html?id='+query.id

        bot.answerCallbackQuery({
            callback_query_id: query.id,
            url: gameURL
        })
    }
});

bot.on('inline_query', function(iq) {
    bot.answerInlineQuery(iq.id, [{
        type: 'game',
        id: '0',
        game_short_name: gameName
    }])
});

server.get('/highscore/:score', function(req, res, next) {
    if(!Object.hasOwnProperty.call(queries, req.query.id)) return next()

    let query = queries[req.query.id]
    let options;
    if (query.message) {
        options = {
            chat_id: query.message.chat.id,
            messsage_id: query.message.messsage_id
        }
    }
    else {
        options = {
            inline_message_id: query.inline_message_id 
        }
    }
    bot.setGameScore(query.from.id, parseInt(req.params.score), options, function(err, result) {})
});

server.listen(port);
