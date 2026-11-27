import os

from app import create_app

app = create_app()


if __name__ == "__main__":
    # Default debug=True for convenient auto-reloading during development
    debug = os.getenv("FLASK_DEBUG", "true").lower() in {"1", "true", "yes"}
    # Default host 0.0.0.0 to allow access from local machine and local network IP
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", "5000"))

    app.run(host=host, port=port, debug=debug)
