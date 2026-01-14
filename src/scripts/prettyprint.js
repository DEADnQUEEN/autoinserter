const verticalSep = " | "

export function pretty_print(array_2d) {
    if (array_2d.length === 0) { 
        return ""
    }
    var column_widths = []

    for (var col = 0; col < array_2d[0].length; col++) {
        column_widths.push(array_2d[0][col].length)
    }

    for (let row = 1; row < array_2d.length; row++) {
        for (var col = 0; col < array_2d[row].length; col++) {
            if (col >= column_widths.length) {
                throw "Exception: Out of range"
            }
            
            if (array_2d[row][col].length > column_widths[col]) {
                column_widths[col] = array_2d[row][col].length
            }
        }
    }

    var text = ""

    for (let row = 0; row < array_2d.length; row++) {
        text +=  array_2d[row][0]

        for (let space = array_2d[row][0].length; space < column_widths[0]; space++) {
            text += " "
        }

        for (var col = 1; col < array_2d[row].length; col++) {
            text += verticalSep + array_2d[row][col]

            for (let space = array_2d[row][col].length; space < column_widths[col]; space++) {
                text += " "
            }
        }
        text += "\n"
    }

    return text
}