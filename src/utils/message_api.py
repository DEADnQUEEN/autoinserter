import sys
from typing import Any
import msvcrt
import os
import json
import struct


msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)


def get_data():
    length = struct.unpack('=I', sys.stdin.buffer.read(4))[0]
    return json.loads(sys.stdin.buffer.read(length))


def write(status_code, content: dict[str, Any]):
    encoded = json.dumps({"status": status_code, **content}).encode()
    sys.stdout.buffer.write(struct.pack('=I', len(encoded)))
    sys.stdout.buffer.write(encoded)
    sys.stdout.buffer.flush()
    
    encoded = json.dumps({}).encode()
    sys.stdout.buffer.write(struct.pack('=I', len(encoded)))
    sys.stdout.buffer.write(encoded)
    sys.stdout.buffer.flush()


def write_response(data):
    write(200, {"response": data})


def write_app_error(exception: Exception):
    write(500, {"error": str(exception)})


def write_user_error(error_text: str):
    write(400, {"error": error_text})
