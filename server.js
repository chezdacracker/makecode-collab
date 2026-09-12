const http = require("http");
const WebSocket = require("ws");

const server = http.createServer();
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

        // Create a room
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

            return;
        }

        // Join a room
        if (message.type === "join") {
            const target = rooms.get(message.code);

            if (!target) {
                socket.send(JSON.stringify({
                    type: "error",
                    message: "Room not found"
                }));
                return;
            }

            room = message.code;
            target.add(socket);

            for (const client of target) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: "playerJoined"
                    }));
                }
            }

            return;
        }

        // Send a change to everyone else
        if (message.type === "change" && room) {
            const clients = rooms.get(room);

            if (!clients) return;

            for (const client of clients) {
                if (client !== socket &&
                    client.readyState === WebSocket.OPEN) {
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

server.listen(process.env.PORT || 3000, () => {
    console.log("Collab server is running!");
});
