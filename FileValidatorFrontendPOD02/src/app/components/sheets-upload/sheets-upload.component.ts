import { Component, OnInit } from '@angular/core';
import { SheetUploadService } from 'src/app/services/sheet-upload.service';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-sheets-upload',
  templateUrl: './sheets-upload.component.html',
  styleUrls: ['./sheets-upload.component.css']
})

export class SheetsUploadComponent implements OnInit {
  allowedFileTypes: string[] = ['csv', 'xml', 'xlsm', 'xlsx'];
  selectedFiles!: FileList;
  currentFile!: File;
  progress = 0;
  message = '';
  fileInfos!: Observable<any>;

  constructor(private uploadService: SheetUploadService) { }

  upload() {
    this.progress = 0;

    //Selecting the file.
    this.currentFile = this.selectedFiles.item(0)!;

    // Checking the file size of the uploaded document.
    const fileSizeInMB = this.currentFile.size / (1024 * 1024); // File size in MB
    if (fileSizeInMB > 10) {
      this.message = 'File size exceeds the limit of 10 MB.';
      return;
  }

    //Checking the format of the file.
    const fileExtension = this.currentFile.name.split('.').pop()?.toLowerCase() || '';
    const fileName = this.currentFile.name.split('.')[0] || '';
    if (!this.allowedFileTypes.includes(fileExtension)) {
      this.message = 'Invalid file type. Only XLSX, XLSM, CSV, and XML files are allowed.';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const fileContent = e.target.result;
      const workbook = XLSX.read(fileContent, { type: 'binary' });

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, cellDates: false } as XLSX.Sheet2JSONOpts);

      // Checking if the file has any columns
      if (jsonData.length === 0 || jsonData[0].length === 0) {
        this.message = 'Invalid file. No columns found.';
        return;
      }

      // Checking if all columns are empty
      const allColumnsEmpty = jsonData.every(row => row.every(cellValue => cellValue === ''));
      if (allColumnsEmpty) {
        this.message = 'Invalid file. All columns are empty.';
      return;
  }

      const headers: string[] = jsonData[0] as string[];
      jsonData.splice(0, 1);
      
      // Validate the total number of columns
      if (headers.length > 20) {
        this.message = 'Invalid file. Total number of columns exceeds the limit of 20.';
        return;
      }

      const rows = jsonData.map((row: unknown) => {
        const rowData = row as string[];
        const obj: any = {};
        headers.forEach((header, index) => {
          if ((header === 'birthdate') && (typeof rowData[index]=="number")) {
            // Convert the birthdate to the desired format (e.g., 'dd-mm-yyyy')
            const dateValue = rowData[index];
            const excelTimestamp = Number(dateValue);
            const birthdate = new Date((excelTimestamp - 25569) * 86400 * 1000);
            const day = birthdate.getDate().toString().padStart(2, '0');
            const month = (birthdate.getMonth() + 1).toString().padStart(2, '0');
            const year = birthdate.getFullYear().toString();
            const formattedBirthdate = `${day}-${month}-${year}`;
            obj[header] = formattedBirthdate;
          } else {
            obj[header] = rowData[index];
          }
        });
        return obj;
      });

      // Remove blank columns
      const filteredRows = rows.map((row: any) => {
        const filteredRow: any = {};
        Object.keys(row).forEach((header) => {
          if (row[header] !== '') {
            filteredRow[header] = row[header];
            this.message="Blank columns are removed";
          }
        });
        return filteredRow;
      });

      const jsonString = JSON.stringify(filteredRows);

      // Continue with the file upload process using the JSON file
      this.progress = Math.round((58 / 100!) * 100);
      this.uploadService.upload(jsonString, fileName).subscribe(
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
        },
        );
    };

    reader.readAsBinaryString(this.currentFile);
    this.selectedFiles = undefined!;
  }

  selectFile(event: any) {
    this.selectedFiles = event.target.files;
  }
  

  ngOnInit() {
  }
}