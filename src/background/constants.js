export const order_query = "div[name='order_num'] input"

// get date by "value" property
export const selector_to_input = {
    "№ заказа":                 order_query,
    "Дата поступления заявки":  "div[name='date_order'] input",
    "ФИО клиента":              "div[name='client_fio'] input",
    "Телефон":                  "div[name='client_contacts'] input",
    "Координаты адреса":        "div[name='address_point'] input",
    "Дата сборки":              "div[name='date_plan1'] input",
    "Комментарии":              "div[name='notes'] textarea",
    "Сумма с акта":             "div[name='sum_order'] input",
}

export const magazine_types = {
    "РШ": "шш",
    "СЗ": "селезнева"
}

export const rows_sel = "div[id^='h2-gr1nw-'"
export const headers_sel = "div[id^='gr1nw-hcol'"
export const last_row_sel = "#gr1nw > div.gz_summary > div:nth-child(2) > div"

export const address_parts = {
    "подьезд": "div[name='addr_entrance'] input",
    "этаж": "div[name='addr_floor'] input",
    "код": "div[name='addr_entcode'] input",
    "кв.": "div[name='addr_flat'] input"
}

export const addr_sep = ", "
export const address_selector = "div[name='address'] input"

export const master_rows_query = ".gz_n.row-gr2[id^='h2']"
export const master_name_query = "div.gz_cl.gr2-col1"

export const masters_exist_query = master_rows_query + ", #gr2 div.gzEmpNote"

