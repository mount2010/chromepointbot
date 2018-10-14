const mysql = require("mysql");
const config = require(`${process.cwd()}/config.json`);

const pool = mysql.createPool({
    connectionLimit: 10,
    host: config.db.host,
    user: config.db.username,
    password: config.db.password,
    database: config.db.database
})

function doQuery (query) {
    const promise = new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {reject(err)}
            connection.query(query, function (error, results, fields) {
                connection.release();
                if (error) {reject(error)}
            
                else {
                    resolve(results);
                };
            })
        })
    });
    return promise;


}
module.exports = {doQuery, pool};