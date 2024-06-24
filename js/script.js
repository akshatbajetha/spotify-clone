let currentSong = new Audio();
let songs;
let currFolder;

let currentVolume;

let volumeSlider = document.getElementById("volumeSlider");

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let response = await fetch("/songs.json");
  let data = await response.json();

  let playlist = data.playlists.find((p) => `songs/${p.name}` === folder);
  if (!playlist) {
    console.error("Playlist not found");
    return [];
  }

  songs = playlist.songs;

  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `
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

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.querySelector(".playnow").addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML);
    });
  });

  return songs;
}

const playMusic = (track, paused) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!paused) {
    currentSong.play();
    play.src = "/img/pause.svg";
  }

  document.querySelector(".songInfo").innerHTML = decodeURIComponent(
    track
  ).replace(".mp3", "");
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let response = await fetch("/songs.json");
  let data = await response.json();
  let playlists = data.playlists;

  let cardContainer = document.querySelector(".cardContainer");
  cardContainer.innerHTML = "";

  playlists.forEach((playlist) => {
    cardContainer.innerHTML += `<div data-folder="songs/${playlist.name}" class="card">
      <img src="${playlist.cover}" alt="">
      <h2>${playlist.info.title}</h2>
      <p>${playlist.info.description}</p>
    </div>`;
  });

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(item.currentTarget.dataset.folder);
      playMusic(songs[0], true);
      document.querySelector(".left").style.left = "0";
      play.src = "/img/play3.svg";
      document.querySelector(".circle").style.left = "0%";
    });
  });
}

async function main() {
  displayAlbums();

  currentSong.volume = 0.5;
  volumeSlider.value = 50;

  document.addEventListener("keydown", function (event) {
    if (event.code === "Space" || event.key === " ") {
      if (currentSong.paused) {
        currentSong.play();
        play.src = "/img/pause.svg";
      } else {
        currentSong.pause();
        play.src = "/img/play3.svg";
      }
    }
  });

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "/img/play3.svg";
    }
  });

  next.addEventListener("click", () => {
    let currentSongPath = currentSong.src.split("/").slice(-1)[0];
    let index = songs.findIndex(
      (song) => song === decodeURIComponent(currentSongPath)
    );
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  previous.addEventListener("click", () => {
    let currentSongPath = currentSong.src.split("/").slice(-1)[0];
    let index = songs.findIndex(
      (song) => song === decodeURIComponent(currentSongPath)
    );
    if (index !== -1 && index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${formatTime(
      currentSong.currentTime
    )} / ${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      currentVolume = currentSong.volume;
      if (currentSong.volume === 0) {
        document.getElementById("volumeIcon").src = "/img/mute.svg";
      } else if (currentSong.volume <= 0.3) {
        document.getElementById("volumeIcon").src = "/img/lowVolume.svg";
      } else {
        document.getElementById("volumeIcon").src = "/img/volume.svg";
      }
    });

  volumeIcon.addEventListener("click", () => {
    if (currentSong.volume > 0) {
      currentSong.volume = 0;
      document.getElementById("volumeIcon").src = "/img/mute.svg";
      volumeSlider.value = 0;
    } else if (currentSong.volume === 0) {
      currentSong.volume = currentVolume;
      if (currentVolume <= 0.3) {
        document.getElementById("volumeIcon").src = "/img/lowVolume.svg";
      } else {
        document.getElementById("volumeIcon").src = "/img/volume.svg";
      }
      volumeSlider.value = currentVolume * 100;
    }
  });

  currentSong.addEventListener("ended", () => {
    let currentSongPath = currentSong.src.split("/").slice(-1)[0];
    let index = songs.findIndex(
      (song) => song === decodeURIComponent(currentSongPath)
    );
    if (index !== -1 && index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
    else{
      play.src = "/img/play3.svg";
    }
  });
  

}

main();
