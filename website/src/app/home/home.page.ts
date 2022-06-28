import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { DropDownListComponent } from '../utils/drop-down-list/drop-down-list.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{ 
  goals=[];
  roadmaps=[
    {
      isChecked:true,
      phase:1,
      goals:[
        {
          desc:"Opening of discord and other social media accounts to public",
          isChecked:true
        },
        {
          desc:"Collaboration with other projects 15/15",
          isChecked:true
        },
        {
          desc:"Released 100 Koalatee Special Edition",
          isChecked:true
        },
        {
          desc:"Partners",
          isChecked:true
        },
        {
          desc:"Whitelist Event",
          isChecked:true
        },
        {
          desc:"3D Sintraboard: Physical Art on Koalatee Special Edition 1st owner",
          isChecked:true
        }
      ]
    },{
      
      phase:2,
      goals:[
        {
          desc:"Generative Project Launch",
          isChecked:true
        },
        {
          desc:"Minting Site",
          isChecked:true
        },
        {
          desc:"Website",
          isChecked:true
        } ,
        {
          desc:"Presale",
          isChecked:true
        } ,
        {
          desc:"Public Sale",
          isChecked:true
        } ,
        {
          desc:"Sold 5,000 Koalas",
          isChecked:true
        } 
      ]
    },{
      
      phase:3,
      goals:[
        {
          desc:"Merchandise: Koalatee printed on their shirt and sintra board. If you hold 5 or more Koalatee, you will surely get one delivered to your doorstep",
        }
      ]
    },{
      
      phase:4,
      goals:[
        {
          desc:"Donations: We do care for Koalas who are becoming endangered through the years. We don’t want their cuteness to vanish in the face of the earth hence, a portion of the sale for a specific period will be donated to our chosen beneficiaries who are committed to taking care of the real Koalas",
        },
        {
          desc:"Koala Breeding Event",
        }
      ]
    }
  ]


  teams = [
    {
      name:"Belmar Gabatin Jr.",
      position:"Founder | Artist",
      img:"assets/team/Belmar.jpg",
      img1:"assets/team/Belmar.png",
      link:"https://www.facebook.com/MarbleINK.2014/"
    },
    {
      name:"Donnabhel Jugueta",
      position:"Artist",
      img:"assets/team/Donnabhel.jpg",
      img1:"assets/team/Donnabhel.png",
      link:"https://www.facebook.com/donnabheljoy"
    },
    {
      name:"Henry Manuel Jr.",
      position:"Artist",
      img:"assets/team/Henry.jpg",
      img1:"assets/team/Henry.png",
      link:"https://www.facebook.com/henry.yhern"
    },
    {
      name:"Martin Cheung",
      position:"Marketing Manager",
      img:"assets/team/Martin.jpg",
      img1:"assets/team/Martin.png",
      link:"https://www.facebook.com/martinmysteryyy"
    },
    {
      name:"Michael Puzon",
      position:"Fullstack & Blockchain Developer",
      img:"assets/team/Michael.jpg",
      img1:"assets/team/Michael.png",
      link:"https://www.facebook.com/michael.puzon.96"
    },
    {
      name:"John Robert Tubale",
      position:"Web Designer",
      img:"assets/team/John.jpg",
      img1:"assets/team/John.png",
      link:"https://www.facebook.com/joberttubale05"
    },
    {
      name:"Chin De Guzman",
      position:"Community Manager",
      img:"assets/team/Chin.jpg",
      img1:"assets/team/Chin.png",
      link:"https://www.facebook.com/chin.deguzman.9256"
    }, 
    {
      name:"Charles Calilap",
      position:"Community Manager",
      img:"assets/team/Charles.jpg",
      img1:"assets/team/Charles.png",
      link:"https://www.facebook.com/charles.calilap.07"
    }, 
    {
      name:"Aldine Garfin",
      position:"Community Manager",
      img:"assets/team/Alds.jpg",
      img1:"assets/team/Alds.png",
      link:"https://www.facebook.com/PsalmsandSongs"
    },
    {
      name:"Christian Edrosolam",
      position:"Animator",
      img:"assets/team/Christian.jpg",
      img1:"assets/team/Christian.png",
      link:"https://www.facebook.com/TABBYPANDA"
    },
    {
      name:"Ryannei Rule",
      position:"Community Manager",
      img:"assets/team/Ryannei.jpg",
      img1:"assets/team/Ryannei.png",
      link:"https://www.facebook.com/TRyannei14"
    },
    {
      name:"Roselan Mae Inoceda",
      position:"Community Manager",
      img:"assets/team/Roselan.jpg",
      img1:"assets/team/Roselan.png",
      link:"https://www.facebook.com/roselanmae.inoceda.543"
    },{
      name:"Riri Cayangyang",
      position:"Community Manager",
      img:"assets/team/Riri.jpg",
      img1:"assets/team/Riri.png" ,
      link:"https://www.facebook.com/RinoaRii"
    }
  ]
  constructor(
    private popoverController:PopoverController
  ) {}
  ngOnInit(): void {
    this.goals = this.roadmaps[0].goals;
  }

  onChangedPhase(_roadmap){
    for(let roadmap of this.roadmaps){
      if(roadmap.phase == _roadmap.phase){
        roadmap.isChecked = true;
        this.goals = roadmap.goals;
      }else{
        roadmap.isChecked = false;
      }
    }
  }

  navs =[
    {
      name:"Perks",
      navid:"section3",
    },
    {
      name:"Roadmap",
      navid:"section4",
    },
    {
      name:"Team",
      navid:"section5",
    },
    {
      name:"Twitter",
      link:"https://twitter.com/KoalateeNFT"
    },
    {
      name:"Facebook",
      link:"https://www.facebook.com/koalateeNFT"
    },
    {
      name:"Instagram",
      link:"https://instagram.com/koalatee_collection"
    },
    {
      name:"Opensea",
      link:"https://opensea.io/collection/koalatee"
    },
    {
      name:"Discord",
      link:"https://discord.gg/XjkkYMWhBr"
    } 
  ];
  onNav(nav){  
      let navid = nav.navid;
      var element = document.getElementById(navid);
      element.scrollIntoView({behavior: "smooth"});
  }

  logScrolling(ev){ 
    var y = ev.detail.scrollTop;  
    console.log(`logScrolling`,y);
    if (y > 50) {
      document.getElementById("navbar").style.top = "0";
    } else {
      document.getElementById("navbar").style.top = "-250px";
    }  
  }

  
  async onToggleMenu(ev){
    const popover = await this.popoverController.create({
      component: DropDownListComponent, 
      event: ev,
      translucent: true,
      componentProps:{
        datas:this.navs.map((e)=>{return e.name;})
      }
    });
    await popover.present();
    popover.onWillDismiss().then((data)=>{   
      let nav =this.navs.find((e)=>{return data.data.title === e.name;});
      if(nav.link){
        window.open(nav.link,'_blank');
      }else{
        let navid = nav.navid;
        var element = document.getElementById(navid);
        element.scrollIntoView({behavior: "smooth"});
      }
    });
  }
  
  onOpenWindow(link){
    window.open(link,'_blank')
  }
}

