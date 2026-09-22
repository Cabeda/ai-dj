"""Minimal OSC (Open Sound Control) encode/decode, stdlib only.

Just the subset Sonic Pi's headless daemon needs: int32, float32, string,
blob, and the basic message framing.
"""

import struct

_ALIGN = 4


def _pad(data: bytes) -> bytes:
    rem = len(data) % _ALIGN
    return data + (b"\x00" * (_ALIGN - rem) if rem else b"")


def _pack_string(s: str) -> bytes:
    return _pad(s.encode("utf-8") + b"\x00")


def encode(address: str, *args) -> bytes:
    tags = ","
    body = b""
    for a in args:
        if isinstance(a, bool):
            tags += "T" if a else "F"
        elif isinstance(a, int):
            tags += "i"
            body += struct.pack(">i", a)
        elif isinstance(a, float):
            tags += "f"
            body += struct.pack(">f", a)
        elif isinstance(a, str):
            tags += "s"
            body += _pack_string(a)
        elif isinstance(a, bytes):
            tags += "b"
            body += struct.pack(">i", len(a)) + _pad(a)
        else:
            raise TypeError(f"unsupported OSC arg: {a!r}")
    return _pack_string(address) + _pack_string(tags) + body


def _read_string(data: bytes, i: int):
    end = data.index(b"\x00", i)
    s = data[i:end].decode("utf-8", "replace")
    consumed = end + 1
    rem = consumed % _ALIGN
    if rem:
        consumed += _ALIGN - rem
    return s, consumed


def decode(data: bytes):
    address, i = _read_string(data, 0)
    if i >= len(data):
        return address, []
    tags, i = _read_string(data, i)
    if not tags.startswith(","):
        return address, []
    args = []
    for t in tags[1:]:
        if t == "i":
            args.append(struct.unpack(">i", data[i:i + 4])[0]); i += 4
        elif t == "f":
            args.append(struct.unpack(">f", data[i:i + 4])[0]); i += 4
        elif t == "s":
            s, i = _read_string(data, i)
            args.append(s)
        elif t == "b":
            n = struct.unpack(">i", data[i:i + 4])[0]; i += 4
            blob = data[i:i + n]
            i += n
            rem = n % _ALIGN
            if rem:
                i += _ALIGN - rem
            args.append(blob)
        elif t in ("T", "F"):
            args.append(t == "T")
    return address, args
