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

    static parent(element, className) {
      if (element.tagName === 'HTML') return null
      if (element.parentNode.classList.contains(className)) 
        return element.parentNode
      return this.parent(element.parentNode, className)
    }

    static siblings(element, className, selector, single = false) {
      const parent = this.parent(element, className)
      if (!parent) return []
      if (!single) {
        return Array.from(parent.querySelectorAll(selector))  
      }
      return parent.querySelector(selector)
    }

    static toElement(html, variables = {}) { 
      for (const key in variables) {
        html = html.replace(new RegExp(key, 'g'), variables[key])
      }
      const template = document.createElement('template');
      template.innerHTML = html.trim();
      return template.content.firstChild;
    }

    static toggle(elements, className, on = null) {
      if (typeof elements === 'string') {
        elements = Array.from(document.querySelectorAll(elements))
      }
    
      if (!Array.isArray(elements)) {
        elements = [elements]
      }

      if (on === true) {
        elements.forEach((element) => {
          element.classList.add(className)
        })
      } else if (on === false) {
        elements.forEach((element) => {
          element.classList.remove(className)
        })
      } else {
        elements.forEach((element) => {
          element.classList.toggle(className)
        })
      }
    }
  }

  window.theme = Theme;
})()