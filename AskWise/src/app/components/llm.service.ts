import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LlmService {
  private apiUrl = 'http://localhost:5000/analyze';

  constructor(private http: HttpClient) {}

  analyzeProject(description: string, target: string): Observable<any> {
    return this.http.post(this.apiUrl, { 
      user_input: description,
      target: target 
    });
  }
}