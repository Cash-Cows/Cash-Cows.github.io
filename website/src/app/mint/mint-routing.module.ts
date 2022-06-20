import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MintPage } from './mint.page';

const routes: Routes = [
  {
    path: '',
    component: MintPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MintPageRoutingModule {}
