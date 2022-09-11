(() => {
  class Theme {
    static disable(elements, disabled) {
      if (typeof elements === 'string') {
        elements = Array.from(document.querySelectorAll(elements))
      }
    
      if (!Array.isArray(elements)) {
        elements = [elements]
      }
  
      elements.forEach((element) => {
        if (disabled && !Theme.isDisabled(element)) {
          element.disabled = true 
          element.setAttribute('disabled', 'disabled')
        } else if (!disabled && Theme.isDisabled(element)) {
          element.disabled = false 
          element.removeAttribute('disabled')
        }
      })
    }

    static hide(elements, hidden) {
      if (typeof elements === 'string') {
        elements = Array.from(document.querySelectorAll(elements))
      }
    
      if (!Array.isArray(elements)) {
        elements = [elements]
      }
  
      elements.forEach((element) => {
        if (hidden && !element.classList.contains('hide')) {
          element.classList.add('hide')
        } else if (!hidden && element.classList.contains('hide')) {
          element.classList.remove('hide')
        }
      })
    }

    static isDisabled(element) {
      return element.disabled || element.hasAttribute('disabled')
    }

    static toElement(html, variables = {}) { 
      for (const key in variables) {
        html = html.replace(new RegExp(key, 'g'), variables[key])
      }
      const template = document.createElement('template');
      template.innerHTML = html.trim();
      return template.content.firstChild;
    }

    static toggle(elements, className) {
      if (typeof elements === 'string') {
        elements = Array.from(document.querySelectorAll(elements))
      }
    
      if (!Array.isArray(elements)) {
        elements = [elements]
      }
  
      elements.forEach((element) => {
        element.classList.toggle(className)
      })
    }
  }

  window.theme = Theme;
})()