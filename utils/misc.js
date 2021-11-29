
function getDateFormated(date_string) {
    var full_date = date_string.split(' ');
    var date = full_date[0].split('/');
    return date[2] + '-' + date[1] + '-' + date[0];
}

function searchDateInStrings(string) {
    return string.match(/\d{2}([\/.-])\d{2}\1\d{4}/g);
}

module.exports = {getDateFormated, searchDateInStrings}