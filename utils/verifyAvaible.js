const axios = require('axios');
var loopAvaibilitySefaz = null;

async function verifyAvaibility(url) {
    return new Promise((resolve) => {
        axios.get(url)
        .then(function (response) {
            console.log('Sefaz disponível');
            resolve(true);
        }).catch(function (error) {
            console.log('Sefaz indisponível, verificando...');
            loopAvaibilitySefaz = setInterval(() => {
                axios.get(url)
                .then(function (response) {
                    console.log('Sefaz disponível');
                    clearInterval(loopAvaibilitySefaz);
                    resolve(true);
                }).catch(function (error) {
                    console.log('Sefaz indisponível, verificando...');
                });
            }, 180000);
        });
    });    
}

exports.verifyAvaibility = verifyAvaibility;