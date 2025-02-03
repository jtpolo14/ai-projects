import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { LlmService } from '../../components/llm.service';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  text: string;
  isUser: boolean;
}

@Component({
  selector: 'app-ask',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule
  ],
  templateUrl: './ask.component.html',
  styleUrl: './ask.component.scss'
})
export class AskComponent implements OnInit {

  userForm: FormGroup;
  userMessage: string = '';
  isAnalyzing: boolean = false;
  messages: ChatMessage[] = [];

  constructor(
    private fb: FormBuilder,
    private llmService: LlmService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      owner: ['', Validators.required],
      overview: ['', Validators.required],
      problem: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      console.log(this.userForm.value);
      // Handle form submission here
    } else {
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
    }
  }

  onSendMessage(): void {
    if (!this.userMessage.trim()) return;
    
    // Add user message to chat
    this.messages.push({
      text: this.userMessage,
      isUser: true
    });
    
    this.isAnalyzing = true;
    this.llmService.analyzeProject(this.userMessage, 'prompt001')
      .subscribe({
        next: (response) => {
          // Add system response to chat
          console.log('LLM Response:', response);
          console.log('LLM Response PN:', response[0]);
          this.messages.push({
            text: 'I have analyzed your project and populated the form.',
            isUser: false
          });
          
          // Log form values before update
          console.log('Form before:', this.userForm.value, response.project_name);
          

          // Update form with response data
          this.userForm.patchValue({
            name: response.project_name || '',
            owner: response.project_owner || '',
            overview: response.project_overview || '',
            problem: response.problem_statement || ''
          });
          
          // Log form values after update
          console.log('Form after:', this.userForm.value);
          
          this.isAnalyzing = false;
          this.userMessage = '';
        },
        error: (error) => {
          console.error('Error analyzing project:', error);
          this.messages.push({
            text: 'Sorry, there was an error analyzing your project.',
            isUser: false
          });
          this.isAnalyzing = false;
          this.userMessage = '';
        }
      });
  }
}
