import { Component, OnInit } from '@angular/core';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { parseString } from 'xml2js';
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
    const fileExtension = this.currentFile.name.split('.').pop() || '';

    if (!this.allowedFileTypes.includes(fileExtension.toLowerCase())) {
      this.message = 'Invalid file type. Only CSV, XML, and XLSX files are allowed.';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const fileContent = e.target.result;
      let parsedData: any;

      switch (fileExtension.toLowerCase()) {
        case 'csv':
          parsedData = this.parseCSV(fileContent);
          break;
        case 'xlsm':
        case 'xlsx':
          parsedData = this.parseXLSX(fileContent);
          break;
        case 'xml':
          parsedData = this.parseXML(fileContent);
          break;
      }

      if (!parsedData) {
        this.message = 'Error occurred while parsing the file.';
        return;
      }

      const jsonContent = JSON.stringify(parsedData);

      // Create a new Blob with the JSON content
      const jsonBlob = new Blob([jsonContent], { type: 'application/json' });

      // Create a new File object with the necessary properties
      const jsonFile = new File([jsonBlob], this.currentFile.name.replace(/\.[^/.]+$/, '.json'), {
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

    reader.readAsText(this.currentFile);
    this.selectedFiles = undefined!;
  }

  parseCSV(fileContent: string): any[] {
    const lines = fileContent.split('\n');

    // Remove blank columns from each line
    const sanitizedLines = lines.map(line => {
      const columns = line.split(',');
      const sanitizedColumns = columns.filter(column => column.trim() !== ''); // Remove blank columns
      return sanitizedColumns.join(','); // Merge columns without blank columns
    });

    const mergedColumns = sanitizedLines[0].split(',');
    const data = sanitizedLines.slice(1).map((row: string) => {
      const rowData: any = {};
      const values = row.split(',');
      mergedColumns.forEach((header, index) => {
        rowData[header] = values[index];
      });
      return rowData;
    });

    return data;
  }

  parseXLSX(fileContent: string): any[] {
    const workbook = XLSX.read(fileContent, { type: 'binary' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    const headers = data[0] as string[];
    return data.slice(1).map(row => {
      const rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index];
      });
      return rowData;
    });
  }

  parseXML(fileContent: string): any {
    let parsedData: any;
    parseString(fileContent, (err, result) => {
      if (err) {
        console.error(err);
        parsedData = null;
      } else {
        parsedData = result;
      }
    });
    return parsedData;
  }

  selectFile(event) {
    this.selectedFiles = event.target.files;
  }

  ngOnInit() {
    this.fileInfos = this.uploadService.getFiles();
  }
}




/*import { Component, OnInit } from '@angular/core';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { parseString } from 'xml2js';
import * as XLSX from 'xlsx';

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
}*/
