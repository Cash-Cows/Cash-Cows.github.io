import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MintPageRoutingModule } from './mint-routing.module';

import { MintPage } from './mint.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MintPageRoutingModule
  ],
  declarations: [MintPage]
})
export class MintPageModule {}
