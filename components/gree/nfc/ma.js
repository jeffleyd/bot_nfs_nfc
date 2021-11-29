const misc = require('../../../utils/misc');
const urls = require('../../../utils/urls');
const domParse = require('../../../utils/domParse');
const avaible = require('../../../utils/verifyAvaible');
const recaptch = require('../../../utils/anti-recaptch');
const {Builder, By, Key, until} = require('selenium-webdriver');
const moment = require('moment');
var url = urls.states.AM;
var init = null;
var parts_escraping = null;
var isResolve;
var inSideLayoutIsReady;

// Principal dados do site
var keyElemRecaptcha = "6LdRgSITAAAAAMQ0sWgEstSOfb674al7nPIBVxyZ";


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

    init.driver.findElement(By.id('j_idt46')).then((result) => {
        result.sendKeys("value", init.row.key);

        setTimeout(function () {
            init.robot.moveMouse(650, 431);
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
                    var elem = 'document.getElementById("g-recaptcha-response").innerHTML="'+gRecaptchaResponse+'"';
                    var click = 'document.getElementById("form:j_id_1u").click();'
                    setTimeout(async () => {
                        await init.driver.executeScript(elem);
                        setTimeout(async () => {
                            init.driver.executeScript(click);
                            setTimeout(async function() {
                                let error = await init.driver.executeScript('return document.getElementsByClassName("ui-messages-error-detail").length');
                                if (error > 0) {
                                    let errorText = await init.driver.executeScript('return document.getElementsByClassName("ui-messages-error-detail")[0].innerText');
                                    isResolve({status:'retry'});
                                } else {
                                    // Verifica se o elemento está pronto
                                    init.driver.findElement(By.id('j_id_19:painelResumida')).then(() => {
                                        inSidePanel();
                                    }).catch(() => {
                                        isResolve({status:'retry'});
                                    })
                                }
                            }, 3000);
                        }, 500);
                    }, 500);        
                }).catch((error) => {
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

        var rows = await init.driver.findElement(By.xpath('//*[@id="j_id_19:j_id_2o:j_id_2p"]/table/tbody/tr[4]/td[2]'));
        var date_emission = await rows.getText();

        if (parse_config.start_date && parse_config.final_date) {

            if (moment(misc.getDateFormated(date_emission)).isBetween(parse_config.start_date, parse_config.final_date)) {
                parts_escraping = await executeScrapingPartsNfe();    
            } else {
                isResolve({status:'error', msg: 'Nota fiscal não está entre a data inicial e final de busca'});
            }   
        } else {
            parts_escraping = await executeScrapingPartsNfe();
        }  

        console.log('Produtos existe e está enviando requisição...');
        executeScrapingNfeUpdate(date_emission);
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

    var arr_description = [];
    var arr_quantity = [];

    var root = domParse.dom(String(await init.driver.getPageSource()));
    root.querySelectorAll('.ui-tooltip').forEach(function(elem){
        arr_description.push(elem.innerText);
    });

    var table = root.querySelector('table').toString();
    var root_table = domParse.dom(table);
    root_table.querySelectorAll('tr').forEach(function(elem){
        elem.querySelectorAll('td').forEach(function(td, index){
            if (index == 2 ) {
                var td_text = td.innerText;
                var only_number = td_text.replace("Quant.", "");
                arr_quantity.push(only_number);
            }
        })
        
    });

    obj_ret = {
        arr_description: arr_description,
        arr_quantity: arr_quantity
    }
    return obj_ret;
}

exports.startScript = startScript;
