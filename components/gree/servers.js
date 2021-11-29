
let list = [
	1
]

function nextServerExec(index) {
	if (typeof list[index] != "undefined") {
		return {id: list[index], next: index+1};
	} else {
		return {id: list[0], next: 0};
	}
}

exports.nextServerExec = nextServerExec;