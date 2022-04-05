require("dotenv").config();
const net = require("net");

const server = net.createServer();

server.on("connection", (clientToProxySocket) => {
    console.log(`> Client ${clientToProxySocket.remoteAddress} connected`);   
    clientToProxySocket.once("data", (data) => {
        const stringifiedData = data.toString();

        const isTLS = stringifiedData.indexOf("CONNECT") !== -1;

        const serverPort = isTLS ? 443 : 80;
        const serverHost = isTLS 
            ? stringifiedData.split("CONNECT")[1].split(" ")[1].split(":")[0]
            : stringifiedData.split("Host: ")[1].split("\r\n")[0];

        const proxyToServerSocket = net.createConnection(
            { port: serverPort, host: serverHost }, 
            () => console.log(`> Connected to ${serverHost}:${serverPort} via ${isTLS ? "HTTPS" : "HTTP"}`)
        )

        if (isTLS) {
            proxyToServerSocket.write("HTTP/1.1 200 OK\r\n\n");
        } else {
            proxyToServerSocket.write(data);
        }

        clientToProxySocket.pipe(proxyToServerSocket);
        proxyToServerSocket.pipe(clientToProxySocket);

        proxyToServerSocket.on("error", (err) => {
            console.log("> Proxy to server socket error: ", err.toString());
            clientToProxySocket.end();
        })

        clientToProxySocket.on("error", (err) => {
            console.log("Client to proxy socket error: ", err.toString());
            proxyToServerSocket.end();
        })
    })
})

server.on("error", (err) => {
    console.log("> Main server error:", err.message);
})

server.on("close", () => {
    console.log("> Client disconnected");
})

server.listen(
    {
        host: process.env.HOST,
        port: process.env.PORT
    },
    () => console.log("Server listening on port " + process.env.PORT)
)