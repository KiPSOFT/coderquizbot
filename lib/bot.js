const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path')

const commandType = {
    Quiz: 'quiz',
    Results: 'results'
};    

class Bot extends Telegraf {    

    constructor(commands) {
        super(process.env.TOKEN);
        const self = this;
        self.commands = commands;
        self.start(self.commands.start);
        self.command(commandType.Quiz);
        self.command(commandType.Results);
        self.on('poll_answer', (ctx) => {
            self.commands.db.writeUser(ctx.update.poll_answer.user, ctx.update.poll_answer.poll_id, ctx.update.poll_answer.option_ids[0]);
        });
        self.launch({
            webhook: {
                domain: 'coderquizbot.herokuapp.com',
                hookPath: '/' + process.env.TOKEN,
                port: process.env.PORT
            }
        });
     }

    command(cmdType) {
        const self = this;
        super.command(cmdType, async(ctx) => {
            const params = ctx.message.text.split(' ');
            switch (cmdType) {
                case commandType.Quiz:
                    const langName = params[1] !== undefined ? params[1] : 'javascript';
                    const level = params[2] !== undefined ? params[2] : 'low';
                    ctx.bot = self;
                    await self.commands.quiz(langName, level, ctx);
                    break;
                case commandType.Results:
                    self.commands.results(ctx);
                    break;
            }
        });
    }

}

module.exports = Bot;
