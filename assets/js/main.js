
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const PLAYER_STORAGE_KEY = 'Music_player'

const playerElement = $('.player')
const dashboardElement = $('.dashboard')
const playListElement = $('.play-list')
const cdElement = $('.cd')
const cdWidth = cdElement.offsetWidth
const titleSong = $('header h2')
const cdThumb = $('.cd-thumb')
const playBtn = $('.toggle-play-btn')
const progressElement = $('#progress')
const audio = $('#audio')
const prevBtn = $('.previous-btn')
const nextBtn = $('.next-btn')
const randomBtn = $('.random-btn')
const repeatBtn = $('.repeat-btn')
const volumeElement = $('#control-volume')
const playVolumeElement = $('.play-volume')
const stopVolumeElement = $('.stop-volume')


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    isScroll: false,
    scrollY: 0,
    arr: [0],
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Quả phụ tướng quân",
            singer: "Dung Hoàng Phạm",
            path: 'assets/music/song_1.mp3',
            image: 'assets/img/song_1.jpg',
        },
        {
            name: "Vỡ tan",
            singer: "Hiền Hồ, Trịnh Thanh Bình",
            path: 'assets/music/song_2.mp3',
            image: 'assets/img/song_2.jpg',
        },
        {
            name: "Ngủ một mình",
            singer: "Hiếu thứ hai",
            path: 'assets/music/song_3.mp3',
            image: 'assets/img/song_3.jpg',
        },
        {
            name: "Ngày mai em đi mất",
            singer: "Đạt G",
            path: 'assets/music/song_4.mp3',
            image: 'assets/img/song_4.jpg',
        },
        {
            name: "Calm Down",
            singer: "Rema, Selena Gomez",
            path: 'assets/music/song_5.mp3',
            image: 'assets/img/song_5.jpg',
        },
        {
            name: "A Sky Full Of Stars",
            singer: "Coldplay",
            path: 'assets/music/song_6.mp3',
            image: 'assets/img/song_6.jpg',
        },
        {
            name: "Mong một ngày anh nhớ",
            singer: "Huỳnh James x Pjnboys",
            path: 'assets/music/song_7.mp3',
            image: 'assets/img/song_7.jpg',
        },
        {
            name: "Khuất Lối (Orinn Remix)",
            singer: "H Kray",
            path: 'assets/music/song_8.mp3',
            image: 'assets/img/song_8.jpg',
        },
        {
            name: "Face remix",
            singer: "Nu\'est",
            path: 'assets/music/song_9.mp3',
            image: 'assets/img/song_9.jpg',
        },
        {
            name: 'Dreamers',
            singer: 'BTS Jung Kook',
            path: 'assets/music/song_10.mp3',
            image: 'assets/img/song_10.jpg',
        },
    ],
    setConfig: function(key, val) {
        this.config[key] = val;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    difineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    render: function() {
        _this = this
        let html = this.songs.map(function(song, index) {
            return `
            <div class="song ${_this.currentIndex === index ? 'active' : ''}" data-index="${index}">
                <div class="thunb" style="background-image: url(${song.image})">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fa-solid fa-ellipsis"></i>
                </div>
            </div>
            `
        })
        playListElement.innerHTML = html.join('')
    },
    handleEvent: function () {
        const _this = this
        // Xu ly CD quay
        const cdThumbAnimate = cdThumb.animate(
            [{transform: 'rotate(360deg)'}], {
                duration: 10000,
                iterations: Infinity
            }
        )
        cdThumbAnimate.pause()
        document.onscroll = function () {
            var promise = new Promise(function (resolve) {
                _this.scrollY = document.documentElement.scrollTop
                if(!_this.isScroll) resolve()
            })
            promise
                .then(function () {
                    _this.sloveChangeSizeCd(_this.scrollY)
                    _this.changeHieghtPlayList()
                })
        }

        // Xu ly khi click play
        playBtn.addEventListener("click", () => {
            if(_this.isPlaying) {
                audio.pause()
            }
            else {
                audio.play()
            }
        })
        // Khi song duoc play
        audio.onplay = function (e) {
            _this.isPlaying = true
            playerElement.classList.add('playing')
            cdThumbAnimate.play()
        }
        // Khi song bi pause
        audio.onpause = function () {
            _this.isPlaying = false
            playerElement.classList.remove('playing')
            cdThumbAnimate.pause()
        }
        // Xu ly khi tien do bai hat thay doi
        audio.ontimeupdate = function () {
            // Xu ly chay / tua song
            if(audio.duration) progressElement.value = (audio.currentTime/audio.duration)*100
            setTimeout(function() {
                cdElement.classList.toggle('change-color')
            }, 500)
            function formTime(time) {
                if(time < 10)
                    return '0' + time
                return time + ''
            }

            let date1 = new Date(Math.floor(audio.currentTime*1000))
            let hh1 = mm1 = date1.getMinutes(), ss1 = date1.getSeconds()
            mm1 = formTime(mm1)
            ss1 = formTime(ss1)

            let totalTime = (audio.duration ? audio.duration*1000 : 0)
            let date2 = new Date(Math.floor(totalTime))
            let hh2 = mm2 = date2.getMinutes(), ss2 = date2.getSeconds()
            mm2 = formTime(mm2)
            ss2 = formTime(ss2)

            $('.play-time').textContent = `${mm1}:${ss1} / ${mm2}:${ss2}`
        }
        // Xu ly khi tua tua song
        progressElement.oninput = function() {
            if(audio.duration)
                audio.currentTime = (progressElement.value/100)*audio.duration
        }
        // Xu ly khi click previous button
        prevBtn.onclick = function () {
            _this.isRandom ? _this.playRandomSong() : _this.prevSong()
            prevBtn.classList.add('active')
            audio.play()
            setTimeout(function () {
                prevBtn.classList.remove('active')
            }, 200)
            _this.addActiveIntoSong($$('.song')[_this.currentIndex], $('.song.active'))
            _this.scrollToActiveSong()
            _this.setConfig('currentIndex', _this.currentIndex)
        }
        // Xu ly khi click next button
        nextBtn.onclick = function () {
            _this.isRandom ? _this.playRandomSong() : _this.nextSong()
            nextBtn.classList.add('active')
            audio.play()
            setTimeout(function () {
                nextBtn.classList.remove('active')
            }, 200)
            _this.addActiveIntoSong($$('.song')[_this.currentIndex], $('.song.active'))
            _this.scrollToActiveSong()
            _this.setConfig('currentIndex', _this.currentIndex)
        }
        // Xu ly click bat / tat random
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            randomBtn.classList.toggle('active', _this.isRandom)
            _this.setConfig('isRandom', _this.isRandom)
        }
        // Xu ly khi click bat / tat repeat random
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            repeatBtn.classList.toggle('active', _this.isRepeat)
            _this.setConfig('isRepeat', _this.isRepeat)
        }
        // Xu ly next song khi ended
        audio.onended = function () {
           _this.isRepeat ? _this.playRepeate() : nextBtn.click()
        }
        // Xu ly khi click into song
        playListElement.onclick = function (e) {
            var songElement = e.target.closest('.song:not(.active)')
            var optionElement = e.target.closest('.option')
            if(songElement || optionElement) {
                // Khi click into song
                if(songElement) {
                    _this.addActiveIntoSong(songElement, $('.song.active'))
                    _this.currentIndex = Number(songElement.dataset.index)
                    _this.loadCurrentSong()
                    audio.play()
                    _this.setConfig('currentIndex', _this.currentIndex)
                }
                // khi click into option
                if(optionElement) {

                }
            }
        }
        // Xu ly am luong cua song
        volumeElement.onchange = function() {
            audio.volume = volumeElement.value/100
            if(audio.volume === 0) {
                stopVolumeElement.style.display = 'block'
                playVolumeElement.style.display = 'none'
            }else {
                playVolumeElement.style.display = 'block'
                stopVolumeElement.style.display = 'none'
            }
        }
        playVolumeElement.onclick = function() {
            stopVolumeElement.style.display = 'block'
            playVolumeElement.style.display = 'none'
            audio.volume = 0
            volumeElement.value = 0
            console.log('123')
        }
    },
    loadCurrentSong: function() {
        titleSong.innerText = this.currentSong?.name
        cdThumb.style.backgroundImage = `url('${this.currentSong?.image}')`
        audio.setAttribute('src', this.currentSong?.path)

        let playListHieght = screen.height - dashboardElement.offsetHeight
        playListElement.style.maxHeight = playListHieght + 'px'
        
        progressElement.value = 0

        this.changeHieghtPlayList()
        
    },
    loadConfig: function () {
        // Khong an toan trong tuong lai khi mot so thuoc tinh config khong muon hop nhat
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
        this.currentIndex = Number(this.config.currentIndex)
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)

        progressElement.value = 0
        audio.volume = 0
    
    },
    prevSong: function() {
        this.currentIndex -= 1
        if(this.currentIndex < 0)
            this.currentIndex = this.songs.length - 1
        this.loadCurrentSong()
    },
    nextSong: function() {
        this.currentIndex += 1
            if(this.currentIndex > this.songs.length - 1)
                this.currentIndex = 0
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newCurrentIndex
        do{
            newCurrentIndex = Math.floor(Math.random()*this.songs.length)
            if(this.arr.length === this.songs.length) {
                this.arr = [this.currentIndex]
            }
        }while(newCurrentIndex === this.currentIndex || this.arr.includes(newCurrentIndex))
        this.arr.push(newCurrentIndex)
        this.currentIndex = newCurrentIndex
        this.loadCurrentSong()
    },
    playRepeate: function() {
        this.loadCurrentSong()
        audio.play()
    },
    addActiveIntoSong: function(songElement, songActiveElement) {
        songActiveElement.classList.remove('active')
        songElement.classList.add('active')
        
    },
    scrollToActiveSong: function() {
        
        var promise = new Promise(function(resolve) {
            resolve()
        })
        
        promise
            .then(function() {
                isScroll = true
                return document.documentElement.scrollTop
            })
            .then(function(a) {
                setTimeout(function() {
                    $('.song.active').scrollIntoView({
                        behavior: 'auto',
                        block: 'start',
                    })
                    document.documentElement.scrollTop = a
                }, 300)
                return a
            })
            .then(function(a) {
                isScroll = false
                document.documentElement.scrollTop = a
            })
        
    },
    sloveChangeSizeCd: function(val) {
        let scrollTop = val
        let newCdWidth = cdWidth - scrollTop
        cdElement.style.width = newCdWidth < 0 ? 0 : newCdWidth + 'px'
        cdElement.style.opacity = newCdWidth/cdWidth
    },
    changeHieghtPlayList: function() {
        let playListHieght = screen.height - dashboardElement.offsetHeight - 90
        playListElement.style.maxHeight = playListHieght + 'px'
    },
    start: function() {
        playerElement.style.height = screen.height + 250 + 'px'
        this.loadConfig()
        this.difineProperties()
        this.loadCurrentSong()
        this.handleEvent()
        this.render()
        
    }
}
app.start()