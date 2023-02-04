// ==UserScript==
// @name         AMQ Voice Universal
// @namespace    https://github.com/43D
// @version      1.4.0
// @description  Voice
// @author       Allangamer43D
// @match        https://animemusicquiz.com/
// @updateURL	 https://github.com/43D/amqVoiceUniversal/raw/main/amqVoiceUniversal.user.js
// ==/UserScript==


if (document.getElementById("startPage")) return;

const currentVersion = "1.4.0";
const tags = [
    "Welcome1",
    "Welcome2",
    "Welcome3",
    "Welcome4",
    "JoinGame",
    "PlayerLeft",
    "GameStart",
    "TicketRoll",
    "LevelUp",
    "Popout",
    "Setting",
    "Message",
    "FriendRequest",
    "GameInvite"
];

const modal = modalFactory();
const storeAudio = Store();
const player = playAudio();
const config = settingAudio();

let loadInterval = setInterval(() => {
    if ($("#loadingScreen").hasClass("hidden")) {
        if ($("#modalBody").length) {
            init();
            clearInterval(loadInterval);
        }
    }
}, 500);

const now = new Date();
const heure = now.getHours();

if (heure >= 7 && heure < 12) {
    player.play(tags[0]);
}
else if (heure >= 12 && heure < 18) {
    player.play(tags[1]);
}
else if (heure >= 18) {
    player.play(tags[2]);
}
else if (heure >= 0 && heure < 7) {
    player.play(tags[3]);
}

function init() {
    setup();
    interface();
    config.events();
    config.setCurrentAudio($('#voiceSelect').find(":selected").val());
    $("#voiceCurrentVersion").text(currentVersion);
}

function setup() {
    let JoinGame = new Listener("Join Game", (payload) => {
        player.play(tags[4]);
    });
    let PlayerLeft = new Listener("Player Left", (payload) => {
        player.play(tags[5]);
    });
    let GameStart = new Listener("Game Starting", (payload) => {
        player.play(tags[6]);
    });
    let TicketRoll = new Listener("ticket roll result", (payload) => {
        player.play(tags[7]);
    });
    let LevelUp = new Listener("quiz xp credit gain", (payload) => {
        const lastGain = data.xpInfo.lastGain;
        const xpIntoLevel = data.xpInfo.xpIntoLevel;
        if (lastGain > xpIntoLevel) {
            player.play(tags[8]);
        }
    });
    let Popout = new Listener("popout message", (payload) => {
        player.play(tags[9]);
    });
    let Setting = new Listener("Room Settings Changed", (payload) => {
        player.play(tags[10]);
    });
    let Message = new Listener("chat message", (payload) => {
        player.play(tags[11]);
    });
    let FriendRequest = new Listener("new friend request recived", (payload) => {
        player.play(tags[12]);
    });
    let GameInvite = new Listener("game invite", (payload) => {
        player.play(tags[13]);
    });

    JoinGame.bindListener();
    PlayerLeft.bindListener();
    GameStart.bindListener();
    TicketRoll.bindListener();
    LevelUp.bindListener();
    Popout.bindListener();
    Setting.bindListener();
    Message.bindListener();
    FriendRequest.bindListener();
    GameInvite.bindListener();
}

function interface() {
    $(".closeModal").click(() => modal.closeModal());
    $("#resetAll").click(() => storeAudio.reset());
    $("#btnOpenVoiceSetting").click(() => modal.openModal());
}

function playAudio() {
    let list = {};
    let played = [];

    function play(tag) {
        if (!list[tag]) {
            const json = storeAudio.getByTag(tag);
            list[tag] = json;
        }
        if (!list[tag].simultaneousAllow) {
            if (played.includes(tag)) {
                return;
            }
            played.push(tag);
        }
        playByTag(tag);
    }

    function playByTag(tag) {
        const audio = new Audio(list[tag].audio);
        audio.volume = list[tag].volume;
        audio.play()
    }

    return {
        play
    }
}

function modalFactory() {
    let modal = document.createElement("div");

    init();

    function init() {
        styleDiv();
        $("body")[0].appendChild(modal);
        $("#modalVoice").load("https://43d.github.io/amqVoiceUniversal/index.html");
        $("#footerMenuBar").append($("<div>").attr("id", "divVoiceLoad"));
        $("#divVoiceLoad").load("https://43d.github.io/amqVoiceUniversal/button.html");
    }

    function styleDiv() {
        modal.style.position = "absolute"
        modal.style.width = "60%";
        modal.style.zIndex = "999999999";
        modal.style.right = "20%";
        modal.style.backgroundColor = "#1b1b1b";
        modal.style.display = "none";
        modal.id = "modalVoice"
    }

    function openModal() {
        modal.style.display = "block";
    }
    function closeModal() {
        modal.style.display = "none";
    }

    return {
        openModal,
        closeModal
    }
}

function settingAudio() {
    let source = sourceAudio();
    onClickAudio();
    onChangeSelect();

    function events() {
        onClickAudio();
        onChangeSelect();
    }

    function setCurrentAudio(tag) {
        const json = storeAudio.getByTag(tag);
        $("#voicePreview").attr("src", json.audio)
        $("#voicePreview")[0].volume = json.volume;
        $("#voiceVolume").val(Number(json.volume) * 100);
        $('#simultaneousAllow').prop("checked", json.simultaneousAllow);
        $("#voiceLink").val("");
        $("#voiceFile").val("");
    }

    function onClickAudio() {
        $("#voiceSave").click(() => save());
    }

    function onChangeSelect() {
        $('#voiceSelect').change(() => setCurrentAudio($('#voiceSelect').find(":selected").val()));
    }

    async function save() {
        if ($("#voiceFile").val() || $("#voiceLink").val())
            await source.update();
        else
            saveConfigs();
    }

    function saveConfigs() {
        const tag = $('#voiceSelect').find(":selected").val();
        let json = storeAudio.getByTag(tag);
        json.simultaneousAllow = $('#simultaneousAllow').prop("checked");
        json.volume = Number($("#voiceVolume").val()) / 100;

        storeAudio.save(tag, json);
        $("#voicePreview")[0].volume = json.volume;
        $("#voiceSaveStatus").text("Update configs...")
        setTimeout(() => {
            $("#voiceSaveStatus").text("");
        }, "3000")
    };

    function saveLocal(base64) {
        $("#voicePreview").attr("src", base64)
        const tag = $('#voiceSelect').find(":selected").val();
        const volume = Number($("#voiceVolume").val()) / 100;
        const simultaneousAllow = $('#simultaneousAllow').prop("checked");
        const json = { "audio": base64, "simultaneousAllow": simultaneousAllow, "volume": volume }
        storeAudio.save(tag, json);
        setTimeout(() => {
            $("#voiceSaveStatus").text("");
        }, "5000")
    }

    return {
        setCurrentAudio,
        events,
        saveLocal
    }
}

function sourceAudio() {
    async function update() {
        let file;
        if ($("#voiceLink").val()) {
            try {
                file = await fetch($("#voiceLink").val()).then(r => r.blob());
            } catch (error) {
                file = $("#voiceFile")[0].files[0];
            }
        } else {
            file = $("#voiceFile")[0].files[0];
        }
        if (file) {
            await serializator(file);
            return true;
        }
        return false;
    }

    async function serializator(file) {
        let reader = new FileReader()
        reader.onload = async function (base64) {
            config.saveLocal(base64.target.result);
        }
        reader.readAsDataURL(file);
    }

    return {
        update
    }
}

function Store() {
    init();

    function init() {
        if (!getByTag(tags[0]))
            defaultAudio();
        else if (!getByTag(tags[0]).simultaneousAllow)
            updateLocal();
    }

    function save(tag, json) {
        try {
            localStorage.setItem(tag, JSON.stringify(json));
            $("#voiceSaveStatus").text("Saved!!! [" + tag + "]");
        } catch (error) {
            setCurrentAudio($('#voiceSelect').find(":selected").val());
            $("#voiceSaveStatus").text("File size is big, not saved!!!");
        }
    }

    function reset() {
        localStorage.clear();
        $("#voiceSaveStatus").text("Refresh is coming....");
        setTimeout(() => {
            location.reload();
        }, 2800);
    }

    function getByTag(tag) {
        return JSON.parse(localStorage.getItem(tag));
    }

    function updateLocal() {
        tags.forEach((k) => {
            let json = getByTag(k);
            json.simultaneousAllow = false;
            save(k, json);
        });
    }

    async function defaultAudio() {
        const defaultAudio = await $.get("https://43d.github.io/amqVoiceUniversal/defaultAudio.json")
        defaultAudio.list.forEach((k) =>
            save(k.name, k.data)
        );
    }

    return {
        save,
        getByTag,
        reset
    }
}
