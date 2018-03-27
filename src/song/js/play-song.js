import AV from 'leancloud-storage'
import { Model, View, Controller } from './core/base'

const model = new Model({
    data: { isPlaying: true },
    init() { return this.fetchSong() },
    getQueryParams() {
        let { search } = window.location
        if (search[0] === '?') search = search.substr(1)
        const obj = {}
        search.split('&').filter(v => v).forEach((item) => {
            const [key, value] = item.split('=')
            obj[key] = value
        })
        return obj
    },
    fetchSong() {
        const songId = this.getQueryParams().id
        const query = new AV.Query('Song')
        return query.get(songId).then((response) => {
            const data = { ...this.fetch(), song: { id: response.id, ...response.attributes } }
            this.save(data)
            return data
        })
    }
})

const view = new View({
    el: document.getElementById('player'),
    template: `
        <div class="player">
            <audio id="audio" src="{{ url }}"></audio>
            <img src="http://p1.music.126.net/K3S3sw_o7gs37CR-ew1toA==/109951163208886843.webp" class="cover absolute-center"></img>
            <button id="play-btn" class="play-btn absolute-center">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-play1"></use>
                </svg>
            </button>
        </div>
        <div class="lyric">
            <div class="song-info">
                <span class="name">{{ name }}</span>
                <span>-</span>
                <span class="singer">{{ singer }}</span>
                </span>
            </div>
        </div>
    `,
    render(data = {}) {
        if (!this.el.innerHTML) {
            const keys = ['id', 'name', 'singer', 'url']
            this.el.innerHTML = keys.reduce((accum, current) => {
                const placeholder = new RegExp(`{{ ${current} }}`, 'g')
                return accum.replace(placeholder, data.song[current])
            }, this.template)
        }
        const audio = this.el.querySelector('#audio')
        if (data.isPlaying) {
            audio.play()
        } else {
            audio.pause()
        }
    }
})

const controller = new Controller({
    model,
    view,
    bindEvents() {
        const playBtn = this.view.el.querySelector('#play-btn')
        playBtn.addEventListener('click', () => {
            const data = this.model.fetch()
            this.model.save({ ...data, isPlaying: !data.isPlaying })
        })
    }
})

controller.init().then(() => {
    controller.bindEvents()
})