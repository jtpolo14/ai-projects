import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LlmService {
  // Mock function to simulate API call
  analyzeProjectDescription(description: string): Observable<any> {
    // Mock response data
    const mockResponse = {
      projectName: 'E-commerce Platform',
      timeline: '3 months',
      budget: '15000',
      techStack: 'React, Node.js, MongoDB',
      teamSize: '4',
      keyFeatures: 'User authentication, Product catalog, Shopping cart, Payment integration',
      additionalNotes: 'Mobile-responsive design required'
    };

    // Simulate API delay
    return of(mockResponse).pipe(delay(1000));
  }
}