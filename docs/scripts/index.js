  (() => {
    let playing = false
    const player = new Audio('/media/chiptune.mp3');
    player.loop = true
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