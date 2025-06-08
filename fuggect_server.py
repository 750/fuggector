import dataclasses
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
from typing import Callable
from urllib.parse import urlparse, parse_qs

import subprocess, time

def system_paste(delay = 0.1):
    time.sleep(delay)
    subprocess.Popen(['osascript', '-e' 'tell application "System Events" to keystroke "v" using command down']).wait()


@dataclasses.dataclass
class FuggestItem:
    text: str
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
        text="http://ya.ru/url/only",
    ),
    FuggestItem(
        text="http://ya.ru/url/and/description",
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
            # print(f"url: {url_parts}")
            # print(f"query_params: {query_params}")

            query = query_params.get("query", [""])[0]
            print(query)
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
        elif path == "/paste":
            system_paste()
            return super().do_GET()
        else:
            return super().do_GET()

    def log_request(self, code='-', size='-'):
        """Log an accepted request.

        This is called by send_response().

        """
        # if isinstance(code, HTTPStatus):
        #     code = code.value
        if "/api" in self.requestline:
            self.log_message('"%s" %s',
                            self.requestline[:80], str(code))


async def hehe():
    pass


def run_fuggect_server(func: Callable[[str], list[FuggestItem]] = None):
    import os

    hehe()

    os.chdir('dist')

    server_address = ('localhost', 9090)
    MyHandler.func = func
    httpd = HTTPServer(server_address, MyHandler)
    print(f"🤚 starting server on http://{server_address[0]}:{server_address[1]}", server_address)
    httpd.serve_forever()

if __name__ == "__main__":
    run_fuggect_server()