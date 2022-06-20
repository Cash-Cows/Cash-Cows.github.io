import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RoyaltyBrowserPage } from './royalty-browser.page';

describe('RoyaltyBrowserPage', () => {
  let component: RoyaltyBrowserPage;
  let fixture: ComponentFixture<RoyaltyBrowserPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RoyaltyBrowserPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RoyaltyBrowserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
