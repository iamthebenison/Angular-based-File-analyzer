import { Component, OnInit } from '@angular/core';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.css']
})


export class UploadFilesComponent implements OnInit {

  allowedFileTypes: string[] = ['csv', 'xml', 'xlsm','xlsx'];
  selectedFiles: FileList;
  currentFile: File;
  progress = 0;
  message = '';
  
  fileInfos: Observable<any>;

  constructor(private uploadService: UploadFileService) { }

  upload() {
    this.progress = 0;
  
    this.currentFile = this.selectedFiles.item(0)!;
    const fileExtension = this.currentFile.name.split('.').pop() || '';
  
    if (!this.allowedFileTypes.includes(fileExtension.toLowerCase())) {
      this.message = 'Invalid file type. Only CSV, XML, and XLSX files are allowed.';
      return;
    }
  
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const fileContent = e.target.result;
      const lines = fileContent.split('\n');
  
      // Remove blank columns from each line
      const sanitizedLines = lines.map(line => {
        const columns = line.split(',');
        const sanitizedColumns = columns.filter(column => column.trim() !== ''); // Remove blank columns
        return sanitizedColumns.join(','); // Merge columns without blank columns
      });
  
      const sanitizedFileContent = sanitizedLines.join('\n');
  
      const mergedColumns = sanitizedLines[0].split(',');
      
      if (mergedColumns.length > 20) {
        this.message = 'The file contains more than 20 columns. Please ensure it does not exceed this limit.';
        return;
      }
  
      // Create a new Blob with the sanitized file content
      const sanitizedBlob = new Blob([sanitizedFileContent], { type: this.currentFile.type });
  
      // Create a new File object with the necessary properties
      const sanitizedFile = new File([sanitizedBlob], this.currentFile.name, { lastModified: this.currentFile.lastModified, type: this.currentFile.type });
  
      // Continue with the file upload process using the sanitized file
      this.uploadService.upload(sanitizedFile).subscribe(
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
    
    reader.readAsText(this.currentFile);
    this.selectedFiles = undefined!;
  }
  
  selectFile(event) {
    this.selectedFiles = event.target.files;
  }
  
  ngOnInit() {
    this.fileInfos = this.uploadService.getFiles();
  }
}
