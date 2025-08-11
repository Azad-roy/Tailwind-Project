const songsList = document.getElementById('songsList');
const recentSongs = document.getElementById('recentSongs');
const audioPlayer = document.getElementById('audioPlayer');
const miniPlayPauseBtn = document.getElementById('miniPlayPauseBtn');
const miniPlayer = document.getElementById('miniPlayer');
const miniProgressBar = document.getElementById('miniProgressBar');

let currentSong = null;
let songs = [];
let recentlyPlayed = [];

const apiResponse = [];

function fetchSongs() {
    fetch('https://sonix-s830.onrender.com/api/songs')
        .then(response => response.json())
        .then(data => {
            songs = data;
            renderSongs();
        });

    songs = apiResponse;
    recentlyPlayed = [...songs].sort(() => 0.5 - Math.random()).slice(0, 6);
    renderSongs();
    renderRecentSongs();
}

function renderRecentSongs() {
    recentSongs.innerHTML = recentlyPlayed.map(song => `
                <div class="bg-gray-900/50 hover:bg-gray-800 rounded-lg p-3 transition cursor-pointer group" data-id="${song.id}">
                    <div class="relative mb-3">
                        <img src="${song.previewImg}" alt="Album cover" class="w-full aspect-square rounded-lg object-cover">
                        <button class="absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-105 transform transition">
                            <i class="fas fa-play text-white"></i>
                        </button>
                    </div>
                    <h3 class="font-medium text-sm truncate">${song.title}</h3>
                    <p class="text-xs text-gray-400 truncate">${song.artistName}</p>
                </div>
            `).join('');

    document.querySelectorAll('#recentSongs > div').forEach(card => {
        card.addEventListener('click', function () {
            const songId = this.getAttribute('data-id');
            const song = songs.find(s => s.id === songId);
            if (song) {
                playSong(song);
                if (!recentlyPlayed.some(s => s.id === songId)) {
                    recentlyPlayed.unshift(song);
                    if (recentlyPlayed.length > 6) recentlyPlayed.pop();
                    renderRecentSongs();
                }
            }
        });
    });
}

function renderSongs() {
    if (songs.length === 0) {
        songsList.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-400">No songs available</td></tr>';
        return;
    }

    songsList.innerHTML = songs.map((song, index) => `
                <tr class="border-b border-gray-800 hover:bg-gray-900/50 transition cursor-pointer song-row group" data-id="${song.id}">
                    <td class="p-4 text-gray-400 w-12 relative">
                        <span class="group-hover:hidden">${index + 1}</span>
                        <button class="play-icon absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden group-hover:block text-white">
                            <i class="fas fa-play"></i>
                        </button>
                    </td>
                    <td class="p-4">
                        <div class="flex items-center">
                            <img src="${song.previewImg}" alt="Album cover" class="w-10 h-10 rounded mr-3 hidden sm:block">
                            <div>
                                <div class="font-medium">${song.title}</div>
                                <div class="text-sm text-gray-400">${song.artistName}</div>
                            </div>
                        </div>
                    </td>
                    <td class="p-4 hidden md:table-cell text-gray-400">${song.albumName || '-'}</td>
                    <td class="p-4 text-right text-gray-400">${formatTime(song.duration)}</td>
                </tr>
            `).join('');

    document.querySelectorAll('.song-row').forEach(row => {
        row.addEventListener('click', function () {
            const songId = this.getAttribute('data-id');
            const song = songs.find(s => s.id === songId);
            if (song) {
                playSong(song);
                if (!recentlyPlayed.some(s => s.id === songId)) {
                    recentlyPlayed.unshift(song);
                    if (recentlyPlayed.length > 6) recentlyPlayed.pop();
                    renderRecentSongs();
                }
            }
        });
    });
}

function playSong(song) {
    currentSong = song;
    audioPlayer.src = song.songUrl;
    audioPlayer.play();

    document.getElementById('miniPlayerTitle').textContent = song.title;
    document.getElementById('miniPlayerArtist').textContent = song.artistName;
    document.getElementById('miniPlayerImage').src = song.previewImg;
    document.getElementById('miniDuration').textContent = formatTime(song.duration);

    miniPlayer.classList.remove('hidden');

    miniPlayPauseBtn.innerHTML = '<i class="fas fa-pause text-xs"></i>';
}

function formatTime(seconds) {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

miniPlayPauseBtn.addEventListener('click', function () {
    if (audioPlayer.paused) {
        if (currentSong) {
            audioPlayer.play();
            this.innerHTML = '<i class="fas fa-pause text-xs"></i>';
        }
    } else {
        audioPlayer.pause();
        this.innerHTML = '<i class="fas fa-play text-xs"></i>';
    }
});

audioPlayer.addEventListener('timeupdate', function () {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    miniProgressBar.style.width = `${progress}%`;

    document.getElementById('miniCurrentTime').textContent = formatTime(audioPlayer.currentTime);
});

audioPlayer.addEventListener('ended', function () {
    miniPlayPauseBtn.innerHTML = '<i class="fas fa-play text-xs"></i>';
});

fetchSongs();