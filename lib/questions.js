const fs = require('fs');
const path = require('path');
const axios = require('axios');


class Questions {
    
    async init() {
        const self = this;
        const languages = self.retrieveLanguages();
        self.quiz = {};
        for (let langName of languages) {
            self.quiz[langName] = {};
            let questions = self.retrieveQuestions(langName);
            for (let questionName of questions) {
                let info = self.getQuestionInfo(langName, questionName);
                self.pushQuestion2Quiz(langName, info, questionName);
                await self.getImage(langName, questionName, self.quiz[langName][questionName]);
            }
        }
    }

    retrieveLanguages() {
        return fs.readdirSync(path.join(__dirname, '../quiz'));
    }
    
    retrieveQuestions(langName) {
        return fs.readdirSync(path.join(__dirname, '../quiz', langName));
    }
    
    getQuestionInfo(langName, questionName) {
        const conf = JSON.parse(fs.readFileSync(path.join(__dirname, '../quiz', langName, questionName) + '/conf.json'));
        return conf;
    }
    
    pushQuestion2Quiz(langName, questionInfo, questionName) {
        const self = this;
        let level = questionInfo.level ? questionInfo.level : 'low';        
        if (self.quiz[langName][level] === undefined) {
            self.quiz[langName][level] = {};
        }
        self.quiz[langName][level][questionName] = questionInfo;
    }
    
    async getImage(langName, questionName) {
        const questionPath = path.join(__dirname, '../quiz', langName, questionName);
        if (!fs.existsSync(questionPath + '/code.png')) {
            const code = fs.readFileSync(questionPath + '/code');
            const data = {
                code: code.toString(),
                "backgroundColor": "rgba(171, 184, 195, 1)",
                "backgroundMode": "color",
                "fontFamily": "Hack",
                "fontSize": "14px",
                "theme": "seti"
            };
            console.log(`${questionName}: Getting png image...`);
            const res = await axios.post('https://carbonara.now.sh/api/cook/', data, {
                responseType: 'stream',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const writer = fs.createWriteStream(questionPath + '/code.png');
            res.data.pipe(writer);
            return new Promise((resolve, reject) => {
                writer.on('finish', resolve)
                writer.on('error', reject)
            });
        } else return new Promise((resolve, reject) => resolve());
    }

    getQuestion(langName, level) {
        const self = this;
        console.log(JSON.stringify(self.quiz));
        const questionsArr = self.quiz[langName][level];
        const keys = Object.keys(questionsArr);
        console.log('Question count:' + keys.length);
        const rand = Math.floor(Math.random() * Math.floor(keys.length));
        const question = questionsArr[keys[rand]];
        return {
            imagePath: path.join(__dirname, '../quiz', langName, keys[rand]) + '/code.png',
            description: question.question,
            options: question.options,
            params: { 
                correct_option_id: question.correctAnserId,
                open_period: 45,
                is_anonymous: false
            },
            filename: 'coder_quiz_' + langName + '_' + keys[rand]
        };
    }
}

module.exports = Questions;
