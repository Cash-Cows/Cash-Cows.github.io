import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ToastMessageService } from '../utils/toast-message.service';


declare var $:any;
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomePage implements OnInit {
  env = environment;
  constructor( private toast:ToastMessageService) {  
  }

  ngOnInit() {
    // Random Stars
    var generateStars = function(){
        
      var $galaxy = $(".galaxy");
      var iterator = 0;
      while (iterator <= 120){
          var xposition = Math.random();
          var yposition = Math.random();
          var star_type = Math.floor((Math.random() * 3) + 1);
          var position = {
              "x" : $galaxy.width() * xposition,
              "y" : $galaxy.height() * yposition,
          };
          
          $('<div class="star star-type' + star_type + '"></div>').appendTo($galaxy).css({
              "top" : position.y,
              "left" : position.x
          });
          
          iterator++; 
      }
        
      var $galaxy = $(".galaxy1");
      var iterator = 0;
      while (iterator <= 120){
          var xposition = Math.random();
          var yposition = Math.random();
          var star_type = Math.floor((Math.random() * 3) + 1);
          var position = {
              "x" : $galaxy.width() * xposition,
              "y" : $galaxy.height() * yposition,
          };
          
          $('<div class="star star-type' + star_type + '"></div>').appendTo($galaxy).css({
              "top" : position.y,
              "left" : position.x
          });
          
          iterator++; 
      }
    };

    generateStars();
  }

  onOpenWindow(src){
    if(src==''){ this.toast.presentToast("Coming Soon..."); return;}
    console.log(src.split("")[0]);
    if(src.split("")[0] == "/"){ 
      window.open(src,"_self");
    }else{ 
      window.open(src,"_blank")
    }
  }
}
