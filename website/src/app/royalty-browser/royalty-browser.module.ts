import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RoyaltyBrowserPageRoutingModule } from './royalty-browser-routing.module';

import { RoyaltyBrowserPage } from './royalty-browser.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RoyaltyBrowserPageRoutingModule
  ],
  declarations: [RoyaltyBrowserPage]
})
export class RoyaltyBrowserPageModule {}
