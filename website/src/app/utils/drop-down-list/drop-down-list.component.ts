import { Component, OnInit, Input } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-drop-down-list',
  templateUrl: './drop-down-list.component.html',
  styleUrls: ['./drop-down-list.component.scss'],
})
export class DropDownListComponent implements OnInit {

  @Input() datas:any;
  constructor(
    private popover:PopoverController
  ) { }

  ngOnInit() {
    console.log("DropDownListComponent",this.datas);
  }

  itemClick(i){
    this.popover.dismiss({index:i,title:this.datas[i]});
  }
}
