const to = require("../gree/nfc/to");
const ma = require("../gree/nfc/ma");
const ba = require("../gree/nfc/ba");
const pa = require("../gree/nfc/pa");
const all = require("../gree/nfc/all");

async function startRobotNFCe(init) {

    switch (init.state.toUpperCase()) {
		/* UFs */
		case "AC" :	return await pa.startScript(init);
		case "AL" :	return await pa.startScript(init);
		case "AM" :	return await pa.startScript(init);
		case "AP" :	return await pa.startScript(init);
		case "BA" :	return await ba.startScript(init);
		case "CE" :	return await pa.startScript(init);
		case "DF" :	return await pa.startScript(init);
		case "ES" :	return await pa.startScript(init);
		case "GO" :	return await pa.startScript(init);		
		case "MA" :	return await pa.startScript(init);
		case "MG" :	return await pa.startScript(init);
		case "MS" :	return await pa.startScript(init);
		case "MT" :	return await pa.startScript(init);
		case "PA" :	return await pa.startScript(init);
		case "PB" :	return await pa.startScript(init);	
		case "PE" :	return await pa.startScript(init);
		case "PI" :	return await pa.startScript(init);		
		case "PR" :	return await pa.startScript(init);	
		case "RJ" :	return await pa.startScript(init);		
		case "RN" :	return await pa.startScript(init);	
		case "RO" :	return await pa.startScript(init);	
		case "RR" :	return await pa.startScript(init);	
		case "RS" :	return await pa.startScript(init);		
		case "SC" :	return await pa.startScript(init);		
		case "SE" :	return await pa.startScript(init);	
		case "SP" :	return await pa.startScript(init);	
		case "TO" :	return await to.startScript(init);	
		case "ALL": return await all.startScript(init);	
        default   : return {"status": "error", "msg": "Estado não foi encontrado para execução do script."};                
    }
}

exports.startRobotNFCe = startRobotNFCe;