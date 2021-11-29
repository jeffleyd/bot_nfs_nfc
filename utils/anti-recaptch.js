const axios = require('axios');
var isResolver;
var isReject;
var recaptchaTaskId;

async function solveCreateRecaptcha(task_object) {

    return new Promise(async (resolve, reject) => {
        await axios.post('https://api.anti-captcha.com/createTask',{
            clientKey: "63510246f40047a065bed12aa714948f", //gree
            task: task_object
        }).then(function (response) {
            recaptchaTaskId = response.data.taskId;
            isResolver = resolve;
            isReject = reject;
            solveResultRecaptcha();
            console.log('Criou tarefa do recaptch!');
        }).catch(function (error) {
            console.log(error);
            reject(error);
        });
    });
}

async function solveResultRecaptcha() {
    await axios.post('https://api.anti-captcha.com/getTaskResult',{
        clientKey: "63510246f40047a065bed12aa714948f",
        taskId: recaptchaTaskId
    }).then(function (response) {
        console.log('req do recaptcha: '+ JSON.stringify(response.data));
        if (response.data.errorId == 1) {
            solveResultRecaptcha();
        } else if (response.data.errorId == 0 && response.data.status == "processing") {
            console.log('Recaptch processando, aguardando...');
            setTimeout(() => {
                solveResultRecaptcha(); 
            }, 2000);
        } else {
            if (typeof response.data.solution != 'undefined') {
                isResolver(response.data);
            } else {
                isReject(response);
            }
        }
    }).catch(function (error) {
        console.log(error);
        isReject(error);
    });
}

exports.solveCreateRecaptcha = solveCreateRecaptcha;