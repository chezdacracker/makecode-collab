const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;

// Web page server
const server = http.createServer((req, res) => {
    if (req.url === "/" || req.url === "/index.html") {
        const file = fs.readFileSync(
            path.join(__dirname, "index.html")
        );

        res.writeHead(200, {
            "Content-Type": "text/html"
        });

        res.end(file);
    } else {
        res.writeHead(404);
        res.end("Not found");
    }
});

// WebSocket server
const wss = new WebSocket.Server({ server });

const rooms = new Map();

function makeCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";

    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
}

wss.on("connection", socket => {
    let room = null;

    socket.on("message", data => {
        let message;

        try {
            message = JSON.parse(data);
        } catch {
            return;
        }

        if (message.type === "create") {
            let code;

            do {
                code = makeCode();
            } while (rooms.has(code));

            rooms.set(code, new Set([socket]));
            room = code;

            socket.send(JSON.stringify({
                type: "created",
                code: code
            }));
        }

        if (message.type === "join") {
            const clients = rooms.get(message.code);

            if (!clients) {
                socket.send(JSON.stringify({
                    type: "error",
                    message: "Room not found!"
                }));
                return;
            }

            room = message.code;
            clients.add(socket);

            for (const client of clients) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: "playerJoined"
                    }));
                }
            }
        }

        if (message.type === "change" && room) {
            const clients = rooms.get(room);

            if (!clients) return;

            for (const client of clients) {
                if (
                    client !== socket &&
                    client.readyState === WebSocket.OPEN
                ) {
                    client.send(JSON.stringify({
                        type: "change",
                        data: message.data
                    }));
                }
            }
        }
    });

    socket.on("close", () => {
        if (!room) return;

        const clients = rooms.get(room);

        if (!clients) return;

        clients.delete(socket);

        if (clients.size === 0) {
            rooms.delete(room);
        }
    });
});

server.listen(PORT, () => {
    console.log("MakeCode Collab running on port " + PORT);
});
