var container = document.querySelector("div.rk-download")

var collect_documents = document.createElement("a")
collect_documents.textContent = "Скачать со страниц"
collect_documents.href = "#"

collect_documents.onclick = async () => {exportJsonToExcel(await collect_data_from_pages(await collect_pages_urls(), collect_data), undefined, "Выгрузка_ЛМ")}

container.appendChild(collect_documents)
container.style.cssText = "display: flex; flex-direction: column;"

var collect_review_el = document.createElement("a")
collect_review_el.textContent = "Выгрузить отзывы"
collect_review_el.href = "#"

collect_review_el.onclick = async () => {
    collect_review_el.textContent = "Загрузка..."

    let dataset = await collect_data_from_pages(await collect_pages_urls(), collect_review)

    collect_review_el.textContent = "Выгрузка..."

    let resp = await chrome.runtime.sendMessage(
        {
            type: 'native-messaging',
            app: "com.python.export_excel",
            data: dataset
        }
    )

    collect_review_el.textContent = "Выгрузить отзывы"

    if (resp.status === 200) {
        let empty_list = resp.response.empty

        if (empty_list.length > 0) {
            var text = "Количество не установленных отзывов - "+empty_list.length+"\nНомера заказов без отзывов: "
            let empty = []
            for (let i = 0; i < empty_list.length; i++) {
                empty.push(empty_list[i]["№ заказа в Руках"])
            }
            text += empty.join("; ")

            alert(text)
        } else {
            alert("Все отзывы проставленны")
        }
    } else if (resp.status === 400) {
        alert(resp.error)
    } else if (resp.status === 500) {
        alert("Внутрненняя ошибка скрипта")
        console.log(resp)
    }
}

container.appendChild(collect_review_el)
