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

      // Create a Blob with the JSON data
      const jsonBlob = new Blob([jsonString], { type: 'application/json' });

      // Create a new File object with the necessary properties
      const jsonFile = new File([jsonBlob], this.currentFile.name.split('.')[0] + '.json', {
        lastModified: this.currentFile.lastModified,
        type: 'application/json'
      });

      // Continue with the file upload process using the JSON file
      this.uploadService.upload(jsonFile).subscribe(
        event => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progress = Math.round((event.loaded / event.total!) * 100);
          } else if (event instanceof HttpResponse) {
            this.message = event.body.message;
            this.fileInfos = this.uploadService.getFiles();
          }
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
    this.fileInfos = this.uploadService.getFiles();
  }
}