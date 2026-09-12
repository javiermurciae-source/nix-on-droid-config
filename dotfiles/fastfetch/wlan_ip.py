#!/usr/bin/env python3
import socket
import fcntl
import struct

def get_wlan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        ip = socket.inet_ntoa(fcntl.ioctl(s.fileno(), 0x8915, struct.pack("256s", b"wlan0"))[20:24])
        return f"wlan0: {ip}"
    except Exception:
        pass

    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return f"wlan0: {ip}"
    except Exception:
        return "wlan0: sin conexion"

if __name__ == "__main__":
    print(get_wlan_ip())

