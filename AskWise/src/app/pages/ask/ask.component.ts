import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-ask',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ask.component.html',
  styleUrl: './ask.component.scss'
})
export class AskComponent implements OnInit {

  userForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      owner: ['', Validators.required],
      overview: ['', Validators.required],
      problem: ['', Validators.required],
      solution: ['', Validators.required]
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
}
