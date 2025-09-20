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
  _repeatBtn: document.querySelector(".btn-repeat"),
  _randomBtn: document.querySelector(".btn-random"),

  _isUserSeekingProgress: false,
  _isRepeatMode: localStorage.getItem("isRepeat") === "true",
  _isRandomMode: localStorage.getItem("isRandom") === "true",
  _playedSongs: JSON.parse(localStorage.getItem("playedSongs")) || [],

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
  _currentSongIndex: parseInt(localStorage.getItem("currentSongIndex")) || 0,

  getCurrentSong() {
    return this._songList[this._currentSongIndex];
  },

  loadCurrentSong() {
    const currentSong = this.getCurrentSong();
    this._songTitleElement.textContent = currentSong.name;
    this._audioElement.src = currentSong.path;
  },

  changeSong(step) {
    if (this._isRandomMode) {
      this.handleRandomSong();
    } else {
      this._currentSongIndex =
        (this._currentSongIndex + step + this._songList.length) %
        this._songList.length;

      this.loadCurrentSong(); // Update title and src
      this.renderPlayList(); // Update Highlight
      this._audioElement.play(); // Luôn phát khi đổi bài

      localStorage.setItem("currentSongIndex", this._currentSongIndex);
    }
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

    // Chỉ cập nhật khi có duration và user không kéo thanh progress
    if (!duration || this._isUserSeekingProgress) return;
    this._progressSlider.value = (currentTime / duration) * 100;
  },

  handleMouseDown() {
    this._isUserSeekingProgress = true;
  },

  handleMouseUp(e) {
    this._isUserSeekingProgress = false;

    const newProgressPercent = e.target.value;
    const newTimePosition =
      (newProgressPercent * this._audioElement.duration) / 100;
    this._audioElement.currentTime = newTimePosition;
  },

  handleAudioEnded() {
    if (this._isRepeatMode) {
      this._audioElement.play();
    } else if (this._isRandomMode) {
      this.handleRandomSong();
    } else {
      this.changeSong(this._NEXT);
    }
  },

  handleRepeatClick() {
    this._isRepeatMode = !this._isRepeatMode;
    this._repeatBtn.classList.toggle("active", this._isRepeatMode);
    localStorage.setItem("isRepeat", this._isRepeatMode);
  },

  handleRandomClick() {
    this._isRandomMode = !this._isRandomMode;
    this._randomBtn.classList.toggle("active", this._isRandomMode);
    localStorage.setItem("isRandom", this._isRandomMode);
    if (!this._isRandomMode) {
      // Reset lại playedSongs
      this._playedSongs = [];
      localStorage.setItem("playedSongs", JSON.stringify(this._playedSongs));
    }
  },

  handleRandomSong() {
    // Thêm bài hát vừa nghe vào playedSongs (nếu chưa có)
    if (!this._playedSongs.includes(this._currentSongIndex)) {
      this._playedSongs.push(this._currentSongIndex);
      localStorage.setItem("playedSongs", JSON.stringify(this._playedSongs));
    }

    // Nếu đã nghe hết _songList, reset playedSongs
    if (this._playedSongs.length >= this._songList.length) {
      this._playedSongs = []; // Reset về mảng rỗng
      localStorage.setItem("playedSongs", JSON.stringify(this._playedSongs));
    }

    // Lấy danh sách index song chưa nghe
    const availableIndexes = [];
    for (let i = 0; i < this._songList.length; i++) {
      if (!this._playedSongs.includes(i)) {
        availableIndexes.push(i);
      }
    }

    // Random từ Available
    const randomIndex = Math.floor(Math.random() * availableIndexes.length);
    this._currentSongIndex = availableIndexes[randomIndex];

    this.loadCurrentSong();
    this.renderPlayList();
    this._audioElement.play();

    localStorage.setItem("currentSongIndex", this._currentSongIndex);
  },

  handlePlaylistClick(e) {
    const songElement = e.target.closest(".song");
    if (songElement) {
      const index = Array.from(this._playListElement.children).indexOf(
        songElement
      );
      if (index >= 0 && index < this._songList.length) {
        this._currentSongIndex = index;
        if (
          this._isRandomMode &&
          !this._playedSongs.includes(this._currentSongIndex)
        ) {
          this._playedSongs.push(this._currentSongIndex);
          if (this._playedSongs.length >= this._songList.length) {
            this._playedSongs = [];
          }
          localStorage.setItem(
            "playedSongs",
            JSON.stringify(this._playedSongs)
          );
        }
        this.loadCurrentSong();
        this.renderPlayList();
        this._audioElement.play();

        localStorage.setItem("currentSongIndex", this._currentSongIndex);
      }
    }
  },

  // === ĐĂNG KÝ CÁC SỰ KIỆN ===
  setUpEventListeners() {
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

    this._progressSlider.addEventListener("mousedown", () => {
      this.handleMouseDown();
    });

    this._progressSlider.addEventListener("mouseup", (e) => {
      this.handleMouseUp(e);
    });

    this._audioElement.addEventListener("ended", () => {
      this.handleAudioEnded();
    });

    this._repeatBtn.addEventListener("click", () => {
      this.handleRepeatClick();
    });

    this._randomBtn.addEventListener("click", () => {
      this.handleRandomClick();
    });

    this._playListElement.addEventListener("click", (e) => {
      this.handlePlaylistClick(e);
    });
  },

  // Khởi tạo music player
  initialize() {
    if (
      this._playedSongs.some(
        (index) => index < 0 || index >= this._songList.length
      )
    ) {
      this._playedSongs = [];
      localStorage.setItem("playedSongs", JSON.stringify(this._playedSongs));
    }
    this.loadCurrentSong();
    this.setUpEventListeners();
    this.renderPlayList();
    this._repeatBtn.classList.toggle("active", this._isRepeatMode);
    this._randomBtn.classList.toggle("active", this._isRandomMode);
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

player.initialize();
