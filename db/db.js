var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('./db/greenfe.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected with DB Gree nfe');
});

// export it
exports.db = db;
