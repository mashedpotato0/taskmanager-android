import http.server
import socketserver
import json
import os
import webbrowser
import threading
import time
import sys

# serve www
base_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(os.path.join(base_dir, 'www'))

PORT = 8000
DATA_FILE = '../data.json'
# timeout
HEARTBEAT_TIMEOUT = 4
last_heartbeat = time.time()

class FocusGridHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass # no logs

    def do_GET(self):
        # serve data
        if self.path == '/data.json':
            if os.path.exists(DATA_FILE):
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                with open(DATA_FILE, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.end_headers()
        else:
            # static files
            super().do_GET()

    def do_POST(self):
        global last_heartbeat

        # heartbeat
        if self.path == '/heartbeat':
            last_heartbeat = time.time()
            self.send_response(200)
            self.end_headers()
            return

        # save
        if self.path == '/save':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)

                # verify json
                json.loads(post_data)

                with open(DATA_FILE, 'wb') as f:
                    f.write(post_data)

                self.send_response(200)
                self.end_headers()
                self.wfile.write(b'Saved')
            except Exception as e:
                print(f"Error saving data: {e}")
                self.send_response(500)
                self.end_headers()

def monitor_heartbeat(server):
    global last_heartbeat
    print(f"[*] Monitoring browser status...")
    while True:
        time.sleep(1)
        if time.time() - last_heartbeat > HEARTBEAT_TIMEOUT:
            print("[!] Browser closed. Shutting down server.")
            server.shutdown()
            break

# reuse port
socketserver.TCPServer.allow_reuse_address = True

print(f"[*] FocusGrid is running.")
print(f"[*] Close the browser window to stop the app.")

# open index
target_url = f'http://localhost:{PORT}/'

# delay open
threading.Timer(0.5, lambda: webbrowser.open(target_url)).start()

with socketserver.TCPServer(("", PORT), FocusGridHandler) as httpd:
    # start monitor
    monitor_thread = threading.Thread(target=monitor_heartbeat, args=(httpd,))
    monitor_thread.daemon = True
    monitor_thread.start()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    print("[*] Server stopped.")
