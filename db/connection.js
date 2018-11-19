const mysql = require("mysql");
const secrets = require(`${process.cwd()}/secrets.json`);
const config = require(`${process.cwd()}/config.json`);

const pool = mysql.createPool({
    connectionLimit: 10,
    host: config.db.host,
    user: secrets.db.username,
    password: secrets.db.password,
    database: config.db.database
});

function doQuery (query) {
    const promise = new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {reject(err);}
            connection.query(query, function (error, results, fields) {
                connection.release();
                if (error) {reject(error);}
            
                else {
                    resolve(results);
                }
            });
        });
    });
    return promise;
}
module.exports = {doQuery, pool};