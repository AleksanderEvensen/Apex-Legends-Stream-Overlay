var canvas;
var ctx;

var tracker;

var animFrame;

var playerData = {
    level: 0,
    kills: 0,
    damage: 0,
    matches: 0,
};
var legendImage = new Image();
var overlay_buttons = new Image();
overlay_buttons.src = "./overlay_buttons.png";


window.onload = function () {
    canvas = document.getElementById("mainCanvas");
    ctx = canvas.getContext("2d");
    canvas.width = 652;
    canvas.height = 729;
    tracker = new ApexTracker(10000);
    animFrame = requestAnimationFrame(drawOverlay);
    tracker.onDataRecieved = function () {
        playerData.level = tracker.getPlayerStat('level').value;
        playerData.kills = tracker.getPlayerStat('kills').value;
        playerData.damage = tracker.getPlayerStat('damage').value;
        playerData.matches = tracker.getPlayerStat('matchesplayed').value;
        legendImage.src = tracker.getCurrentChosenLegend().icon;
    }
};


function drawOverlay() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (legendImage != new Image()) {
        ctx.save();
        ctx.globalAlpha = 0.70;
        ctx.drawImage(legendImage, 0, -70);
        ctx.restore();
    }

    ctx.drawImage(
        overlay_buttons,
        45,
        70,
        overlay_buttons.width / 3.8,
        overlay_buttons.height / 3.8
    );

    ctx.save();
    ctx.font = "50px Timmana";
    //ctx.globalAlpha = 0.6;
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillText("Level " + playerData.level, 75, 245);
    ctx.fillText("Kills: " + playerData.kills, 75, 365);
    ctx.fillText("Damage: " + playerData.damage, 75, 450);
    ctx.fillText("Matches: " + playerData.matches, 75, 532);

    ctx.restore();

    tracker.update();
    animFrame = requestAnimationFrame(drawOverlay);
}