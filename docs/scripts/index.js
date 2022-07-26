  (() => {
    const element = document.querySelector('div.countdown')
    const date = parseInt(element.getAttribute("data-date"))
    const to = new Date(date)
    const days = element.querySelector("span.days")
    const hours = element.querySelector("span.hours")
    const minutes = element.querySelector("span.minutes")
    const seconds = element.querySelector("span.seconds")
    setInterval(function () {
      const diff = to.getTime() - Date.now()
      if (diff < 0) {
        diff = 0
      }

      const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))
      const diffHours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const diffMinutes = Math.floor((diff / (1000 * 60)) % 60)
      const diffSeconds = Math.floor((diff / 1000) % 60)

      days.innerText = diffDays < 10 ? "0" + diffDays : diffDays
      hours.innerText = diffHours < 10 ? "0" + diffHours : diffHours
      minutes.innerText = diffMinutes < 10 ? "0" + diffMinutes : diffMinutes
      seconds.innerText = diffSeconds < 10 ? "0" + diffSeconds : diffSeconds
    }, 1000)

    let playing = false
    const player = new Audio('/chiptune.mp3');
    window.addEventListener('play-click', (e) => {
      if (playing) {
        player.pause()
        e.for.classList.remove('fa-pause')
        e.for.classList.add('fa-play')
      } else {
        player.play()
        e.for.classList.remove('fa-play')
        e.for.classList.add('fa-pause')
      }

      playing = !playing
    })
    window.doon(document.body)
  })()