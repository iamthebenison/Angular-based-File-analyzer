import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SheetsUploadComponent } from './sheets-upload.component';

describe('SheetsUploadComponent', () => {
  let component: SheetsUploadComponent;
  let fixture: ComponentFixture<SheetsUploadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SheetsUploadComponent]
    });
    fixture = TestBed.createComponent(SheetsUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
