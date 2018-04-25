const Account = require('../models/Account');
class AccountHandler {

    constructor() {
        this.db;
    }

    connect() {
        this.db = require('mongoose').connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`);
        this.db.Promise = global.Promise;
    }

    getAccount() {
        return Account.find();
    }

    storeAccount(data) {

        console.log(data);
        const newAccount = new Account({
            login: data.login,
            pw: data.pw,
			id: data.id,
        });
        const doc = newAccount.save();
    }
	
	login(){
		return Account.find({login:"admin",pw:"test1234"});
	}
	
}

module.exports = AccountHandler;