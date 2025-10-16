from app import create_app

app = create_app()
if app is None:
    raise RuntimeError("App creation failed")