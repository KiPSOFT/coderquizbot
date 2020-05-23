const fs = require('fs');
const path = require('path');
const axios = require('axios');


class Questions {
    
    async init() {
        const self = this;
        const languages = self.retrieveLanguages();
        self.quiz = {};
        self.singleDimQuiz = [];
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
        self.singleDimQuiz.push(questionInfo);
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

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    getQuestion(langName, level) {
        const self = this;
        let question;
        if (langName === '') {
            self.shuffleArray(self.singleDimQuiz);
            question = self.singleDimQuiz[0];
        } else {
            const questionsArr = self.quiz[langName][level];
            if (!questionsArr || questionsArr.length === 0) {
                return {
                    exception: true,
                    message: `Oops, I couldn\'t find a ${level} level ${langName} question.`
                };
            }
            const keys = Object.keys(questionsArr);
            self.shuffleArray(keys);
            question = questionsArr[keys[0]];
        }
        return {
            imagePath: path.join(__dirname, '../quiz', langName, question.name) + '/code.png',
            description: question.question,
            options: question.options,
            params: { 
                correct_option_id: question.correctAnserId,
                open_period: 45,
                is_anonymous: false
            },
            filename: 'coder_quiz_' + langName + '_' + question.name
        };
    }
}

module.exports = Questions;
