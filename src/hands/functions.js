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

function collect_data(dom) {
     let obj = {}

    var content = dom.querySelector("body > div.rk-body > div > section").querySelectorAll("div > span")
    for (let j = 0; j < content.length; j += 2) {
        var key = content[j].textContent.replaceAll(/\n\s+/g, "")
        var rename = renames[key]
        if (rename !== undefined) {
            key = rename
        }
        
        var value = content[j + 1]
        if (value === undefined || value === null) {
            value = ""
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

function parse_review(obj) {
    let comment = obj[mark_key].replace(rate_regex, "")
    if (comment.length > 0) {
        before_comment = obj[comment_key]
        if (before_comment === undefined) {
            obj[comment_key] = comment
        } else {
            obj[comment_key] = before_comment + " " + comment
        }
    }

    obj[mark_key] = obj[mark_key].match(number_regex)[0]

    return obj
}


function collect_review(dom) {
    let objs = collect_data(dom)
    if (objs.length === 0) {
        return []
    }

    var obj = objs[0]
    let filtered_obj = {}

    for (let i = 0; i < review.length; i++) {
        var value = obj[review[i]]
        if (value === undefined) {
            return []
        }
        filtered_obj[review[i]] = value
    }

    filtered_obj = parse_review(filtered_obj)

    return [filtered_obj]
}


async function collect_data_from_pages(urls, collect_function) {
    var data = []
    for (let i = 0; i < urls.length; i++) {
        data.push(...await fetch(
            urls[i]
        ).then(
            (response) => {return response.text()}
        ).then(
            (text) => {
                return collect_function(new DOMParser().parseFromString(text, 'text/html'))
            }
        ))
    }

    return data
}


function collect_page_urls(dom) {
    let tableBody = dom.querySelector("table.rk-table > tbody")
    if (tableBody === null) {
        return []
    }

    let rows = tableBody.querySelectorAll("tr.rk-table__row");
    let urls = []
    for (let i = 0; i < rows.length; i++) {
        urls.push("https:"+rows[i].getAttribute("onclick").match(/\'(\/\/hands\.ru\/web-backoffice\/order\/.+)\'/)[1])
    }

    return urls
}


async function collect_pages_urls() {
    var pages = document.querySelector(".rk-pages").querySelectorAll("a")

    var page_urls = collect_page_urls(document)
    for (let i = 0; i < pages.length; i++) {
        page_urls.push(
            ...await fetch(
                pages[i].href
            ).then(
                (response) => {return response.text()}
            ).then(
                (text) => {
                    return collect_page_urls(new DOMParser().parseFromString(text, 'text/html'))
                }
            )
        )
    }

    return page_urls
}
