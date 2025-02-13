import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { LlmService } from '../../components/llm.service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

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
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './ask.component.html',
  styleUrl: './ask.component.scss'
})
export class AskComponent implements OnInit {
  currentStep: number = 1;
  projectForm: FormGroup;
  impactForm: FormGroup;
  userMessage: string = '';
  isAnalyzing: boolean = false;
  messages: ChatMessage[] = [];

  constructor(
    private fb: FormBuilder,
    private llmService: LlmService
  ) {
    // Initialize Project Details form
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      owner: ['', Validators.required],
      overview: ['', Validators.required],
      problem: ['', Validators.required]
    });

    // Initialize Impact Assessment form
    this.impactForm = this.fb.group({
      dueDate: ['', Validators.required],
      financialImpact: ['', Validators.required],
      customerImpact: ['', Validators.required],
      operationalImpact: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  isFieldInvalid(fieldName: string, form: FormGroup = this.projectForm): boolean {
    const field = form.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onNextStep(): void {
    if (this.projectForm.valid) {
      this.currentStep = 2;
    } else {
      Object.keys(this.projectForm.controls).forEach(key => {
        const control = this.projectForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
    }
  }

  onPreviousStep(): void {
    this.currentStep = 1;
  }

  onSubmit(): void {
    if (this.impactForm.valid) {
      // Combine both forms' data
      const formData = {
        ...this.projectForm.value,
        ...this.impactForm.value
      };
      console.log('Final form data:', formData);
      // Handle form submission here
    } else {
      Object.keys(this.impactForm.controls).forEach(key => {
        const control = this.impactForm.get(key);
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
    this.llmService.analyzeProject(this.userMessage, 'prompt002')
      .subscribe({
        next: (response) => {
          // Add system response to chat
          console.log('LLM Response:', response);
          
          // Log form values before update
          console.log('Form before:', this.projectForm.value);
          
          // Update form with response data
          this.projectForm.patchValue({
            name: response.project_name || '',
            owner: response.project_owner || '',
            overview: response.project_overview || '',
            problem: response.problem_statement || ''
          });
          
          // Log form values after update
          console.log('Form after:', this.projectForm.value);
          
          this.messages.push({
            text: response.follow_up || 'hmm...something went wrong',
            isUser: false
          });

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
