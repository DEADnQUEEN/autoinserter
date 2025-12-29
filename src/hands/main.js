const urlAdress = "Адрес_ссылка"

const renames = {
    "Создан": "дата поступления",
    "ФИО клиента": "ФИО",
    "Телефоны клиента": "номер телефона",
    "Стоимость": "Оплата в магазине клиентом",
    "Время работы": "дата"
}

var el = document.createElement("a")
el.textContent = "Скачать все"
el.href = "#"

el.onclick = async () => {
    let rows = document.querySelector("table.rk-table > tbody").querySelectorAll("tr.rk-table__row");
    let output = []

    for (let i = 0; i < rows.length; i++) {
        var url = "https:"+rows[i].getAttribute("onclick").match(/\'(\/\/hands\.ru\/web-backoffice\/order\/.+)\'/)[1]
        
        output.push(await fetch(
            url
        ).then(
            (response) => {return response.text()}
        ).then(
            (text) => {
                var dom = new DOMParser().parseFromString(text, 'text/html')
                var obj = {}
                var content = dom.querySelectorAll("body > div.rk-body > div > section:nth-child(6) > div > span")
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

                return obj
            }
        ))
    }

    exportJsonToExcel(output)
}

var container = document.querySelector("div.rk-download")

container.appendChild(el)
container.style.cssText = "display: flex; flex-direction: column;"
