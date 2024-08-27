import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar';
import { OnboardingService } from 'app/core/onboarding/onboarding.service';
import { UserService } from 'app/core/user/user.service';
import { FuseAlertComponent } from '../../../../@fuse/components/alert/alert.component';

@Component({
    selector: 'onboarding',
    animations: fuseAnimations,
    standalone: true,
    imports: [
        FuseLoadingBarComponent,
        CommonModule,
        MatIconModule,
        MatFormFieldModule,
        FormsModule,
        MatInputModule,
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

    onboardingForm: FormGroup;
    showAlert: boolean = false;
    selectedFile: File | null = null;
    filePreview: string | ArrayBuffer | null = null;

    constructor(
        private formBuilder: FormBuilder,
        private onboardingService: OnboardingService,
        private userService: UserService
    ) {}

    ngOnInit(): void {
        this.onboardingForm = this.formBuilder.group({
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
        if (this.onboardingForm.invalid || !this.selectedFile) {
            this.alert = {
                type: 'error',
                message: 'Please fill in all fields and select a file.',
            };
            this.showAlert = true;
            return;
        }

        this.onboardingForm.disable();
        this.showAlert = false;

        const userId = this.userService.getUid();
        if (!userId) {
            this.alert = {
                type: 'error',
                message: 'User not authenticated.',
            };
            this.showAlert = true;
            this.onboardingForm.enable();
            return;
        }

        const { username, team } = this.onboardingForm.value;

        this.onboardingService
            .createTeam(userId, team)
            .then((teamId) => {
                this.onboardingService
                    .addTeamMember(
                        userId,
                        teamId,
                        username,
                        {},
                        this.selectedFile!
                    )
                    .subscribe({
                        next: () => {
                            this.alert = {
                                type: 'success',
                                message: 'Member added successfully!',
                            };
                            this.showAlert = true;
                            this.resetFormState();
                        },
                        error: () => {
                            this.alert = {
                                type: 'error',
                                message:
                                    'Error adding member. Please try again.',
                            };
                            this.showAlert = true;
                            this.resetFormState();
                        },
                    });
            })
            .catch(() => {
                this.alert = {
                    type: 'error',
                    message: 'Team creation failed. Please try again.',
                };
                this.onboardingForm.enable();
                this.showAlert = true;
            });
    }

    private resetFormState(): void {
        this.onboardingNgForm.resetForm();
        this.onboardingForm.enable();

        const fileInput = document.getElementById('files') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }

        this.selectedFile = null;
        this.filePreview = null;
    }
}
