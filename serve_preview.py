#!/usr/bin/env python3
"""Serve a demonstração web a partir da raiz correta do repositório."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


PORT = 8080
PROJECT_ROOT = Path(__file__).resolve().parent


def main() -> None:
    handler = partial(SimpleHTTPRequestHandler, directory=PROJECT_ROOT)
    server = ThreadingHTTPServer(("127.0.0.1", PORT), handler)
    print(f"Racha Vôlei disponível em http://localhost:{PORT}/preview/")
    print("Pressione Ctrl+C para encerrar.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
