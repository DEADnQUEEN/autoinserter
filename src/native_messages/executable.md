# Executable for manifest

required for stdio messaging

## Command

```bash
cd "dir_with_pyfile_for_actions"
pyinstaller -y --onefile /message_api.py
```

### Help

1. pyinstaller ust be installed in your machine
2. for cleanner build:
   1. create any dir
   2. use that dir as build folder (to collect all files required for builds and outputs, like dist and spec)
   3. set relative path for .py
