const misc = require('../../../utils/misc');
const urls = require('../../../utils/urls');
const domParse = require('../../../utils/domParse');
const avaible = require('../../../utils/verifyAvaible');
const recaptch = require('../../../utils/anti-recaptch');
const {Builder, By, Key, until} = require('selenium-webdriver');
const moment = require('moment');
var url = urls.states.PA;
var init = null;
var parts_escraping = null;
var isResolve;

// Principal dados do site
var keyElemRecaptcha = "6LcPrHYUAAAAAFc6TCjw0pq2qDKQ3dzHHlqOh3J9";


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

    init.driver.findElement(By.id('ChaveAcessoDfe')).then((result) => {
        result.sendKeys("value", init.row.key);

        setTimeout(function () {
            init.robot.moveMouse(186, 590);
            init.robot.mouseClick();
            console.log('Clicou no recaptch!');
            setTimeout(function () {
                console.log('Consultou api do recaptch!');
                recaptch.solveCreateRecaptcha({
                    type: "RecaptchaV2TaskProxyless",
                    websiteURL: url,
                    websiteKey: keyElemRecaptcha
                }).then((result) => {

                    var gRecaptchaResponse = result.solution.gRecaptchaResponse;
                    var elem = 'document.getElementById("recaptchaValor").value ="'+gRecaptchaResponse+'"';
                    var click = 'document.querySelector(".btn-primary").click();';
                    setTimeout(async () => {
                        await init.driver.executeScript(elem);
                        setTimeout(async () => {
                            await init.driver.executeScript(click);
                            setTimeout(async function() {
                                let error = await init.driver.executeScript('return document.getElementsByClassName("field-validation-error").length');
                                if (error > 0) {
                                    let errorText = await init.driver.executeScript('return document.getElementsByClassName("field-validation-error")[0].innerText');
                                    isResolve({status:'retry'});
                                } else {
                                    // Verifica se o elemento está pronto
                                    init.driver.findElement(By.id('NFe')).then(() => {
                                        inSidePanel();
                                    }).catch(() => {
                                        isResolve({status:'retry'});
                                    })
                                }
                            }, 3000);
                        }, 500);
                    }, 500);        
                }).catch((error) => {
                    console.log(error);
                    isResolve({status:'retry'});
                });
            }, 3000);
        }, 5000);


    }).catch((e) => {
        isResolve({status:'retry'});
    });
    
}

async function inSidePanel() {
    var parse_config = JSON.parse(init.row.config);
    console.log('Começando o scraping...');
    setTimeout(async () => {
        init.driver.findElement(By.css('table')).then((table) => {
            table.findElements(By.css('td')).then((tds) => {
                tds.forEach(async (td, index) => {
                    if (index == 3) {
                        var date_string = await td.getText();
                        var arr_date = misc.searchDateInStrings(date_string);
                        var date_emission = arr_date[0];

                        if (parse_config.start_date && parse_config.final_date) {

                            if (moment(misc.getDateFormated(date_emission)).isBetween(parse_config.start_date, parse_config.final_date)) {
                                executeScrapingPartsNfe().then((result) => {
                                    parts_escraping = result;
                                    console.log('Produtos existe e está enviando requisição...');
                                    executeScrapingNfeUpdate(date_emission);
                                });
                            } else {
                                isResolve({status:'error', msg: 'Nota fiscal não está entre a data inicial e final de busca'});
                            }
                        } else {
                            executeScrapingPartsNfe().then((result) => {
                                parts_escraping = result;
                                console.log('Produtos existe e está enviando requisição...');
                                executeScrapingNfeUpdate(date_emission);
                            });
                        }
                    }
                });
            }).catch(() => {
                isResolve({status:'retry'});
            });
        }).catch(() => {
            isResolve({status:'retry'});
        });
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

        await init.driver.executeScript("document.querySelector('#bodyPricipal > div.wrapper__corpo > div > div > div.col-sm-offset-1.col-md-8.col-md-offset-0.coluna-principal > div > div > div > article > div > div > div > div.dfe-tab > ul > li:nth-child(4) > a').click();");
        setTimeout(async () => {

            let description_class = await init.driver.findElements(By.className('fixo-prod-serv-descricao'));
            for(let e of description_class) {
                if(await e.getText() != 'Descrição') {
                    arr_description.push(await e.getText());
                }
            }

            let quantity_class = await init.driver.findElements(By.className('fixo-prod-serv-qtd'));
            for(let e of quantity_class) {
                if(await e.getText() != 'Qtd.') {
                    arr_quantity.push(await e.getText());
                }
            }

            resolve({
                arr_description: arr_description,
                arr_quantity: arr_quantity
            });
        }, 2000);     
        
    });
}

exports.startScript = startScript;
