import sys
import os
import tkinter as tk
from tkinter import filedialog


sys.path.insert(1, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(sys.argv[0]))), "utils"))
import message_api # type: ignore
import com_excel # type: ignore


def main():
    data = message_api.get_data()

    root = tk.Tk()
    root.withdraw()

    data["ff"] = filedialog.askopenfilename(filetypes=["*.xlsx"]) # type: ignore

    message_api.write_response(data)


try:
    main()
except Exception as e:
    message_api.write_error(e)
