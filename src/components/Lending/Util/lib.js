export function fixNumber(number = 0,numLength = 4) {
    let length = number.toString()
    let num = '0.'
    if (length.indexOf('.') === -1) {
        return number
    }
    length = length.split('.')[1].length < numLength ? numLength : length.split('.')[1].length
    for (var i=0; i<length; i++) {
        num += '0'
    }
    num += '1'
    return Math.floor((Number(number) + Number(num)) * Math.pow(10,numLength)) / Math.pow(10,numLength)
}

