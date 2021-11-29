var states = {"11": "RO","12": "AC","13": "AM","14": "RR","15": "PA","16": "AP",
    "17": "TO","21": "MA","22": "PI","23": "CE","24": "RN","25": "PB","26": "PE",
    "27": "AL","28": "SE","29": "BA","31": "MG","32": "ES","33": "RJ","35": "SP",
    "41": "PR","42": "SC","43": "RS","50": "MS","51": "MT","52": "GO","53": "DF"
};

var model = {"55": "NFe","57": "CTe","58": "MDFe","65": "NFCe"}

async function createObjectKey(key) {

    return new Promise((resolve, reject) => {

        var fomart_key = key.trim();
        var ckey = fomart_key.replace(/\.|\-/g, '');

        if (ckey.length != 44)
            reject("Chave inválida, comprimento da chave deve ser 44.");
         
        const kstate = ckey.slice(0, 2);
        if (typeof states[kstate] == 'undefined')
            reject("Chave inválida, não foi possível encontrar o estado.");

        const kmodel = ckey.slice(20, 22);
        if (typeof model[kmodel] == 'undefined')
            reject("Chave inválida, não foi possível encontrar o modelo da chave.");


        resolve({
            'state': states[kstate],
            'model': model[kmodel],
        });
    });
}

exports.createObjectKey = createObjectKey;