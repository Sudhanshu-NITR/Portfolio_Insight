import time, uuid

class StepTimer:
    def __init__(self, label: str, req_id: str | None = None):
        self.label = label
        self.req_id = req_id or str(uuid.uuid4())[:8]
        self.t0 = None
    def start(self, msg: str):
        self.t0 = time.time()
        print(f"[{self.req_id}] ⏳ {self.label} - {msg}")
    def step(self, msg: str):
        if self.t0 is None: self.t0 = time.time()
        el = (time.time() - self.t0) * 1000
        print(f"[{self.req_id}] ✅ {self.label} - {msg} ({el:.0f} ms)")
    def error(self, msg: str):
        el = (time.time() - self.t0) * 1000 if self.t0 else 0
        print(f"[{self.req_id}] ❌ {self.label} - {msg} ({el:.0f} ms)")
