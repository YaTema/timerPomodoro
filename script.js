let workTime = 25 * 60
let breakTime = 5 * 60

let saved = JSON.parse(localStorage.getItem("pomodoroData")) || {}

let mode = saved.mode || "work"
let count = saved.count || 0
let total = saved.total || 0
let history = saved.history || []
let endTime = saved.endTime || null

let time = workTime
let timer = null
let running = false

let timeEl = document.getElementById("time")
let startBtn = document.getElementById("start")
let resetBtn = document.getElementById("reset")
let modeEl = document.getElementById("mode")
let countEl = document.getElementById("count")
let totalEl = document.getElementById("total")
let historyEl = document.getElementById("history")
let sound = document.getElementById("breakSound")

function format(t) {
    let m = Math.floor(t / 60)
    let s = t % 60
    if (m < 10) m = "0" + m
    if (s < 10) s = "0" + s
    return m + ":" + s
}

function save() {
    localStorage.setItem("pomodoroData", JSON.stringify({
        mode,
        count,
        total,
        history,
        endTime
    }))
}

function update() {
    timeEl.textContent = format(time)
    countEl.textContent = count
    totalEl.textContent = total
    modeEl.textContent = mode === "work" ? "Работа" : "Отдых"
    modeEl.className = mode
}

function showHistory() {
    historyEl.innerHTML = ""
    history.slice(-7).forEach(item => {
        let li = document.createElement("li")
        li.textContent = item.date + " — " + item.count
        historyEl.appendChild(li)
    })
}

function switchMode() {

    clearInterval(timer)
    running = false

    sound.currentTime = 0
    sound.play()

    if (mode === "work") {

        alert("Работа завершена! Время отдыхать.")

        count++
        total += 25

        let today = new Date().toLocaleDateString()
        let day = history.find(h => h.date === today)

        if (day) {
            day.count++
        } else {
            history.push({ date: today, count: 1 })
        }

        mode = "break"
        time = breakTime

    } else {

        alert("Отдых завершён! Пора работать.")

        mode = "work"
        time = workTime
    }

    endTime = Date.now() + time * 1000
    save()
    update()
    showHistory()

    startTimer()
    startBtn.textContent = "Пауза"
}

function startTimer() {

    clearInterval(timer)

    running = true
    endTime = Date.now() + time * 1000
    save()

    timer = setInterval(() => {

        let diff = Math.floor((endTime - Date.now()) / 1000)
        time = diff > 0 ? diff : 0
        update()

        if (time <= 0) {
            switchMode()
        }

    }, 1000)
}

startBtn.onclick = function () {

    if (!running) {
        startTimer()
        startBtn.textContent = "Пауза"
    } else {
        clearInterval(timer)
        running = false
        endTime = null
        save()
        startBtn.textContent = "Старт"
    }

}

resetBtn.onclick = function () {

    clearInterval(timer)
    running = false
    mode = "work"
    time = workTime
    endTime = null
    startBtn.textContent = "Старт"
    save()
    update()

}

if (endTime) {

    let diff = Math.floor((endTime - Date.now()) / 1000)

    if (diff > 0) {
        time = diff
        startTimer()
        startBtn.textContent = "Пауза"
    } else {
        switchMode()
    }

} else {
    time = mode === "work" ? workTime : breakTime
}

update()
showHistory()