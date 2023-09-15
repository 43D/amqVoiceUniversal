// ==UserScript==
// @name         AMQ Voice Universal2
// @namespace    https://github.com/43D
// @version      2.0.2
// @description  Voice
// @author       Allangamer43D
// @match        https://animemusicquiz.com/
// @updateURL	 https://github.com/43D/amqVoiceUniversal/raw/main/amqVoiceUniversal.user.js
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqScriptInfo.js
// ==/UserScript==


if (document.getElementById("startPage")) return;
const currentVersion = "2.0.2";
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
const storeAudio = await Store();
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
    $("#simultaneousAllow").change(() => {
        config.saveConfigs();
    });
    $("#voiceVolume").change(() => {
        config.saveConfigs();
    });
    $("#randomChoose").change(() => {
        config.saveConfigs();
    });
    $("#sequentialChoose").change(() => {
        config.saveConfigs();
    });
    $('#songList').change(() => config.setAudioBySongList($('#voiceSelect').find(":selected").val()));

    $("#removeActualSongPreview").click(() => {
        config.removeSong($('#voiceSelect').find(":selected").val());
    });
    desc();
}

function desc() {
    AMQ_addScriptData({
        name: " AMQ Voice Universal",
        author: "43D",
        description: `<p>Add personalized audio notifications for each action in AMQ. By default Genshin's HuTao sounds are saved.</p>
            <p>Salve futeba, digo, Viteira!!!</p>
            <p><a href="https://github.com/43D/amqVoiceUniversal/raw/main/amqVoiceUniversal.user.js" target="_blank">Click this link</a> to update it.</p>`
    });
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
        const lastGain = payload.xpInfo.lastGain;
        const xpIntoLevel = payload.xpInfo.xpIntoLevel;
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
        list[tag] = storeAudio.getByTag(tag);

        if (!list[tag].simultaneousAllow) {
            if (played.includes(tag)) {
                return;
            }
            played.push(tag);
        }
        playByTag(tag);
    }

    function playByTag(tag) {
        const data = list[tag];
        let audioSrc = "";
        let volume = 0;
        if (data["config"] == "random") {
            const number = Math.floor(Math.random() * data["audio"].length);
            audioSrc = data["audio"][number];
            volume = data["volume"][number];
        }
        else {
            let number = data['indicator'];
            audioSrc = data["audio"][number];
            volume = data["volume"][number];
            number++;
            if (data["audio"].length == number)
                number = 0;
            data['indicator'] = number;
            storeAudio.save(tag, data);
        }

        const audio = new Audio(audioSrc);
        audio.volume = volume;
        $(audio).on('ended', function () {
            played.splice(played.indexOf(tag), 1)
        });
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
        $("#modalVoice").load("https://43d.github.io/amqVoiceUniversal/index2.html");

        $("#footerMenuBar").append($("<div>").attr("id", "divVoiceLoad"));
        $("#divVoiceLoad").load("https://43d.github.io/amqVoiceUniversal/button.html");
    }

    function styleDiv() {
        modal.style.position = "absolute"
        modal.style.width = "80%";
        modal.style.zIndex = "999999999";
        modal.style.right = "10%";
        modal.style.top = "0";
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
        // salvar novas interações
    }

    function setAudioBySongList(tag){
        const index =  $('#songList').find(":selected").val();
        const json = storeAudio.getByTag(tag);
        $("#voicePreview").attr("src", json.audio[index])
        $("#voicePreview")[0].volume = json.volume[index];
        $("#voiceVolume").val(Number(json.volume[index]) * 100);
    }

    function setCurrentAudio(tag) {
        const json = storeAudio.getByTag(tag);
        $("#voicePreview").attr("src", json.audio[0])
        $("#voicePreview")[0].volume = json.volume[0];
        $("#voiceVolume").val(Number(json.volume[0]) * 100);
        $('#simultaneousAllow').prop("checked", json.simultaneousAllow);
        $("#voiceFile").val("");
        $("#songListReplace").empty()
        $("#songList").empty()
        json.audio.forEach((v, k) => {
            const name = tag + " " + k;
            const option = $("<option>").attr("value", k).text(name);
            const option2 = $("<option>").attr("value", k).text(name);
            $("#songListReplace").append(option2);
            $("#songList").append(option);
        });
    }

    function onClickAudio() {
        $("#newAudioSave").click(() => save());
    }

    function onChangeSelect() {
        $('#voiceSelect').change(() => setCurrentAudio($('#voiceSelect').find(":selected").val()));
    }

    async function save() {
        if ($("#voiceFile").val())
            await source.update();
    }


    //salva mudaça de configs
    function saveConfigs() {
        const tag = $('#voiceSelect').find(":selected").val();
        const index = $('#songList').find(":selected").val();
        let json = storeAudio.getByTag(tag);

        json.simultaneousAllow = $('#simultaneousAllow').prop("checked");
        json.volume[index] = Number($("#voiceVolume").val()) / 100;
        json.config = $('input[type="radio"][name="audioAlgorit"]:checked').val();

        storeAudio.save(tag, json);

        $("#voicePreview")[0].volume = json.volume[index];
        $("#voiceSaveStatus").text("Update configs...")
        setTimeout(() => {
            $("#voiceAddStatus").text("");
            $("#voiceSaveStatus").text("");
        }, "3000")
    };

    function saveLocal(base64) {
        $("#voicePreview").attr("src", base64)
        const tag = $('#voiceSelect').find(":selected").val();
        const volume = Number($("#voiceVolume").val()) / 100;
        const newSong = $('input[type="radio"][name="audioCreator"]:checked').val();
        let json = storeAudio.getByTag(tag);
        if (newSong == "new") {
            json.volume.push(volume);
            json.audio.push(base64);
        } else {
            let index = $("#songListReplace").val();
            if (!$("#songListReplace").val())
                index = 0;
            json.audio[index] = base64;
        }

        storeAudio.save(tag, json);
        setTimeout(() => {
            $("#voiceAddStatus").text("");
        }, "5000")
        config.setCurrentAudio($('#voiceSelect').find(":selected").val());
    }

    function removeSong(tag){
        const index =  $('#songList').find(":selected").val();
        let json = storeAudio.getByTag(tag);
        json.volume.splice(index,1)
        json.audio.splice(index,1)
        storeAudio.save(tag, json);
        $("#voiceSaveStatus").text("Update configs...")
        setTimeout(() => {
            $("#voiceAddStatus").text("");
            $("#voiceSaveStatus").text("");
        }, "5000")
        config.setCurrentAudio($('#voiceSelect').find(":selected").val());
  
    }

    return {
        setCurrentAudio,
        events,
        saveLocal,
        saveConfigs,
        setAudioBySongList,
        removeSong
    }
}

function sourceAudio() {
    async function update() {
        let file = $("#voiceFile")[0].files[0];
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

async function Store() {
    const test = JSON.parse(localStorage.getItem(tags[0]));
    const test2 = JSON.parse(localStorage.getItem("VoiceUniversal"));
    if (test)
        migrate();
    else if (!test2)
        await defaultAudio();

    function migrate() {
        let song = {};
        tags.forEach((k) => {
            data = JSON.parse(localStorage.getItem(k));
            song[k] = {
                "simultaneousAllow": data.simultaneousAllow,
                "volume": [data.volume],
                "indicator": 0,
                "config": "random",
                "audio": [data.audio]
            };
            localStorage.removeItem(k);
        });
        const songString = JSON.stringify(song);
        localStorage.setItem("VoiceUniversal", songString);

    }

    function save(tag, json) {
        let data = JSON.parse(localStorage.getItem("VoiceUniversal"));
        if(!data)
            data = {};
        try {
            data[tag] = json;
            localStorage.setItem("VoiceUniversal", JSON.stringify(data));
            $("#voiceAddStatus").text("Saved!!! [" + tag + "]");
        } catch (error) {
            setCurrentAudio($('#voiceSelect').find(":selected").val());
            $("#voiceAddStatus").text("File size is big, not saved!!!");
        }
    }

    function reset() {
        localStorage.clear();
        $("#voiceAddStatus").text("Refresh is coming....");
        setTimeout(() => {
            location.reload();
        }, 2800);
    }

    function getByTag(tag) {
        const json = JSON.parse(localStorage.getItem("VoiceUniversal"))
        if(json)
            return json[tag];
        return null;
    }

    async function defaultAudio() {
        console.log("default");
        const defaultAudio = await $.get("https://43d.github.io/amqVoiceUniversal/defaultAudio.json");
        console.log(defaultAudio);

        defaultAudio.list.forEach((k) => {
            json = {
                "simultaneousAllow": k.data.simultaneousAllow,
                "volume": k.data.volume,
                "indicator": 0,
                "config": "random",
                "audio": k.data.audio
            };
            save(k.name, json);
        });
    }

    return {
        save,
        getByTag,
        reset
    }
}
