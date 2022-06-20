import { TestBed } from '@angular/core/testing';

import { ConnectwalletService } from './connectwallet.service';

describe('ConnectwalletService', () => {
  let service: ConnectwalletService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConnectwalletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
