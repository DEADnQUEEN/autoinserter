try:
    import sys
    import os
    import tkinter as tk
    from tkinter import filedialog

    sys.path.insert(1, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(sys.argv[0]))), "utils", "com_excel"))
    from functions import editors, filters

    sys.path.insert(1, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(sys.argv[0]))), "utils"))

    import com_excel.wrap as wrap
    import message_api

    import win32com.client
    from typing import Any, Optional
    import datetime

except Exception as e:
    raise e


DATA_DATE_COLUMN = "дата поступления заказа"


def convert_to_datetime(value: str):
    if not isinstance(value, str):
        raise Exception
    
    return datetime.datetime.strptime(str(value).split(" ", 1)[0], "%Y-%m-%d")


def parse_date(value: str) -> str:
    try:
        return convert_to_datetime(value).strftime("%d-%m-%Y")
    except Exception:
        return value


def digit_to_string(value): 
    if isinstance(value, (int, float)):
        return f"{int(value)}"
    return value


def get_data_sheet(wb):
    return wrap.Sheet(
        [
            wrap.Column(
                "D",
                start=6,
                rename="date",
                stop_if_null=True,
                skip_if_null=False,
                edit_value=[
                    lambda value: parse_date(str(value))
                ]
            ),

            wrap.Column("E", start=6, rename="kichen_type", stop_if_null=False, skip_if_null=False, edit_value=[
                lambda v: f"{v}"
            ]),
            wrap.Column("G", start=6, rename="order_id", stop_if_null=False, skip_if_null=False, edit_value=[
                digit_to_string
            ]),
        ],
        wb.Worksheets("ЛМ"),
        index_column=True,
        start_from=6
    )

def collect_rows(sheet):
    values = []
    for row in sheet:
        row["orderId_kichenType"] = f'{str(row["order_id"]).strip().lower()}-{str(row["kichen_type"]).strip().lower()}'
        values.append(row)

    return values


def write_reviews(wb, data_array):
    sheet = wrap.Sheet(
        [
            wrap.Column("Z", start=6, rename="Отзыв"),
            wrap.Column("AA", start=6, rename="Комментарий"),
        ],
        wb.Worksheets("ЛМ"),
        start_from=6
    )

    for data in data_array:
        review, row = data
        sheet.write(
            row['index'],
            [review]
        )
        pass


month_dict = {
    month: f"{i+1}"
    for i, month in enumerate([
        "января",
        "февраля",
        "марта",
        "апреля",
        "мая",
        "июня",
        "июля",
        "августа",
        "сентября",
        "октября",
        "ноября",
        "декабря",
    ])
}


def parse_data(data: list[dict[str, any]]) -> list[dict[str, any]]:
    for i in range(len(data)):
        data[i]["orderId_kichenType"] = f"{str(data[i]['№ заказа в Руках']).strip().lower()}-{str(data[i]['Тип кухни']).strip().lower()}"

    return data


def find_same(same_field, items: list[dict[str, any]], in_group: list[dict[str, any]]):
    same_items = []
    not_found = []
    for item_1 in items:
        item_same_field = item_1.get(same_field)
        if item_same_field is None:
            raise Exception

        for item_2 in in_group:
            if item_same_field == item_2.get(same_field):
                same_items.append([item_1, item_2])
                break
        else:
            not_found.append(item_1)

    return same_items, not_found


def main():
    data = message_api.get_data()

    parsed_data = parse_data(data['data'])

    root = tk.Tk()
    root.withdraw()

    filename = filedialog.askopenfilename(filetypes=[("Excel files", ".xlsx .xls .xlsm")])

    if filename == "":
        message_api.write_user_error("Не найден лист для добавления данных")
        return 
    try:
        excel = win32com.client.Dispatch("Excel.Application")
        excel.Visible = True
        wb = excel.Workbooks.Open(filename)
    except Exception as e:
        message_api.write_user_error("Ошибка открытия файла, проверьте правильно ли выбран файл")
        raise e

    try:
        sheet = get_data_sheet(wb)
    except Exception as e:
        message_api.write_user_error("Ошибка выбранного листа. Проверьте лист")
        raise e

    try:
        excel_data = collect_rows(sheet)
    except Exception as e:
        message_api.write_user_error("Ошибка выбранного листа. проверьте названия строк\листа")
        raise e

    data["same"], data['empty'] = find_same("orderId_kichenType", parsed_data, excel_data)
    data['excel'] = excel_data

    write_reviews(wb, data['same'])

    message_api.write_response(data)


try:
    main()
except Exception as e:
    import traceback
    message_api.write_app_error(f"{traceback.format_exc()}")
