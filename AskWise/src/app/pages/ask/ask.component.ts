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
    
    this.messages.push({
      text: this.userMessage,
      isUser: true
    });
    
    this.isAnalyzing = true;
    this.llmService.analyzeProject(this.userMessage, 'prompt003', this.messages.map(msg => msg.isUser ? 'user: ' + msg.text : 'you: ' + msg.text))
      .subscribe({
        next: (response) => {
          console.log('LLM Response:', response);
          const jsonResponse = typeof response === 'string' ? JSON.parse(response) : response;
          
          console.log('Form before:', this.projectForm.value);
          console.log('Impact form before:', this.impactForm.value);
          
          // Update project form fields
          this.projectForm.patchValue({
            name: jsonResponse.project_name || '',
            owner: jsonResponse.project_owner || '',
            overview: jsonResponse.project_overview || '',
            problem: jsonResponse.problem_statement || ''
          });

          // Update impact form fields 
          this.impactForm.patchValue({
            dueDate: jsonResponse.target_date ? new Date(jsonResponse.target_date).toISOString().split('T')[0] : '',
            financialImpact: jsonResponse.impact_financial || '',
            customerImpact: jsonResponse.impact_customer || '',
            operationalImpact: jsonResponse.impact_operational || ''
          });
          
          console.log('Form after:', this.projectForm.value);
          console.log('Impact form after:', this.impactForm.value);
          
          this.messages.push({
            text: jsonResponse.follow_up || 'hmm...something went wrong',
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
