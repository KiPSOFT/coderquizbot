const fs = require('fs');
const path = require('path');

class db {
    constructor() {
        const self = this;
        self.dbPath = path.join(__dirname, '../db');
        try {
            self.polls = JSON.parse(fs.readFileSync(self.dbPath + '/polls.json'));
        } catch (err) {
            console.log('Create new polls file.');
            self.polls = [];
        }
        try {
            self.users = JSON.parse(fs.readFileSync(self.dbPath + '/users.json'));
        } catch (err) {
            console.log('Create new users file.');
            self.users = [];
        }
        setInterval(() => {
            fs.writeFile(self.dbPath + '/polls.json', JSON.stringify(self.polls), () => {});
            fs.writeFile(self.dbPath + '/users.json', JSON.stringify(self.users), () => {});
        }, 10000);
    }

    writePoll(pollsObject) {
        const self = this;
        self.polls.push({id: pollsObject.id, correct_option_id: pollsObject.correct_option_id});
    }

    getPoll(id) {
        const self = this;
        for (let p of self.polls) {
            if (p.id === id) {
                return p;
            }
        }
        return false;
    }

    getUser(id) {
        const self = this;
        for (let u of self.users) {
            if (u.id === id) {
                return u;
            }
        }
        return false;
    }

    writeUser(user, pollId, answerId) {
        const self = this;
        const poll = self.getPoll(pollId);
        if (poll) {
            if (poll.correct_option_id !== answerId) {
                // Not correct answer
                return;
            }
        } else {
            // Not have a poll.
            return;
        }
        const usr = self.getUser(user.id);
        if (usr) {
            usr.score += 1;
        } else {
            self.users.push({id: user.id, name: user.first_name + ' ' + user.last_name, score: 1});
        }
    }

    getFiveUsers() {
        const self = this;
        self.users.sort((a, b) => a.score - b.score);
        return self.users.slice(0, 5);
    }
}

module.exports = db;