import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RoyaltyBrowserPage } from './royalty-browser.page';

const routes: Routes = [
  {
    path: '',
    component: RoyaltyBrowserPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoyaltyBrowserPageRoutingModule {}
