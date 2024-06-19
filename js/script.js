let currentSong = new Audio;
let songs;
let currFolder;

let currentVolume;

let volumeSlider = document.getElementById("volumeSlider");



function formatTime(seconds) {

    if(isNaN(seconds) || seconds < 0){
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder){
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    console.log(div)
    let as = div.getElementsByTagName("a");
    songs = [];
    
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `
        <li>
            <img class="invert" src="/img/music.svg" alt="">
            <div class="info">
                <div>${decodeURIComponent(song)}</div>
                <div>Song Artist</div>
            </div>
            <div class="playnow">
                <img class="invert" id="libraryPlay" src="/img/play2.svg" alt="">
            </div>
        </li> `;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.querySelector(".playnow").addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
            
        })
    });

    return songs;

}

const playMusic = (track, paused) => {
    currentSong.src = `/${currFolder}/` + track;
    if(!paused){
        currentSong.play();
        play.src = "/img/pause.svg";
    }

    document.querySelector(".songInfo").innerHTML = decodeURIComponent(track).replace(".mp3", "");
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums(){
    let a = await fetch(`/songs/`)
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
            
        if(e.href.includes("/songs/")){
            let folder = e.href.split("/songs/").slice(-2)[1];

            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

/*
                        <div class="playlistPlay">
                            
                            <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="fill: black; width: 24px; height: 24px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path>
                            </svg>
                              
                        </div>
*/

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0], true)
            document.querySelector(".left").style.left = "0";
            play.src="/img/play3.svg";
            document.querySelector(".circle").style.left="0%";
        })
        
    })

    // Array.from(document.getElementsByClassName("card")).forEach(e => {
    //     e.querySelector(".playlistPlay").addEventListener("click", async item => {
    //         playMusic(songs[0])
            
    //     })
    // })

}

async function main(){

    // await getSongs("songs/Lofi Beats");

    displayAlbums();

    //Default Settings
    // playMusic(songs[0], true);
    currentSong.volume = 0.5;
    volumeSlider.value = 50;


    //SpaceBar Play

    document.addEventListener("keydown", function(event){
        if(event.code === 'Space' || event.key === ' '){
            if(currentSong.paused){
                currentSong.play();
                play.src = "/img/pause.svg";
                
            }
            else{
                currentSong.pause();
                play.src = "/img/play3.svg";
            }
        }
    })

    //Play Next Previous Buttons

    play.addEventListener("click", () => {
        if(currentSong.paused){
            currentSong.play();
            play.src = "/img/pause.svg";
            
        }
        else{
            currentSong.pause();
            play.src = "/img/play3.svg";
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0]);
        if((index + 1) < songs.length){
            playMusic(songs[index + 1]);
        }
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0]);
        if((index - 1) >= 0){
            playMusic(songs[index - 1]);
        }
    });

    //Music Control

    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration*percent)/100;
    })

    if(currentSong.currentTime === currentSong.duration){
        play.src = "/img/play3.svg";

    }


    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value)/100;
        currentVolume = currentSong.volume;
        if(currentSong.volume === 0){
            document.getElementById("volumeIcon").src = "/img/mute.svg";
        }

        else if(currentSong.volume <= 0.3){
            document.getElementById("volumeIcon").src = "/img/lowVolume.svg";
        }

        else{
            document.getElementById("volumeIcon").src = "/img/volume.svg";
        }


    });

    volumeIcon.addEventListener("click", () => {
        if(currentSong.volume > 0){
            currentSong.volume = 0;
            document.getElementById("volumeIcon").src = "/img/mute.svg";
            volumeSlider.value = 0;
        }
        else if(currentSong.volume === 0){
            currentSong.volume = currentVolume;
            if(currentVolume <= 0.3){
                document.getElementById("volumeIcon").src = "/img/lowVolume.svg";
            }
            else{
                document.getElementById("volumeIcon").src = "/img/volume.svg";

            }
            volumeSlider.value = currentVolume*100;
        }
    });


    

}

main();
