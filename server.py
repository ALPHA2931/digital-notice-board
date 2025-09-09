#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import threading
import os

PORT = 3000
Handler = http.server.SimpleHTTPRequestHandler

def start_server():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"✅ Digital Notice Board server started!")
        print(f"🌐 Open your browser and navigate to: http://localhost:{PORT}")
        print(f"📱 The website is responsive and works on all devices")
        print(f"⭐ Features: Search, Filter, Export/Import, Mobile-friendly")
        print(f"🛑 Press Ctrl+C to stop the server")
        print("-" * 60)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n🛑 Server stopped.")

if __name__ == "__main__":
    # Automatically open browser after 1 second
    threading.Timer(1, lambda: webbrowser.open(f"http://localhost:{PORT}")).start()
    start_server()
