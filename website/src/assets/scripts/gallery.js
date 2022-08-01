

window.doon = function(elements) {
if (typeof elements === 'string') {
elements = Array.from(document.querySelectorAll(elements))
}

if (!Array.isArray(elements)) {
elements = [elements]
}
elements.forEach(function(container) {
const todos = Array.from(container.querySelectorAll('*[data-do]'))
if (container.getAttribute('data-do')) {
    todos.push(container)
}
todos.forEach(function(origin) {
    let actions = origin.getAttribute('data-do');
    if(!actions || origin.getAttribute('data-doon')) {
    return;
    }

    actions = actions.split('|');
    origin.setAttribute('data-doon', true)

    const event = origin.getAttribute('data-on');
    const target = origin.getAttribute('data-doon-target') || origin;

    //trigger init
    actions.forEach(function(action) {
    const event = new Event(`${action}-init`)
    event.for = target
    window.dispatchEvent(event)
    });

    if(!event) {
    return;
    }

    event.split('|').forEach(function(event) {
    target.addEventListener(event, function(e) {
        actions.some(function(action) {
        //mod the custom event type
        const customEvent = new e.constructor(action + '-' + event, e)
        customEvent.originalEvent = e
        customEvent.for = target
        //pass it along
        window.dispatchEvent(customEvent)
        return e.return === false
        });

        //so you can stop a form
        if (e.return === false) {
        return false;
        }
    });
    });
});
});
}

async function initGallery(){
    console.log("initGallery");
    //------------------------------------------------------------------//
    // Variables
  
    const series = {}
    const attributes = {}
  
    const response = await fetch('/assets/metadata.json')
    const datalist = await response.json()
  
    const results = document.querySelector('main.results')
    const seriesOptions = document.querySelector('aside.filters div.series div.options')
    const attributesOptions = document.querySelector('aside.filters div.attributes div.options')
  
    const template = {
      row: document.getElementById('template-form-row').innerHTML,
      fieldset: document.getElementById('template-form-fieldset').innerHTML,
      item: document.getElementById('template-result-item').innerHTML,
      modal: document.getElementById('template-modal').innerHTML,
      attribute: document.getElementById('template-attribute-box').innerHTML
    }
  
    //------------------------------------------------------------------//
    // Functions
  
    const toElement = function(html) {
      const template = document.createElement('template');
      template.innerHTML = html.trim();
      return template.content.firstChild;
    }
  
    const renderResults = function(filters) {
      filters = filters || {}
      filters.series = filters.series || []
      filters.attributes = filters.attributes || {}
      results.innerHTML = ''
      const matches = datalist.filter(metadata => {
        const criteria = {}
        if (filters.series.length) {
          criteria.series = filters.series.indexOf(metadata.series) !== -1
        }
        Object.keys(filters.attributes).forEach(traitType => {
          let found = false
          metadata.attributes.forEach(attribute => {
            if (attribute.trait_type == traitType) {
              found = true
              criteria[traitType] = filters.attributes[traitType].indexOf(attribute.value) !== -1
            }
          })
  
          if (!found) {
            criteria[traitType] = false
          }
        })
  
        for (const name in criteria) {
          if (!criteria[name]) {
            return false
          }
        }
  
        return true
      })
  
      matches.sort(() => Math.random() - 0.5).forEach(metadata => {
        results.appendChild(toElement(template.item
          .replace('^^INDEX^^', metadata.index)
          .replace('^^NAME^^', metadata.name.replace(/\#[0-9]+/, ''))//todo remove replace
          .replace('^^IMAGE^^', `/images/collection/${metadata.index + 1}.png`) //metadata.preview || metadata.image
        ))
      })
  
      window.doon('main.results')
    }
  
    const populate = function() {
      datalist.forEach(metadata => {
        //add series
        if (!series[metadata.series]) {
          series[metadata.series] = 0
        }
        series[metadata.series]++
        //add attributes
        metadata.attributes.forEach(attribute => {
          if (!attributes[attribute.trait_type]) {
            attributes[attribute.trait_type] = {}
          }
          if (!attributes[attribute.trait_type][attribute.value]) {
            attributes[attribute.trait_type][attribute.value] = 0
          }
          attributes[attribute.trait_type][attribute.value]++
        })
      })
    
      //go back around and populate the stats
      datalist.forEach((metadata, i) => {
        metadata.index = i
        metadata.occurances = 0
        //add occurances
        metadata.attributes.forEach(attribute => {
          attribute.occurance = attributes[attribute.trait_type][attribute.value]
          metadata.occurances += attribute.occurance
        })
      })
    
      //populate series filters
      Object.keys(series).sort((a, b) => series[a] - series[b]).forEach((name) => {
        const row = toElement(template.row
          .replace('^^NAME^^', 'series')
          .replace('^^VALUE^^', name)
          .replace('^^LABEL^^', name)
          .replace('^^COUNT^^', series[name])
        )
    
        seriesOptions.appendChild(row)
      })
    
      //populate attribute filters
      for (const attribute in attributes) {
        const set = toElement(template.fieldset.replace('^^LEGEND^^', attribute))
        const fields = set.querySelector('div.fields')
        Object.keys(attributes[attribute])
          .sort((a, b) => attributes[attribute][a] - attributes[attribute][b])
          .forEach((trait) => {
            const row = toElement(template.row
              .replace('^^NAME^^', `attribute[${attribute}]`)
              .replace('^^VALUE^^', trait)
              .replace('^^LABEL^^', trait)
              .replace('^^COUNT^^', attributes[attribute][trait])
            )
        
            fields.appendChild(row)
          })
    
        attributesOptions.appendChild(set)
      }
    }
  
    //------------------------------------------------------------------//
    // Events
  
    window.addEventListener('toggle-click', async(e) => {
      e.for.classList.toggle('open')
      if (e.for.classList.contains('open')) {
        e.for.nextElementSibling.style.display = 'block'
      } else {
        e.for.nextElementSibling.style.display = 'none'
      }
    })
  
    window.addEventListener('filter-click', (e) => {
      const filters = { series: [], attributes: {} }
      document.querySelectorAll('aside.filters input[type=checkbox]').forEach(input => {
        if (!input.checked) return
        if (input.name == 'series') {
          filters.series.push(input.value)
        } else {
          const name = input.name.replace('attribute[', '').replace(']', '')
          if (!filters.attributes[name]) {
            filters.attributes[name] = []
          }
          filters.attributes[name].push(input.value)
        }
      })
  
      renderResults(filters)
    })
  
    window.addEventListener('modal-open-click', (e) => {
      const index = parseInt(e.for.getAttribute('data-index'))
      const metadata = datalist[index]
      const boxes = []
      metadata.attributes.forEach(attribute => {
        boxes.push(template.attribute
          .replace('^^NAME^^', attribute.trait_type)
          .replace('^^VALUE^^', attribute.value)
          .replace('^^PERCENT^^', Math.floor((attribute.occurance / Object.keys(attributes[attribute.trait_type]).length) * 100) / 100)
        )
      })
  
      const modal = toElement(template.modal
        .replace('^^NAME^^', metadata.name.replace(/\#[0-9]+/, ''))//todo remove replace
        .replace('^^IMAGE^^', `/images/collection/${index + 1}.png`)//metadata.preview || metadata.image
        .replace('^^RANK^^', '')
        .replace('^^RATING^^', '')
        .replace('^^ATTRIBUTES^^', boxes.join(''))
      )
  
      document.body.appendChild(modal)
      window.doon('body')
    })
  
    window.addEventListener('modal-close-click', (e) => {
      document.body.removeChild(e.for)
    })
  
    //------------------------------------------------------------------//
    // Initialize
  
    renderResults()
    populate()
    window.doon('body')
}