const Questions = require('./questions');
const Commands = require('./commands');
const Bot = require('./bot');

class Quiz {

   async init() {
       const self = this;
       self.questions = new Questions();
       await self.questions.init();
       self.commands = new Commands(self.questions);
       self.bot = new Bot(self.commands);
       await self.bot.launch();
       console.log('Bot launching...');
   }

}

module.exports = Quiz;
