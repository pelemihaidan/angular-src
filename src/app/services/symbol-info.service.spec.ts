import { TestBed, inject } from '@angular/core/testing';

import { SymbolInfoService } from './symbol-info.service';

describe('SymbolInfoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SymbolInfoService]
    });
  });

  it('should be created', inject([SymbolInfoService], (service: SymbolInfoService) => {
    expect(service).toBeTruthy();
  }));
});
