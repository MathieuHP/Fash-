export const toBackendTitle = (text) => {
    let textChanged = text
    textChanged = lower(textChanged)
    textChanged = text.replace(" ", "_")
    return textChanged
}

export const tofrontendTitle = (text) => {
    let textChanged = text
    textChanged = text.replace("_", " ")
    textChanged = upper(textChanged)
    return textChanged
}

function upper(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    return splitStr.join(' '); 
}

function lower(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toLowerCase() + splitStr[i].substring(1);     
    }
    return splitStr.join(' '); 
}