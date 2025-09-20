const player = {
  _playListElement: document.querySelector(".playlist"),
  _songTitleElement: document.querySelector(".song-title"),
  _audioElement: document.querySelector("#audio"),
  _playPauseBtn: document.querySelector(".btn-toggle-play"),
  _playIcon: document.querySelector("#play-icon"),
  _cdElement: document.querySelector(".cd"),
  _nextBtn: document.querySelector(".btn-next"),
  _prevBtn: document.querySelector(".btn-prev"),
  _progressSlider: document.querySelector("#progress"),

  _songList: [
    {
      id: 1,
      name: "Còn Gì Đẹp Hơn",
      path: "./musics/Còn Gì Đẹp Hơn (Mưa Đỏ Original Soundtrack).mp3",
      artist: "Đặng Hải Anh",
    },
    {
      id: 2,
      name: "Công Ty 4",
      path: "./musics/Công Ty 4.mp3",
      artist: "Đặng Hoàng Anh",
    },
    {
      id: 3,
      name: "Không Buông",
      path: "./musics/Không Buông.mp3",
      artist: "Đặng Tuấn Anh",
    },
  ],

  _NEXT: 1,
  _PREV: -1,
  _MIN_TIME_TO_RESTART: 2,
  _currentSongIndex: 0,

  getCurrentSong() {
    return this._songList[this._currentSongIndex];
  },

  loadCurrentSong() {
    const currentSong = this.getCurrentSong();
    this._songTitleElement.textContent = currentSong.name;
    this._audioElement.src = currentSong.path;
  },

  changeSong(step) {
    this._currentSongIndex =
      (this._currentSongIndex + step + this._songList.length) %
      this._songList.length;

    this.loadCurrentSong(); // Update title and src
    this.renderPlayList(); // Update Highlight
    this._audioElement.play(); // Luôn phát khi đổi bài
  },

  // === CÁC PHƯƠNG THỨC XỬ LÝ SỰ KIỆN ===
  handlePlayPauseClick() {
    if (this._audioElement.paused) {
      this._audioElement.play();
    } else {
      this._audioElement.pause();
    }
  },

  handleAudioPlay() {
    this._playIcon.classList.remove("fa-play");
    this._playIcon.classList.add("fa-pause");

    this._cdElement.classList.add("playing");
    this._cdElement.style.animationPlayState = "running";
  },

  handleAudioPause() {
    this._playIcon.classList.remove("fa-pause");
    this._playIcon.classList.add("fa-play");

    this._cdElement.style.animationPlayState = "paused";
  },

  handleNextClick() {
    this.changeSong(this._NEXT);
  },

  handlePreviousClick() {
    if (this._audioElement.currentTime > this._MIN_TIME_TO_RESTART) {
      this._audioElement.currentTime = 0;
    } else {
      this.changeSong(this._PREV);
    }
  },

  handleTimeUpdate() {
    const { currentTime, duration } = this._audioElement;

    // Chỉ cập nhật khi có duration và user khong kéo thanh progress
    if (!duration) return;
    this._progressSlider.value = (currentTime / duration) * 100;
  },

  // === ĐĂNG KÝ CÁC SỰ KIỆN ===
  setUpEventListeners() {
    this.loadCurrentSong();

    this._playPauseBtn.addEventListener("click", () => {
      this.handlePlayPauseClick();
    });

    this._audioElement.addEventListener("play", () => {
      this.handleAudioPlay();
    });

    this._audioElement.addEventListener("pause", () => {
      this.handleAudioPause();
    });

    this._nextBtn.addEventListener("click", () => this.handleNextClick());
    this._prevBtn.addEventListener("click", () => this.handlePreviousClick());

    this._audioElement.addEventListener("timeupdate", () =>
      this.handleTimeUpdate()
    );

    this.renderPlayList();
  },

  renderPlayList() {
    const playListHTML = this._songList
      .map((song, index) => {
        return `
        <div class="song ${this._currentSongIndex === index ? "active" : ""}">
            <div
                class="thumb"
                style="
                background-image: url('https://i.ytimg.com/vi/jTLhQf5KJSc/maxresdefault.jpg');
                "></div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.artist}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>
        `;
      })
      .join("");
    this._playListElement.innerHTML = playListHTML;
  },
};

player.setUpEventListeners();
