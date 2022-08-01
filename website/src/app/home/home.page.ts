import { Component, OnInit } from '@angular/core';
import { ToastMessageService } from '../utils/toast-message.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  
  constructor( private toast:ToastMessageService) {  
  }

  ngOnInit() {
  }

  onOpenWindow(src){
    if(src==''){ this.toast.presentToast("Coming Soon..."); return;}
    window.open(src,"_blank")
  }
}
