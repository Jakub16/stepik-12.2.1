const { MongoClient } = require("mongodb");
const Db = process.env.MONGO_URI;
console.log(Db)
const client = new MongoClient(Db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let _db;

module.exports = {
    connectToServer: function (callback) {
        client.connect(function (err, db) {
            if (db) {
                _db = db.db("test");
                console.log("Connected");
            }
            return callback(err);
        });
    },

    getDb: function() {
        return _db;
    }
};