let player = document.getElementById("player");
let playBtn = document.getElementById("playBtn");
let pauseBtn = document.getElementById("pauseBtn");
let stopBtn = document.getElementById("stopBtn");
let volUpBtn = document.getElementById("volUpBtn");
let volDownBtn = document.getElementById("volDownBtn");
let speedBtn = document.getElementById("speedBtn");
let progress = document.getElementById("progress");
let progressBar = document.getElementById("progressBar");
let message = document.getElementById("message");

let sceneNumber = document.getElementById("sceneNumber");
let sceneTitle = document.getElementById("sceneTitle");
let sceneText = document.getElementById("sceneText");

let photos = document.getElementsByClassName("photo");
let pantaiImg = document.getElementById("pantaiImg");
let tabotImg = document.getElementById("tabotImg");
let rainFrame = document.getElementById("rainFrame");

let menuBtn = document.getElementById("menuBtn");
let menu = document.getElementById("menu");

let scenes = [
    {
        start: 0,
        title: "Arunika di Pantai Panjang",
        text: "Dawn at the long beach. The first sound of home is the Indian Ocean rolling in along Pantai Panjang, before the city wakes up."
    },
    {
        start: 21.5,
        title: "Badminton Pagi",
        text: "Morning badminton, three times a week whenever I'm home. The shuttle, the squeak of shoes on the green court, and the echo under the tin roof."
    },
    {
        start: 41.5,
        title: "Tabot",
        text: "Every Muharram (a month in the islamic calendar), tall tabot towers are paraded through the streets of Bengkulu to the beat of the dol drums."
    },
    {
        start: 61.5,
        title: "Hujan Sore",
        text: "Afternoon rain comes fast and heavy. Everything slows down, and somewhere under the rain you can still hear the sea."
    }
];

let currentScene = -1;      
let volume = 1.0;
let speeds = [0.75, 1, 1.25, 1.5];
let speedIndex = 1;        

let dropCount = 40;
let drops = [];
let dropDurations = [];     

function makeRain() {
    for (let i = 0; i < dropCount; i++) {
        let drop = document.createElement("div");
        drop.className = "drop";
        drop.style.left = Math.random() * 100 + "%";

        let duration = 0.5 + Math.random() * 0.5;
        dropDurations.push(duration);
        drop.style.animationDuration = duration + "s";
        drop.style.animationDelay = -Math.random() + "s";  

        rainFrame.appendChild(drop);
        drops.push(drop);
    }
}

makeRain();
updateMessage();

playBtn.addEventListener("click", playAudio);
pauseBtn.addEventListener("click", pauseAudio);
stopBtn.addEventListener("click", stopAudio);
volUpBtn.addEventListener("click", volumeUp);
volDownBtn.addEventListener("click", volumeDown);
speedBtn.addEventListener("click", changeSpeed);
progress.addEventListener("click", seekAudio);
menuBtn.addEventListener("click", toggleMenu);

player.addEventListener("play", playerStarted);
player.addEventListener("pause", playerPaused);
player.addEventListener("timeupdate", playerProgressed);
player.addEventListener("ended", playerEnded);
player.addEventListener("ratechange", rateChanged);
player.addEventListener("volumechange", updateMessage);
player.addEventListener("loadedmetadata", updateMessage);

function playAudio() {
    player.play();
}

function pauseAudio() {
    player.pause();
}

function stopAudio() {
    player.currentTime = 0;
    player.pause();
    resetPage("Press play to go home.", "Put your headphones on. Click play, or click any photo to start from that moment.");
}

function volumeUp() {
    volume += 0.1;
    if (volume > 1.0) {
        volume = 1.0;
    }
    player.volume = volume;
}

function volumeDown() {
    volume -= 0.1;
    if (volume < 0.0) {
        volume = 0.0;
    }
    player.volume = volume;
}

function changeSpeed() {
    speedIndex += 1;
    if (speedIndex >= speeds.length) {
        speedIndex = 0;
    }
    player.playbackRate = speeds[speedIndex];
}

function seekAudio(e) {
    let percent = e.offsetX / progress.offsetWidth;
    player.currentTime = percent * player.duration;
    player.play();
}

function jumpToScene(index) {
    player.currentTime = scenes[index].start;
    showScene(index);
    player.play();
    closeMenu();
}

function playerStarted() {
    document.body.classList.add("listening");
    document.body.classList.remove("paused");
    updateMessage();
}

function playerPaused() {
    if (player.currentTime > 0 && player.ended == false) {
        document.body.classList.add("paused");
    }
    updateMessage();
}

function playerProgressed() {
    let percent = player.currentTime / player.duration * 100;
    progressBar.style.width = percent + "%";

    let sceneIndex = 0;
    for (let i = 0; i < scenes.length; i++) {
        if (player.currentTime >= scenes[i].start) {
            sceneIndex = i;
        }
    }

    if (sceneIndex != currentScene && document.body.classList.contains("listening")) {
        showScene(sceneIndex);
    }

    updateMessage();
}

function playerEnded() {
    resetPage("Sampai jumpa, Bengkulu.", "See you soon. Press play to go home again.");
    progressBar.style.width = "100%";
    updateMessage();
}

function rateChanged() {
    let rate = player.playbackRate;
    speedBtn.innerHTML = "Speed " + rate + "&times;";

    pantaiImg.style.animationDuration = (6 / rate) + "s";
    tabotImg.style.animationDuration = (0.45 / rate) + "s";
    for (let i = 0; i < drops.length; i++) {
        drops[i].style.animationDuration = (dropDurations[i] / rate) + "s";
    }

    updateMessage();
}
function showScene(index) {
    currentScene = index;

    for (let i = 0; i < photos.length; i++) {
        if (i == index) {
            photos[i].classList.add("active");
        } else {
            photos[i].classList.remove("active");
        }
    }

    sceneNumber.innerHTML = "0" + (index + 1) + " / 0" + scenes.length;
    sceneTitle.innerHTML = scenes[index].title;
    sceneText.innerHTML = scenes[index].text;
}

function resetPage(title, text) {
    currentScene = -1;
    document.body.classList.remove("listening");
    document.body.classList.remove("paused");

    for (let i = 0; i < photos.length; i++) {
        photos[i].classList.remove("active");
    }

    progressBar.style.width = "0%";
    sceneNumber.innerHTML = "&mdash; / 04";
    sceneTitle.innerHTML = title;
    sceneText.innerHTML = text;
}

function updateMessage() {
    let status = "Playing";
    if (player.ended) {
        status = "Finished";
    } else if (player.paused && player.currentTime == 0) {
        status = "Ready";
    } else if (player.paused) {
        status = "Paused";
    }

    let total = player.duration;
    if (isNaN(total)) {
        total = 82;
    }

    message.innerHTML = status + " &middot; " + formatTime(player.currentTime) + " / " + formatTime(total);
    message.innerHTML += " &middot; volume " + Math.round(player.volume * 100) + "%";
    message.innerHTML += " &middot; speed " + player.playbackRate + "&times;";
}

function formatTime(time) {
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time) - minutes * 60;
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return minutes + ":" + seconds;
}

function toggleMenu() {
    menu.classList.toggle("open");
    menuBtn.classList.toggle("open");
}

function closeMenu() {
    menu.classList.remove("open");
    menuBtn.classList.remove("open");
}
