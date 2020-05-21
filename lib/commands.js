const Db = require('./db');

class Commands {
    constructor(questions) {
        const self = this;
        self.questions = questions;
        self.db = new Db();
    }

    start(ctx) {
        ctx.reply('Welcome to Coder Quiz bot!');
    }

    async quiz(langName, level, ctx) {
        const self = this;
        console.log('Getting quiz:' + langName + ',' + level);
        const question = self.questions.getQuestion(langName, level);
        if (question.exception) {
            await ctx.reply(question.message);
            return;
        }
        await ctx.telegram.sendPhoto(ctx.chat.id, {
            source: question.imagePath,
            filename: question.filename
        });
        setTimeout(async() => {
            const quizObject = await ctx.replyWithQuiz(
                question.description,
                question.options,
                question.params
            );
            self.db.writePoll(quizObject.poll);
        }, 500);
    }

    results(ctx) {
        const self = this;
        const topScorer = self.db.getFiveUsers();
        let html = 'Top 5 scorer,\r\n';
        for (let ts of topScorer) {
            html += `<b>${ts.name}:</b>  ${ts.score}\r\n`;
        }
        ctx.replyWithHTML(html);
    }
}

module.exports = Commands;