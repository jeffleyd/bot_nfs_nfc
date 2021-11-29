const express = require('express');
const app = express();

var http = require('http').createServer(app);

let mysql = require('./db/mysql');
let servers = require('./components/gree/servers');
var sindex = 0;

http.listen(4000, function(){
    console.log('listening on port 4000');
});

app.get('/', function(req, res){
    res.send('server is running');
});

app.get('/wakeup', function(req, res){
    res.send('ping');
});

const greeInit = require('./components/gree/init');

greeInit.loadDriver(app);

async function insertQueue(data) {

    return new Promise((resolve, reject) => {
        json = JSON.stringify(data.config);
        
        data.keys.forEach(function(item) {

            var result = servers.nextServerExec(sindex);

            mysql.connection.query('SELECT COUNT(*) AS total FROM config', function (error, results, fields) {
                if(error) {
                    return reject(console.log(error));
                }
                console.log(results);
                if(results[0].total == 0) {
    
                    mysql.connection.query('INSERT INTO config SET ?', {data_json: json}, function (error, results, fields) {
                        if(error) {
                            return reject(console.log(error));
                        }
                        console.log('Nova configuração registrada...');
                        resolve()
                    });
                } else {
                    resolve();
                }
            });

            mysql.connection.query('INSERT INTO queue SET ?', {key_nfe: item, server_id: result.id}, function (error, results, fields) {
                if(error) {
                    return reject(console.log(error));
                }
                console.log('Nova tarefa registrada...');
            });

            sindex = result.next;
        });
    });
}

app.use(express.json());
app.post("/newTask", async function(req, res) {
    var params = req.body;
    await insertQueue(params);
    res.send();
});