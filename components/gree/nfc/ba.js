const misc = require('../../../utils/misc');
const urls = require('../../../utils/urls');
const domParse = require('../../../utils/domParse');
const avaible = require('../../../utils/verifyAvaible');
const recaptch = require('../../../utils/anti-recaptch');
const {Builder, By, Key, until} = require('selenium-webdriver');

const moment = require('moment');
var url = urls.states.BA;
var init = null;
var parts_escraping = null;
var isResolve;

// Principal dados do site
var keyElemRecaptcha = "6Lc3BmAUAAAAAH-l6pmN_QyMk09swnN3Xxua42K8";


async function startScript(init_object) {
    init = init_object;

    return new Promise(async (resolve) => {
        isResolve = resolve;
        await avaible.verifyAvaibility(url);
        init.driver.get(url).then(async () => {            
            outSidePanel();
        });
    });
}

async function outSidePanel() {

    await init.driver.findElement(By.id('txt_chave_acesso')).then((result) => {
        result.sendKeys("value", init.row.key);
        setTimeout(async function () {
            await init.driver.findElement(By.id('img_captcha')).then((result) => {
                result.takeScreenshot().then(
                    function(base64, err) {
                        recaptch.solveCreateRecaptcha({
                            type:"ImageToTextTask",
                            body:base64,
                            phrase:false,
                            case:false,
                            numeric:0,
                            math:false,
                            minLength:0,
                            maxLength:0
                        }).then((result) => {
                            init.driver.findElement(By.id('txt_cod_antirobo')).then((res) => {
                                res.sendKeys(result.solution.text);
                                var click = 'document.getElementById("btn_consulta_completa").click();';
                                setTimeout(async () => {
                                    init.driver.executeScript(click);
                                    setTimeout(async function() {
                                        let el = init.driver.findElement(By.id('lbl_invalido'));
                                        init.driver.wait(until.elementIsVisible(el),100).then(async () => {
                                            isResolve({status:'retry'});
                                        }).catch(() => {
                                            init.driver.findElement(By.id('u20')).then(() => {
                                                inSidePanel();
                                            }).catch(() => {
                                                isResolve({status:'retry'});
                                            })
                                        });
                                    }, 3000);
                                }, 4000);
                            });
                        }).catch((error) => {
                            isResolve({status:'retry'});
                        });
                    }
                );
            }).catch((error) => {
                console.log('Erro ao encontrar id do captcha');
            });
        }, 3000);
    }).catch((e) => {
        isResolve({status:'retry'});
    });
    
}

async function inSidePanel() {
    var parse_config = JSON.parse(init.row.config);    
    console.log('Começando o scraping...');
    setTimeout(async () => {

        var rows = await init.driver.findElement(By.xpath('//*[@id="infos"]/div[1]/div/ul/li'));
        var string_rows = await rows.getText();
        var date_emission = string_rows.match(/\d{2}([\/.-])\d{2}\1\d{4}/g);

        if (parse_config.start_date && parse_config.final_date) {

            if (moment(misc.getDateFormated(date_emission[0])).isBetween(parse_config.start_date, parse_config.final_date)) {
                executeScrapingPartsNfe().then((result) => {
                    parts_escraping = result;
                    console.log('Produtos existe e está enviando requisição...');
                    executeScrapingNfeUpdate(date_emission[0]);
                });
            } else {
                isResolve({status:'error', msg: 'Nota fiscal não está entre a data inicial e final de busca'});
            }   
        } else {
            executeScrapingPartsNfe().then((result) => {
                parts_escraping = result;
                console.log('Produtos existe e está enviando requisição...');
                executeScrapingNfeUpdate(date_emission[0]);
            });
        }
    }, 2000);
}

function executeScrapingNfeUpdate(date_emission) {
    var parse_config = JSON.parse(init.row.config);

    parts_escraping.config = parse_config;
    parts_escraping.key_nfe = init.row.key;
    parts_escraping.date_emission = misc.getDateFormated(date_emission);
    parts_escraping.type_part_air = parse_config.type_part_air;

    setTimeout(() => {
        console.log('Processando a conclusão da tarefa...');
        isResolve({status:'completed', result: parts_escraping});
    }, 2000);
}

async function executeScrapingPartsNfe() {
    return new Promise(async (resolve, reject) => {
        var arr_description = [];
        var arr_quantity = [];

        var root = domParse.dom(String(await init.driver.getPageSource()));
        root.querySelectorAll('#tabResult').forEach(function(table){
            table.querySelectorAll('tr').forEach(function(elem){
                var td_elem = elem.querySelector('td');
                var span_title = td_elem.querySelector('.txtTit').innerText;
                var span_quantity = td_elem.querySelector('.Rqtd').innerText;
                var replace_qtd = span_quantity.replace('Qtde.:', '');

                arr_description.push(span_title);
                arr_quantity.push(replace_qtd);
            });
        });

        resolve({
            arr_description: arr_description,
            arr_quantity: arr_quantity
        });
    });
}

exports.startScript = startScript;
