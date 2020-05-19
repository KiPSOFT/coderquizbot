const Quiz = require('./lib/quiz');

async function init() {
    await (new Quiz()).init();
}

init();