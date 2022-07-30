import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // {
  //   path: '',
  //   loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  // }, 
  // {
  //   path: 'mint',
  //   loadChildren: () => import('./mint/mint.module').then( m => m.MintPageModule)
  // },
  {
    path: 'claim-royalty',
    loadChildren: () => import('./royalty-browser/royalty-browser.module').then( m => m.RoyaltyBrowserPageModule)
  },
  {
    path: '',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'mint',
    loadChildren: () => import('./mint/mint.module').then( m => m.MintPageModule)
  },
  {
    path: 'gallery',
    loadChildren: () => import('./gallery/gallery.module').then( m => m.GalleryPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
