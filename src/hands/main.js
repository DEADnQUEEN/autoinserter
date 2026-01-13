function filterShop(content_object) {
    if (content_object === null || content_object === undefined) {
        return null
    }

    let shop = content_object[shop_field]
    if (shop === undefined) {
        return null
    }

    let rename = shop_renames[shop.trim()]

    if (rename === undefined || rename === null) {
        return null
    }
    content_object[shop_field] = rename
    
    return content_object
}

function setType(content) {
    if (content === null || content === undefined) {
        return null
    }

    var content_type = types[content[type_field_get].split(" ", 1)[0]]
    if (content_type === undefined) {
        return null
    }

    for (let i = 0; i < calc_types.length; i++) {
        calc_type_check = calc_types[i]
        if (content[type_field_get].includes(calc_type_check)) {
            content[type_field_set] = calc_type
            return content
        }
    }

    content[type_field_set] = content_type

    return content
}

function cloneCompensation(content) {
    var compensationProp = null
    for (var prop in content) {
        if (prop.includes(compensation)) {
            compensationProp = prop
            break
        }
    }

    if (compensationProp === null) {
        return [content]
    }

    var order_row = {}
    var compensation_row = {}
    for (var prop in content) {
        if (prop === compensationProp){
            continue
        }
        compensation_row[prop] = content[prop]
        order_row[prop] = content[prop]
    }

    compensation_row[priceColumn] = content[compensationProp]
    if (compensation_row[type_field_set] === calc_type) {
        compensation_row[type_field_set] = "компенсация замер"
    } else {
        compensation_row[type_field_set] = "компенсация"
    }


    return [order_row, compensation_row]
}

var el = document.createElement("a")
el.textContent = "Скачать на странице"
el.href = "#"

el.onclick = async () => {
    let rows = document.querySelector("table.rk-table > tbody").querySelectorAll("tr.rk-table__row");
    let output = []

    for (let i = 0; i < rows.length; i++) {
        var url = "https:"+rows[i].getAttribute("onclick").match(/\'(\/\/hands\.ru\/web-backoffice\/order\/.+)\'/)[1]
        
        output.push(...await fetch(
            url
        ).then(
            (response) => {return response.text()}
        ).then(
            (text) => {
                var dom = new DOMParser().parseFromString(text, 'text/html')
                var obj = {}
                var content = dom.querySelector("body > div.rk-body > div > section").querySelectorAll("div > span")
                for (let j = 0; j < content.length; j += 2) {
                    var value = content[j + 1]
                    if (value === undefined || value === null) {
                        value = ""
                    }

                    var key = content[j].textContent.replaceAll(/\n\s+/g, "")
                    var rename = renames[key]
                    if (rename !== undefined) {
                        key = rename
                    }

                    obj[key] = value.textContent.replaceAll(/\n\s+/g, ". ").replace(/^\.\s/gm, "").replace(/$\.\s/gm, "").replaceAll(/\.+/gm, ".")
                }

                obj[urlAdress] =  dom.querySelector("span.order-address > a").href
                
                obj = setType(obj)
                obj = filterShop(obj)

                if (obj === null) {
                    return []
                }
 
                return cloneCompensation(obj)
            }
        ))
    }

    exportJsonToExcel(output)
}

var container = document.querySelector("div.rk-download")

container.appendChild(el)
container.style.cssText = "display: flex; flex-direction: column;"
