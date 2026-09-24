import json
import sys

"""Fake stdio host for backend tests: answers the line-delimited JSON protocol."""

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    msg = json.loads(line)
    op = msg.get("op")
    if op == "boot":
        print(json.dumps({"event": "ready"}), flush=True)
    elif op == "play":
        print(json.dumps({"event": "playing"}), flush=True)
    elif op == "capture":
        print(json.dumps({"event": "captured", "path": msg.get("path")}), flush=True)
    elif op == "shutdown":
        print(json.dumps({"event": "bye"}), flush=True)
        break
