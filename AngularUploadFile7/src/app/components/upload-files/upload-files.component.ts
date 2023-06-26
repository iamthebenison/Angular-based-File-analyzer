import { Component, OnInit } from '@angular/core';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.css']
})
export class UploadFilesComponent implements OnInit {
  allowedFileTypes: string[] = ['csv', 'xml', 'xlsm', 'xlsx'];
  selectedFiles: FileList;
  currentFile: File;
  progress = 0;
  message = '';
  fileInfos: Observable<any>;

  constructor(private uploadService: UploadFileService) { }

  upload() {
    this.progress = 0;
  
    this.currentFile = this.selectedFiles.item(0)!;
    const fileExtension = this.currentFile.name.split('.').pop()?.toLowerCase() || '';
    const fileName=this.currentFile.name.split('.')[0]||'';
    if (!this.allowedFileTypes.includes(fileExtension)) {
      this.message = 'Invalid file type. Only XLSX, XLSM, CSV, and XML files are allowed.';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const fileContent = e.target.result;
      const workbook = XLSX.read(fileContent, { type: 'binary' });

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const headers: string[] = jsonData[0] as string[];
      jsonData.splice(0, 1);

      const rows = jsonData.map((row: unknown) => {
        const rowData = row as string[];
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = rowData[index];
        });
        return obj;
      });

      const jsonString = JSON.stringify(rows);

      // Continue with the file upload process using the JSON file
      this.progress = Math.round((58 / 100!) * 100);
      this.uploadService.upload(jsonString,fileName).subscribe(
        event => {
          console.log(event);
          this.progress = 100;
          this.message = event.message;
        },
        err => {
          this.progress = 0;
          this.message = err.error.message;
          this.currentFile = undefined!;
          console.log(err);
        }
      );
    };

    reader.readAsBinaryString(this.currentFile);
    this.selectedFiles = undefined!;
  }

  selectFile(event) {
    this.selectedFiles = event.target.files;
  }

  ngOnInit() {
    // this.fileInfos = this.uploadService.getFiles();
  }
}