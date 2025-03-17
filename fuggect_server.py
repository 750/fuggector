import dataclasses
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
from typing import Callable
from urllib.parse import urlparse, parse_qs


@dataclasses.dataclass
class FuggestItem:
    text: str = None
    url: str = None
    description: str = None

    def to_dict(self):
        return dataclasses.asdict(self)

TEST_DATA = [
    FuggestItem(
        text="Text only",
    ),
    FuggestItem(
        text="Text and description",
        description="some description",
    ),
    FuggestItem(
        url="http://ya.ru/url/only",
    ),
    FuggestItem(
        url="http://ya.ru/url/and/description",
        description="some description",
    ),
    FuggestItem(
        text="http://ya.ru/url/and/description http://ya.ru/url/and/description http://ya.ru/url/and/description http://ya.ru/url/and/description http://ya.ru/url/and/description ",
        description="very long text",
    ),
]

class MyHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        url_parts = urlparse(self.path)

        query_params = parse_qs(url_parts.query)
        path = url_parts.path

        if path == "/api":
            print(f"url: {url_parts}")
            print(f"query_params: {query_params}")

            query = query_params.get("query", [""])[0]
            if query == "test":
                items = TEST_DATA
            elif self.func is None:
                items = []
            else:
                items = self.func(query)
            response = json.dumps([i.to_dict() for i in items]).encode()

            self.protocol_version = 'HTTP/1.0'
            self.send_response(200)
            self.send_header('Content-type','application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header("Content-Length", str(len(response)))
            self.end_headers()
            self.wfile.write(response)
        else:
            return super().do_GET()

def run_fuggect_server(func: Callable[[str], list[FuggestItem]] = None):
    import os

    os.chdir('build')

    server_address = ('localhost', 9090)
    MyHandler.func = func
    httpd = HTTPServer(server_address, MyHandler)
    httpd.serve_forever()

if __name__ == "__main__":
    run_fuggect_server()