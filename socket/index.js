const Messages = require('../models/Messages');
const Account = require('../models/Account');
const moment = require('moment');
class SocketHander {

    constructor() {
        this.db;
    }

    connect() {
        this.db = require('mongoose').connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`);
        this.db.Promise = global.Promise;
    }

    getMessages() {
        return Messages.find();
    }

    storeMessages(data) {

        console.log(data);
        const newMessages = new Messages({
            name: data.name,
            msg: data.msg,
            time: moment().valueOf(),
			clientID: data.clientID,
        });

        const doc = newMessages.save();
    }
	
	printMessages(cb){
		Messages.find({},function(err,docs){
			if (err) console.log('error occured in the database'+err);
			else{
				cb.send(JSON.stringify(docs));
			}
		}).select({"name":1,"msg":1,"time":1,"_id":0});
	}
	
	login(data, cb){
		Account.find({login:'admin',pw:'test123'},function(err,docs){
			if (err) console.log('error occured in the database'+err);
			else{
				console.log(docs);
				cb(docs);
			}
		});     
	}
	
}

module.exports = SocketHander;