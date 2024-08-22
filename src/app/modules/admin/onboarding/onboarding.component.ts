import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
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
import { MatInputModule } from '@angular/material/input';
import { fuseAnimations } from '@fuse/animations';
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
        'ya29.a0AcM612z_sgsjNF1EKbiFQpbFTxckn8yfcBA3YlkAZ1AvAUTsnWq8DkOk25JG0ZPHIEnC2un0tXkGvSl85ZuLllRZfxuDIyOvKKc8ulb8KJmiQb__eOIVoL355J06_PjOETvx7mIQaWUM24pgGFprJSIPfyu4y719_iwuucu49QaCgYKAUoSARESFQHGX2MikJ0WLQsPSSWJAcju0tDjDQ0177';

    constructor(
        private formBuilder: FormBuilder,
        private _formBuilder: UntypedFormBuilder,
        private onboardingService: OnboardingService,
        private firestore: Firestore
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
        if (this.uploadForm.invalid || !this.selectedFile) {
            this.alert = {
                type: 'error',
                message:
                    'Please fill in all metadata fields and select a file.',
            };
            this.showAlert = true;
            return;
        }

        this.uploadForm.disable();
        this.showAlert = false;

        const formData = { ...this.uploadForm.value, token: this.token };

        // Create the team in Firestore
        this.onboardingService
            .createTeam(this.uploadForm.value.team)
            .then(() => {
                // Add the team member to Firestore and upload the file to the GCP bucket
                this.onboardingService
                    .addTeamMember(
                        this.uploadForm.value.team,
                        this.uploadForm.value.username,
                        formData,
                        this.selectedFile!
                    )
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
                                message:
                                    'File upload failed. Please try again.',
                            };
                            this.showAlert = true;
                            this.resetFormState();
                        },
                    });
            })
            .catch((error) => {
                this.alert = {
                    type: 'error',
                    message:
                        'Error creating team in Firestore. Please try again.',
                };
                this.showAlert = true;
                this.uploadForm.enable();
            });
    }

    private resetFormState(): void {
        this.onboardingNgForm.resetForm();
        this.uploadForm.enable();

        const fileInput = document.getElementById('files') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }

        this.selectedFile = null;
        this.filePreview = null;
    }
}
