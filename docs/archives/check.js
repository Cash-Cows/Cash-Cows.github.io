(async (window) => {
  //------------------------------------------------------------------//
  // Variables
  const verified = await (await fetch('/data/verified.json')).json()

  //------------------------------------------------------------------//
  // Functions
  const harlemify = (window, options) => {
    function c(){var e=window.document.createElement("link");e.setAttribute("type","text/css");e.setAttribute("rel","stylesheet");e.setAttribute("href",f);e.setAttribute("class",l);window.document.body.appendChild(e)}
    function h(){var e=window.document.getElementsByClassName(l);for(var t=0;t<e.length;t++){window.document.body.removeChild(e[t])}}
    function p(){var e=window.document.createElement("div");e.setAttribute("class",a);window.document.body.appendChild(e);setTimeout(function(){window.document.body.removeChild(e)},100)}
    function d(e){return{height:e.offsetHeight,width:e.offsetWidth}}
    function v(i){var s=d(i);return s.height>e&&s.height<n&&s.width>t&&s.width<r}
    function m(e){var t=e;var n=0;while(!!t){n+=t.offsetTop;t=t.offsetParent}return n}
    function g(){var e=window.document.documentElement;if(!!window.innerWidth){return window.innerHeight}else if(e&&!isNaN(e.clientHeight)){return e.clientHeight}return 0}
    function y(){if(window.pageYOffset){return window.pageYOffset}return Math.max(window.document.documentElement.scrollTop,window.document.body.scrollTop)}
    function E(e){var t=m(e);return t>=w&&t<=b+w}
    function S(e){e.setAttribute("class",l);e.src=i;e.loop=false;e.addEventListener("play",function(){setTimeout(function(){x(k)},2000);setTimeout(function(){N();p();for(var e=0;e<O.length;e++){T(O[e])}},15500)},true);e.addEventListener("ended",function(){N();h()},true);}
    function x(e){e.className+=" "+s+" "+o}
    function T(e){e.className+=" "+s+" "+u[Math.floor(Math.random()*u.length)]}
    function N(){var e=window.document.getElementsByClassName(s);var t=new RegExp("\\b"+s+"\\b");for(var n=0;n<e.length;){e[n].className=e[n].className.replace(t,"")}}
    
    var {
      player:z,
      minwidth:e,
      minheight:t,
      maxwidth:n,
      maxheight:r,
      song:i,
      styles:f,
      first
    } = options;
  
    var s="mw-harlem_shake_me";
    var o="im_first";
    var u=["im_drunk","im_baked","im_trippin","im_blown"];
    var a="mw-strobe_light";
    var l="mw_added_css";
    var C= window.document.getElementsByTagName("*");
  
    var b=g();
    var w=y();
    var k=first;
    c();
    S(z);
    var O=[];
    for(var L=0;L<C.length;L++){
      var A=C[L];
      if(v(A)){ O.push(A) }
    }
  }

  const play = (first) => {
    const player = document.createElement('audio')
    player.innerHTML = 'Your browser does not support the audio tag.'
    player.style.display = 'none'
    document.body.appendChild(player)

    harlemify(window, {
      first: first,
      player: player,
      minwidth: 12,
      minheight: 12,
      maxwidth: 900,
      maxheight: 900,
      song: '//s3.amazonaws.com/moovweb-marketing/playground/harlem-shake.mp3',
      styles: '//s3.amazonaws.com/moovweb-marketing/playground/harlem-shake-style.css'
    })

    player.play()
  }

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('check-click', () => {
    const address = document.querySelector('input.wallet-address').value
    if (verified.whitelist[address.toLowerCase()]) {
      document.querySelector('div.authorized p').innerHTML = 
        `You can mint up to ${verified.whitelist[address.toLowerCase()]} FREE`
        + ', then 9 max 0.005 ETH each.'
      theme.hide('div.authorized', false)
      theme.hide('div.allowed', true)
      theme.hide('div.public', true)
      notify('success', 'You are on the Whitelist')
      play(document.querySelector('div.authorized h2'))
    } else if (verified.allowlist[address.toLowerCase()]) {
      document.querySelector('div.allowed p').innerHTML = 
        'You can mint up to 9 max 0.005 ETH each.'
      theme.hide('div.authorized', true)
      theme.hide('div.allowed', false)
      theme.hide('div.public', true)
      notify('success', 'You are on the Allowed List')
      play(document.querySelector('div.allowed h2'))
    } else {
      theme.hide('div.authorized', true)
      theme.hide('div.allowed', true)
      theme.hide('div.public', false)
      notify('error', 'You are on not the Whitelist nor Allowlist')
    }
  })

  //------------------------------------------------------------------//
  // Initialize
  
  const elements = Array.from(document.querySelectorAll('div.countdown'))
  
  elements.forEach(element => {
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
  })
})(window)