import { Component, OnInit } from '@angular/core';
 
@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.page.html',
  styleUrls: ['./gallery.page.scss'],
})
export class GalleryPage implements OnInit {

  metadata = [];
  filters = {}; 
  datalist = [];
  onItems = {};
  modalDetails = null;
  constructor() { }

  ngOnInit() {  
    this.initData();
    document.getElementById("modal").style.display = "none"; 
  }

  async initData() { 
    const response = await fetch('/assets/metadata.json')
    this.datalist = await response.json();
    for(const data of this.datalist){
      const attrs = data.attributes;
      for(const attr of attrs){ 
        if(!this.filters[attr.trait_type]){
          this.filters[attr.trait_type] = {};
          this.filters[attr.trait_type].list = [];
          this.filters[attr.trait_type].isVisible = false; 
          this.filters[attr.trait_type].list.push({name:attr.value,count:1});
        }else{
          const filterF = this.filters[attr.trait_type].list.find((el)=>{return el.name == attr.value;});
          if(!filterF){
            this.filters[attr.trait_type].list.push({name:attr.value,count:1});
          }else{
            filterF.count++;
          }
        }
      }
    }

    console.log(this.filters);
  }


  onToggleVisibleFilter(filter){
    this.filters[filter].isVisible = !this.filters[filter].isVisible; 
  }

  objectKeys(obj) {
    return Object.keys(obj);
  }
  
  onCheckChange(ev,item){
    if(ev.target.checked){
      this.onItems[item.name]=item.name;
    }else{
      delete this.onItems[item.name];
    }
    console.log(this.onItems);
  }

  isItemHidden(data){ 
    if(this.objectKeys(this.onItems).length == 0){
      return true;
    }
    return  data.attributes.find((el)=>{return this.objectKeys(this.onItems).find((er)=>{return er == el.value })});
  }

  onToggleModal(data?){ 
    if(data){this.modalDetails = data;}
    if(document.getElementById("modal").style.display == "none"){
      document.getElementById("modal").style.display = "flex";
    }else{
      document.getElementById("modal").style.display = "none"; 
    }
  }
}
