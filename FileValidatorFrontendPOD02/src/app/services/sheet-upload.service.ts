import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SheetUploadService {

  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  upload(jsonString: string,fileName: string): Observable<any> {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');

    return this.http.post<HttpEvent<any>>(`${this.baseUrl}/upload/profiles?fileName=`+fileName, jsonString, {
      headers: headers,
      reportProgress: true
    });
  }

  // getFiles(): Observable<any> {
  //   return this.http.get(`${this.baseUrl}/files`);
  // }
}