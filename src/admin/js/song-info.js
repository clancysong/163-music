import AV from 'leancloud-storage'
import eventHub from './core/event-hub'
import { Model, View, Controller } from './core/base'

const model = new Model({
    createSong(data) {
        const Song = AV.Object.extend('Song')
        const song = new Song()
        song.set('name', data.name)
        song.set('singer', data.singer)
        song.set('url', data.url)
        song.set('cover', data.cover)
        return song.save().then((response) => {
            this.save()
            const newData = { id: response.id, ...response.attributes }
            return { ...newData }
        })
    },
    updateSong(data) {
        const song = AV.Object.createWithoutData('Song', this.data.id)
        song.set('name', data.name)
        song.set('singer', data.singer)
        song.set('url', data.url)
        song.set('cover', data.cover)
        return song.save().then((response) => {
            this.save({ id: response.id, ...response.attributes })
            return { ...this.fetch() }
        })
    }
})

const view = new View({
    el: document.getElementById('song-info'),
    template: `
            <input type="text" name="name" placeholder="歌曲名" value="__name__">
            <input type="text" name="singer" placeholder="歌手名" value="__singer__">
            <input type="text" name="url" placeholder="歌曲链接" value="__url__">
            <input type="text" name="cover" placeholder="歌曲封面" value="__cover__">
            <button>确认</button>
    `,
    keys: ['name', 'singer', 'url', 'cover'],
    render(data = {}) {
        let html = this.template
        this.keys.forEach((key) => {
            html = html.replace(`__${key}__`, data[key] || '')
        })
        this.el.innerHTML = html
    }
})

const controller = new Controller({
    view,
    model,
    state: 'create',
    getInputValue() {
        const data = {}
        this.view.keys.forEach((key) => {
            data[key] = this.view.el.querySelector(`input[name=${key}]`).value.trim()
        })
        return data
    },
    addSong(data) {
        this.model.createSong(data).then(() => {
            eventHub.emit('addsong')
            alert('添加歌曲成功！')
        })
    },
    modifySong(data) {
        this.model.updateSong(data).then(() => {
            eventHub.emit('updatesong')
            alert('修改歌曲信息成功！')
        })
    },
    bindEvents() {
        eventHub.on('clickcreate', () => {
            this.model.save()
            this.state = 'create'
        })
        eventHub.on('uploaded', (data) => {
            this.model.save(data)
            this.state = 'create'
        })
        eventHub.on('selectedsong', (data) => {
            this.model.save(data)
            this.state = 'update'
        })
        this.view.el.addEventListener('submit', (event) => {
            event.preventDefault()
            const data = this.getInputValue()
            if (Object.keys(data).every(key => data[key])) {
                if (this.state === 'create') {
                    this.addSong(data)
                } else if (this.state === 'update') {
                    this.modifySong(data)
                }
            }
        })
    }
})

controller.init()