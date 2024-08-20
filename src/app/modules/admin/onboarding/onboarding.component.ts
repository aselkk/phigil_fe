import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
    MatFormField,
    MatFormFieldModule,
    MatLabel,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { fuseAnimations } from '@fuse/animations';

import { MatInputModule } from '@angular/material/input';
import { FuseAlertType } from '@fuse/components/alert';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar';
import { OnboardingService } from 'app/core/onboarding/onboarding.service';
import { FuseAlertComponent } from '../../../../@fuse/components/alert/alert.component';

@Component({
    selector: 'onboarding',
    animations: fuseAnimations,
    standalone: true,
    imports: [
        FuseLoadingBarComponent,
        CommonModule,
        MatIconModule,
        MatFormField,
        MatLabel,
        MatFormField,
        MatIconModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        TextFieldModule,
        ReactiveFormsModule,
        MatButtonModule,
        FuseAlertComponent,
    ],
    templateUrl: './onboarding.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class OnboardingComponent implements OnInit {
    @ViewChild('onboardingNgForm') onboardingNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };

    onboardingForm: UntypedFormGroup;
    uploadForm: FormGroup;
    showAlert: boolean = false;
    selectedFile: File | null = null;
    filePreview: string | ArrayBuffer | null = null;
    uploadedImages: any[] = [];
    token =
        'ya29.a0AcM612zlt9ASxMs3EwQa3015LWgzDg0iy32wRUoJq0va6YEw2o4AYS51K02gRjC1Zc_zlzaqZN4lqnYtJpos1GqBSetRYOJe4kZqt738L1k7pw6rwpOrOsphQjYE-lm8bvrye-VJEJvoZ4ljHNaZss0BNe70bZU6KR5cy_-vaCgYKAZoSARISFQHGX2Mi5r-yAJ_ffTKM5FaLA-ceBg0175';

    constructor(
        private formBuilder: FormBuilder,
        private _formBuilder: UntypedFormBuilder,
        private onboardingService: OnboardingService
    ) {}

    ngOnInit(): void {
        // Create the form
        this.uploadForm = this._formBuilder.group({
            username: ['', Validators.required],
            team: ['', Validators.required],
        });
    }

    onFileSelected(event: any): void {
        this.selectedFile = event.target.files[0];

        if (this.selectedFile) {
            const reader = new FileReader();
            reader.onload = () => {
                this.filePreview = reader.result;
            };
            reader.readAsDataURL(this.selectedFile);
        }
    }

    triggerFileInput(): void {
        const fileInput = document.getElementById('files') as HTMLElement;
        fileInput.click();
    }

    onSubmit(): void {
        if (this.uploadForm.invalid) {
            return;
        }

        this.uploadForm.disable();
        this.showAlert = false;

        if (this.selectedFile) {
            const formData = { ...this.uploadForm.value, token: this.token };

            this.onboardingService
                .uploadFile(this.selectedFile, formData)
                .subscribe({
                    next: (response) => {
                        this.uploadedImages.push({
                            url: URL.createObjectURL(this.selectedFile!),
                            meta: { ...formData },
                        });
                        this.alert = {
                            type: 'success',
                            message: 'File uploaded successfully!',
                        };
                        this.showAlert = true;
                        this.resetFormState();
                    },
                    error: (err) => {
                        this.alert = {
                            type: 'error',
                            message: 'File upload failed. Please try again.',
                        };
                        this.showAlert = true;
                        this.resetFormState();
                    },
                });
        } else {
            this.alert = {
                type: 'error',
                message:
                    'Please fill in all metadata fields and select a file.',
            };
            this.showAlert = true;
        }
    }

    private resetFormState(): void {
        this.onboardingNgForm.resetForm();
        this.uploadForm.enable();

        // Reset the file input manually to allow re-selection
        const fileInput = document.getElementById('files') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = ''; // Reset the input value to allow the same file to be selected again
        }

        this.selectedFile = null;
        this.filePreview = null;
    }
}
