import {
    rows_sel,
    headers_sel,
    last_row_sel,
    addr_sep,
    address_selector,
    master_rows_query,
    master_name_query,
    magazine_types,
    address_parts,
    order_query,
    masters_exist_query
} from "./constants.js"

import { 
    pretty_print 
} from "../scripts/prettyprint.js"


export const get_value_from_input = (el) => {return el.value}


async function get_magazine_type(page) {
    await page.waitForSelector(order_query)

    var order = await page.$eval(
        order_query, 
        get_value_from_input
    )

    for (var magazine_type in magazine_types) {
        if (order.includes(magazine_type)) {
            return magazine_types[magazine_type]
        }
    }

    return null
}


async function concat_order_content(page) {
    await page.waitForSelector(rows_sel)
    await page.waitForSelector(headers_sel)
    
    let rows = await page.$$eval(
        rows_sel, 
        (elements) => {
            var table_data = []

            for (let i = 0; i < elements.length; i++) {
                var row_array = []
                var row = elements[i].querySelectorAll("div")

                for (let j = 0; j < row.length; j++) {
                    row_array.push(row[j].textContent)
                }
                table_data.push(row_array)
            }

            return table_data
        }
    )
    
    let lines = await page.$$eval(
        headers_sel, 
        (elements) => {
            var head_array = []

            for (let i = 0; i < elements.length; i++) {
                head_array.push(elements[i].textContent)
            }

            return [head_array]
        }
    )

    for (let i = 0; i < rows.length; i++) {
        lines.push(rows[i])
    }

    await page.waitForSelector(last_row_sel)
    let last_row = await page.$$eval("#gr1nw > div.gz_summary > div:nth-child(2) > div", (els) => {
        return ["Итого: " + els[els.length-1].textContent]
    });

    lines.push(last_row)
    
    return lines
}


async function get_address(page) {
    await page.waitForSelector(address_selector)

    var address = await page.$eval(address_selector, get_value_from_input)

    for (var part in address_parts) {
        await page.waitForSelector(address_parts[part])
        var part_content = await page.$eval(address_parts[part], get_value_from_input)
        
        if (part_content.length > 0) {
            address += addr_sep + part + " " + part_content
        }
    }

    return address
}


async function get_all_masters(page) {
    await page.waitForSelector(masters_exist_query)
    
    if (
        await page.evaluate(
            (master_name_query) => {
                return document.querySelectorAll(master_name_query).length === 0
            },
            master_name_query
        )
    ) {
        return ""
    }

    return await page.evaluate(
        (master_name_query, master_rows_query) => {
            let elements = document.querySelectorAll(master_rows_query)
            var master_array = []
            for (let i = 0;i < elements.length; i++) {
                master_array.push(elements[i].querySelector(master_name_query).innerText.split("\n", 1)[0])
            }
            
            if (master_array.length === 0) {
                return ""
            }

            let text = master_array[0]

            for (let i = 1; i < master_array.length; i++) {
                text += ", " + master_array[i]
            }

            return text
        },
        master_name_query,
        master_rows_query
    )
}


export const function_fields = {
    "Магазин": get_magazine_type,
    "Состав заказа": async (page) => {return pretty_print(await concat_order_content(page))},
    "АДРЕС": get_address,
    "ФИО мастера": get_all_masters,
}