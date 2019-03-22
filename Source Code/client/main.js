
// Imports
const request = require("request");
const fs = require("fs");
var server = require("http").createServer((req, res) => { });
const { BrowserWindow, dialog, Menu, Tray } = require('electron').remote;


//Elements
var select_platform, player_name, api_key_trn, btn_startServer, btn_saveSettings;
addEventListener('load', () => {
    require('electron').remote.getCurrentWindow();
    select_platform = document.getElementById('sel_platform');
    player_name = document.getElementById('txt_playerName');
    api_key_trn = document.getElementById('txt_apiKey');
    btn_startServer = document.getElementById('btn_startServer');
    btn_saveSettings = document.getElementById('btn_saveSettings');
    if (fs.existsSync('./client/settings.json')) {
        fs.readFile('./client/settings.json', 'utf8', (err, data) => {
            if (err) throw err;
            var obj = JSON.parse(data);
            player_name.value = obj.playername;
            api_key_trn.value = obj.api;
            select_platform.value = obj.platform;
        });

    }
    btn_startServer.onclick = () => {
        if (isServerRunning) {
            StopServer();
        } else {
            StartServer();
        }

    }

    btn_saveSettings.onclick = () => {
        SaveSettings();
    }
    createSystemTrayIcon();
    console.clear();

    console.log(`%c
 __ __   ___   _      ___        __ __  ____  __ 
|  |  | /   \\ | |    |   \\      |  |  ||    \\|  |
|  |  ||     || |    |    \\     |  |  ||  o  )  |
|  _  ||  O  || |___ |  D  |    |  |  ||   _/|__|
|  |  ||     ||     ||     |    |  :  ||  |   __ 
|  |  ||     ||     ||     |    |     ||  |  |  |
|__|__| \\___/ |_____||_____|     \\__,_||__|  |__|


%c 
    |------------------[WARNING]------------------|
    | Don't copy paste anything in the console.   |
    | If someone told you to copy paste something |
    | in the console they may try to scam you.    |
    | Only do it if you know what you are doing   |
    |---------------------------------------------|`, "font-family:monospace", "color:red");


})

//Server Variables and options
const serverOptions = {
    port: 9568,
    mainFile: "/overlay/index.html",
    mainFolder: "/overlay"
};
var isServerRunning = false;

//Player Data that will be sent over the server.
var playerData = {
    playername: "",
    legends: [],
    stats: []
};

//Get the current electron window
var win;


/**
 * Summary: StartServer()
 *      1. Check if playerName or API input field is ampty
 *          a. if it is return and send a message box to warn the user
 *      2. Send the Overlay folder to the localhost server and start the server at the port
 *      3. After starting the server send message to the console about how to add the overlay to obs  (this will be removed or changed to a new method)
 *      4. use socket.io to recieve and send data to the user.
 *      5. specify a send function to send data to the client.
 *      
 */

function StartServer() {
    //Check player name and api key
    if (player_name.value.toLowerCase() == "" || api_key_trn.value == "") {
        dialog.showMessageBox(win, {
            title: "Error trying to get player data",
            type: "error",
            message: "The player name and API-Key input field can't be empty",
        })
        return;
    }
    if (isServerRunning) {
        dialog.showMessageBox(win, {
            title: "Server Error",
            type: "error",
            message: "Error: The server is already running",
        })
        return;
    }
    isServerRunning = true;
    btn_startServer.innerHTML = "Stop Server";


    /* Create the server */

    server.on('error', (err) => {
        dialog.showMessageBox(win, {
            title: "Error trying to start the server",
            type: "error",
            message: "There was an error trying to create the server at port: " + serverOptions.port + " try closing any other servers running on that port",
        });
    })
    server.listen(serverOptions.port);


    /* Send message to the console(will be changed or removed) */
    console.log("Server is running on: http://localhost:" + serverOptions.port);
    console.log(
        "Obs -> (YOUR_SCENE) -> Add -> browser:\n URL: file:///" + __dirname + "/overlay/OBSOverlay.html" + "\nWidth: 652\nHeight: 729"
    );

    /* use socket.io on the server */
    const io = require("socket.io")(server, {});
    io.sockets.on("connection", socket => {

        socket.on("requestForData", () => {
            send(socket);
        });
    });


    /* specify a send message that sends data to the user */

    /**
     * Summary: Send()
     *      1. Again check for playerName and api key input field
     *      2. specify the headers that will be sent and the url to acces from tracker network.
     *      3. use request to scrape the information from tracker network.
     */
    function send(socket) {
        if (player_name.value.toLowerCase() == "" || api_key_trn.value == "") {
            dialog.showMessageBox(win, {
                title: "Error trying to get player data",
                type: "error",
                message: "The player name and API-Key input field can't be empty",
            })
            return;
        }
        let options = {
            url:
                `https://public-api.tracker.gg/apex/v1/standard/profile/${select_platform.value}/${player_name.value.toLowerCase()}`,
            headers: {
                "TRN-Api-Key": api_key_trn.value,
            }
        };
        request(options, (err, res, body) => {
            if (err) {
                console.log(err);
                socket.emit("PlayerData", playerData);
                return;
            }
            if (body === '{"message":"No API key found in request"}') {
                console.log("Something went wrong");
                socket.emit("PlayerData", playerData);
                return;
            }
            const apiData = JSON.parse(body).data;
            playerData = {
                playername: "",
                legends: [],
                stats: []
            };
            if (apiData.metadata) {
                if (apiData.metadata.platformUserHandle) {
                    playerData["playername"] = apiData.metadata.platformUserHandle;
                } else {
                    playerData["playername"] = player_name.value;
                }
            }
            if (apiData.stats) {
                for (let statI in apiData.stats) {
                    let stat = apiData.stats[statI];
                    let statObject = {
                        key: "",
                        value: 0,
                        rank: 0,
                        displayvalue: "",
                        displayrank: ""
                    }
                    if (stat.metadata) if (stat.metadata.key) statObject.key = stat.metadata.key;
                    if (stat["value"]) statObject.value = stat["value"];
                    if (stat["rank"]) statObject.rank = stat["rank"];
                    if (stat["displayValue"]) statObject.displayvalue = stat["displayValue"];
                    if (stat["displayRank"]) statObject.displayrank = stat["displayRank"];
                    playerData.stats[playerData.stats.length] = statObject;
                }
            }
            if (apiData.children) {
                for (let legendI in apiData.children) {
                    let legend = apiData.children[legendI];
                    let legendObject = {
                        name: "",
                        icon: "",
                        bgimage: "",
                        stats: []
                    }

                    if (legend.metadata) {
                        if (legend.metadata.legend_name) legendObject.name = legend.metadata.legend_name;
                        if (legend.metadata.icon) legendObject.icon = legend.metadata.icon;
                        if (legend.metadata.bgimage) legendObject.bgimage = legend.metadata.bgimage;
                    }
                    if (legend.stats) {
                        for (let statI in legend.stats) {
                            let stat = legend.stats[statI];
                            let statObject = {
                                key: "",
                                value: 0,
                                rank: 0,
                                displayvalue: "",
                                displayrank: ""
                            }
                            if (stat.metadata) if (stat.metadata.key) statObject.key = stat.metadata.key;
                            if (stat["value"]) statObject.value = stat["value"];
                            if (stat["rank"]) statObject.rank = stat["rank"];
                            if (stat["displayValue"]) statObject.displayvalue = stat["displayValue"];
                            if (stat["displayRank"]) statObject.displayrank = stat["displayRank"];
                            legendObject.stats[legendObject.stats.length] = statObject;
                        }
                    }
                    playerData.legends[playerData.legends.length] = legendObject;
                }
            }
            socket.emit("PlayerData", playerData);
        });
    }
}

function StopServer() {
    if (isServerRunning) {
        server.close();
        isServerRunning = false;
        btn_startServer.innerHTML = "Start Server";

    }

}


function SaveSettings() {
    let settings = {
        playername: player_name.value,
        api: api_key_trn.value,
        platform: select_platform.value
    }
    fs.writeFileSync('./client/settings.json', JSON.stringify(settings));
}

let tray = null;
function createSystemTrayIcon() {

    tray = new Tray('./client/icon.png');
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open Window',
            click: () => {
                let window = require('electron').remote.getCurrentWindow();
                window.show();
            }
        },
        {
            label: "Start / Stop Server",
            click: () => {
                if (isServerRunning) {
                    StopServer();
                } else {
                    StartServer();
                }
            }
        },
        {
            label: "Close Application",
            click: () => {
                if (isServerRunning)
                    StopServer();
                BrowserWindow.getAllWindows().map(x => x.close());
            }
        }
    ])
    tray.setToolTip('Apex Overlay for OBS');
    tray.setContextMenu(contextMenu);
}