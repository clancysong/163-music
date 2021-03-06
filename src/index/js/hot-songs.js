import AV from 'leancloud-storage'
import { Model, View, Controller } from './core/base'

const model = new Model({
    init() { this.fetchSongs() },
    fetchSongs() {
        const query = new AV.Query('Song')
        return query.find().then((response) => {
            const data = { ...this.fetch() }
            data.songs = []
            response.forEach((item) => {
                data.songs.push({ id: item.id, ...item.attributes })
            })
            this.save(data)
            return data
        })
    }
})

const view = new View({
    el: document.getElementById('hot-songs-list'),
    template: `
        <li id="{{ id }}">
            <a href="./song.html?id={{ id }}">
                <div class="rank {{ isHottest }}">{{ rank }}</div>
                <div class="song-info">
                    <h4>{{ name }}</h4>
                    <span class="song-info">{{ singer }} - {{ name }}</span>
                </div>
                <span class="play-icon sprite"></span>
            </a>
        </li>
    `,
    render(data = {}) {
        const keys = ['id', 'name', 'singer', 'url']
        let html = ''
        data.songs.forEach((song, index) => {
            let rank = index + 1
            rank = rank.toString().length < 2 ? `0${rank}` : rank
            let li = keys.reduce((accum, current) => {
                const placeholder = new RegExp(`{{ ${current} }}`, 'g')
                return accum.replace(placeholder, song[current])
            }, this.template).replace('{{ rank }}', rank)
            if (index < 3) li = li.replace('{{ isHottest }}', 'hottest')
            html = html.concat(li)
        })
        this.el.innerHTML = html
    }
})

const controller = new Controller({ model, view })

controller.init()