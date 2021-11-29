process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var robot = require("robotjs");

const {Builder, By, Key, until} = require('selenium-webdriver');
let chrome = require('selenium-webdriver/chrome');
let mysql = require('../../db/mysql');
const axios = require('axios');
const execState = require('./execState');
const keyParse = require('../../utils/keyParse');

const moment = require('moment');
let driver = null;
var url = 'https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx';
var urls = [
    'https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx',
    'https://dfe-portal.svrs.rs.gov.br/NFE/Consulta'
];
var inOperation = false;
var pingav = null;
var receiver_code = '';
var object_config = {};
var pid = 0;
var loopSearchTask = null;
var parts_escraping = null;
var recaptchaTaskId = null;
var loopAvaibilitySefaz = null;

// SERVER NUMBER
var srv_number = 1;

async function loadDriver(app) {

    driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().windowSize({width: 1536, height: 864})).build();
    driver.manage().window().maximize();

    app.get('/cancel', function(req, res){
        driver.quit().then(() => {
            // LIMPAR TABLE
            mysql.connection.beginTransaction(function(error) {
                if(error) {
                    return connection.rollback(function() {
                        console.log(error);
                    });
                }
                mysql.connection.query('DELETE FROM queue', function (error, results, fields) {
                    if(error) {
                        return connection.rollback(function() {
                            console.log(error);
                        });
                    }
                    mysql.connection.query('DELETE FROM config', function (error, results, fields) {
                        if (error) {
                            return connection.rollback(function() {
                                console.log(error);
                            });
                        }
                        mysql.connection.commit(function(error) {
                            if (error) {
                                return mysql.connection.rollback(function() {
                                    console.log(error);
                                });
                            }
                            process.on("exit", function () {
                                require("child_process").spawn(process.argv.shift(), process.argv, {
                                    cwd: process.cwd(),
                                    detached : true,
                                    stdio: "inherit"
                                });
                            });
                            res.send('Cancel...');
                            process.exit();
                        });
                    });
                });
            });
        });
    });

    SearchTask();
}

function SearchTask() {

    // Buscar dados da fila
    loopSearchTask = setInterval(async function () {
        console.log('Buscando tarefa');
        if (!inOperation) {
            await dispatchQueue();
        }
    }, 5000);
}

function verifyAvaibility(callback) {
    var index = 0;
    axios.get(urls[0])
    .then(function (response) {
        console.log('Sefaz disponível');
        startNfeTask();
    }).catch(function (error) {
        console.log('Sefaz indisponível, verificando...');
        loopAvaibilitySefaz = setInterval(() => {
            axios.get(url)
            .then(function (response) {
                console.log('Sefaz disponível');
                clearInterval(loopAvaibilitySefaz);
                if (index == 0) {
                    startNfeTask();
                } else {
                    searchNFCe("ALL");
                }
            }).catch(function (error) {
                index++;
                if (typeof urls[index] != "undefined") {
                    url = urls[index];
                } else {
                    index = 0
                    url = urls[index];
                }
                console.log('Sefaz indisponível, verificando...');
            });
        }, 180000);
    });
    
}

function dispatchQueue() {

    return new Promise((resolve, reject) => {
        mysql.connection.query('SELECT data_json FROM config', function (error, results, fields) {
            if(error) {
                return reject(console.log(error));
            }
            if(results.length > 0) {
                object_config = results[0].data_json;
            }  
        });

        mysql.connection.query(`SELECT id, key_nfe FROM queue WHERE server_id = ${srv_number}`, function (error, results, fields) {
            if(error) {
                return reject(console.log(error));
            }
            if(results.length > 0) {
                pid = results[0].id;
                var data = results[0];
                console.log('Tarefa encontrada! Iniciando operação.');
                inOperation = true;
                clearInterval(pingav);
                object = data;
                receiver_code = data.key_nfe;
                clearInterval(loopSearchTask);
                console.log('Realizando tarefa');
                keyParse.createObjectKey(data.key_nfe).then((result) => {
                    if (result.model == "NFe") {
                        verifyAvaibility();
                    } else if (result.model == "NFCe") {
                        searchNFCe(result.state);
                    } else {
                        endProcess(2, 'Modelo de chave '+result.model+' informado não é elegível para apuração');
                    }
                    resolve();
                }).catch((error) => {
                    endProcess(2, error);
                    reject();
                });
            }  
        });
    });
}

async function startNfeTask() {

    driver.get(url).then(() => {
        driver.findElement(By.id('ctl00_ContentPlaceHolder1_txtChaveAcessoResumo')).then((result) => {
            result.sendKeys("value", receiver_code);
    
            setTimeout(function () {
                robot.moveMouse(388, 530);
                robot.mouseClick();
                console.log('Clicou no recaptch!');
                setTimeout(function () {
                    console.log('Consultou api do recaptch!');
                    solveCreateRecaptcha();
                }, 3000);
            }, 5000);
    
        }).catch((e) => {
            retryProcess();
        });

    }).catch(()=> {
        retryProcess();
    });
}

async function executeScrapingNfe() {

    var parse_config = JSON.parse(object_config);
    var products_visible = await jsCommand('return $("#tab_3").length');
    console.log('Começando o scraping...');
    if(products_visible > 0) {

        setTimeout(async () => {
            jsCommand('$("#tab_3").click();');

            var date_emission = await jsCommand('return $("#NFe > fieldset:nth-child(1) > table > tbody > tr > td:nth-child(4) > span").text();');
            if (parse_config.start_date && parse_config.final_date) {

                if (moment(getDateFormated(date_emission)).isBetween(parse_config.start_date, parse_config.final_date)) {
                    executeScrapingPartsNfe().then((result) => {
                        parts_escraping = result;
                        console.log('Produtos existe e está enviando requisição...');
                        executeScrapingNfeUpdate(date_emission);
                    }); 
                } else {
                    endProcess(2, 'Nota fiscal não está entre a data inicial e final de busca');
                }   
            } else {
                executeScrapingPartsNfe().then((result) => {
                    parts_escraping = result;
                    console.log('Produtos existe e está enviando requisição...');
                    executeScrapingNfeUpdate(date_emission);
                });
            }  
        }, 2000); 
    }
    else {

        setTimeout(async () => {
            var date_emission = await jsCommand('return $("#conteudoDinamico > div:nth-child(3) > div.XSLTNFeResumida > div:nth-child(3) > div.wID50 > p").text();');
            parts_escraping = {
                arr_description: [],
                arr_quantity: []
            }

            console.log('Produtos não existe, enviando requisição...');
            executeScrapingNfeUpdate(date_emission);
        }, 2000);
    } 
}

function executeScrapingNfeUpdate(date_emission) {
    var parse_config = JSON.parse(object_config);

    parts_escraping.config = parse_config;
    parts_escraping.key_nfe = receiver_code;
    parts_escraping.date_emission = getDateFormated(date_emission);
    parts_escraping.type_part_air = parse_config.type_part_air;

    setTimeout(() => {
        console.log('Processando a conclusão da tarefa...');
        endProcess(1);
    }, 2000);
}

async function executeScrapingPartsNfe() {
    return new Promise(async (resolve, reject) => {
        var arr_description = [];
        let description_class = await driver.findElements(By.className('fixo-prod-serv-descricao'));
        for(let e of description_class) {
            if(await e.getText() != 'Descrição') {
                arr_description.push(await e.getText());
            }
        }

        var arr_quantity = [];
        let quantity_class = await driver.findElements(By.className('fixo-prod-serv-qtd'));
        for(let e of quantity_class) {
            if(await e.getText() != 'Qtd.') {
                arr_quantity.push(await e.getText());
            }
        }

        resolve({
            arr_description: arr_description,
            arr_quantity: arr_quantity
        });
    });
}

async function solveCreateRecaptcha() {

    await axios.post('https://api.anti-captcha.com/createTask',{
        clientKey: "63510246f40047a065bed12aa714948f", //gree
        task: {
            type: "RecaptchaV2TaskProxyless",
            websiteURL: "https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx",
            websiteKey: "6LfZ3TQUAAAAAKvjyjKVhm_QN9cPMkdKJy9L36Ug"
        }
    }).then(function (response) {
        recaptchaTaskId = response.data.taskId;
        solveResultRecaptcha();
        console.log('Criou tarefa do recaptch!');
    }).catch(function (error) {
        console.log(error);
        retryProcess();
    });
}

async function solveResultRecaptcha() {

    await axios.post('https://api.anti-captcha.com/getTaskResult',{
        clientKey: "63510246f40047a065bed12aa714948f",
        taskId: recaptchaTaskId
    }).then(function (response) {
        if (response.data.errorId == 1) {
            solveResultRecaptcha();
        } else if (response.data.errorId == 0 && response.data.status == "processing") {
            console.log('Recaptch processando, aguardando...');
            setTimeout(() => {
                solveResultRecaptcha(); 
            }, 2000);
        } else {
            console.log('Recaptch resolvido!');   
            if (typeof response.data.solution.gRecaptchaResponse != 'undefined') {
                var gRecaptchaResponse = response.data.solution.gRecaptchaResponse;
            } else {
                retryProcess();
            }
            var elem = 'document.getElementById("g-recaptcha-response").innerHTML="'+gRecaptchaResponse+'"';
            var click = '$("#ctl00_ContentPlaceHolder1_btnConsultar").click();'
            setTimeout(() => {
                jsCommand(elem);
                setTimeout(() => {
                    jsCommand(click);
                    setTimeout(async function() {
                        let el = driver.findElement(By.id('ctl00_ContentPlaceHolder1_bltMensagensErro'));
                        driver.wait(until.elementIsVisible(el),100).then(async () => {
                            var text = await jsCommand('return $("#ctl00_ContentPlaceHolder1_bltMensagensErro").text();');
                            endProcess(2, text);
                        }).catch(() => {
                            setTimeout(async () => {
                                try {
                                    var content_visible = await jsCommand('return $(".GeralXslt").length');
                                    var content_not_visible = await jsCommand('return $(".XSLTNFeResumida").length;');
                                } catch (error) {
                                    retryProcess();
                                }
                                if(content_visible > 0 || content_not_visible > 0) {
                                    console.log('layout da NFe, está pronto!');
                                    executeScrapingNfe();
                                } else {
                                    retryProcess();
                                }
                            }, 2000);
                        });
                    }, 3000);
                }, 500);
            }, 500);     

        }
    }).catch(function (error) {
        console.log(error);
        retryProcess();
    });
}

async function searchNFCe(state) {
    var response = await execState.startRobotNFCe({
        'state':state, 
        'driver': driver, 
        'robot': robot,
        'row': {
           'config': object_config, 
           'key': object.key_nfe
        },
    });
    if (response.status == 'retry') {
        retryProcess();
    } else if (response.status == 'completed') {
        parts_escraping = response.result;
        endProcess(1);
    } else {
        endProcess(2, response.msg);
    }
}

async function endProcess(type, msg_error = null) {
    if (type === 1) {
        await axios.post('https://filemanager.gree.com.br/commercial/export/report/sale/client/response',
            parts_escraping 
        ).then(() => {
            updateDBTasks();
            console.log('Tarefa concluída...');
        }).catch(() => {
            setTimeout(() => {
                console.log(receiver_code);
                console.log('Ocorreu um erro inesperado ao tentar concluir a tarefa.');
                driver.quit();
                process.exit(1);
            }, 5000);
        });
    } else if(type === 2) {
        await axios.post('https://filemanager.gree.com.br/commercial/export/report/sale/client/response/errors',
            {key_nfe: receiver_code, msg_error: msg_error} 
        ).then(() => {
            updateDBTasks();
            console.log(msg_error);
        }).catch(() => {
            setTimeout(() => {
                console.log(receiver_code);
                console.log('Ocorreu um erro inesperado ao tentar informar o erro ocorrido.');
                driver.quit();
                process.exit(1);
            }, 5000);
        });
    }
}

function updateDBTasks() {

    mysql.connection.query('SELECT COUNT(*) AS total FROM queue', function (error, results, fields) {
        if(error) {
            return console.log(error);
        }
        if(results[0].total == 1) {

            mysql.connection.query('DELETE FROM config', function (error, results, fields) {
                if(error) {
                    return console.log(error);
                }
            });
        }  
    });
    mysql.connection.query(`DELETE FROM queue WHERE id = ${pid}`, function (error, results, fields) {
        if(error) {
            return console.log(error);
        }
        startAgainOtherTask();
    });
}

function startAgainOtherTask() {
    setTimeout(() => {
        setTimeout(() => {
            inOperation = false;
            SearchTask(); 
        }, 2000);
    }, 3000);
}

function retryProcess() {

    mysql.connection.query(`SELECT id, key_nfe, retry FROM queue WHERE id = ${pid}`, function (error, results, fields) {
        if(error) {
            return console.log(error);
        }
        if (parseInt(results[0].retry) >= 3) {
            endProcess(2, 'Processo retrocedeu '+ results[0].retry +'');
        } else {
            var total = results[0].retry + 1;

            mysql.connection.query(`UPDATE queue SET retry=${total} WHERE id = ${pid}`, function (error, results, fields) {
                if(error) {
                    return console.log(error);
                }
                console.log('Tarefa atualizado, tentando novamente!');
                dispatchQueue();
            });
        }  
    });

}

async function jsCommand(exe) {
    return await driver.executeScript(exe);
}

function getDateFormated(date_string) {
    var full_date = date_string.split(' ');
    var date = full_date[0].split('/');
    return date[2] + '-' + date[1] + '-' + date[0];
}

module.exports = {
    loadDriver, 
    jsCommand, 
    retryProcess, 
    endProcess, 
    getDateFormated, 
    verifyAvaibility,
    robot, axios
};
