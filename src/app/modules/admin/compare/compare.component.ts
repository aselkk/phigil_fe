import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Firestore, collection, getDocs, query } from '@angular/fire/firestore';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FileCompareService } from 'app/core/compare/compare.service';
import { ErrorHandlingService } from 'app/core/erorrs/error-handler';
import { FuseAlertComponent } from '../../../../@fuse/components/alert/alert.component';
import { FuseLoadingBarComponent } from '../../../../@fuse/components/loading-bar/loading-bar.component';
import { CompareResultComponent } from './compare-result/compare-result.component';

@Component({
    selector: 'app-compare',
    standalone: true,
    imports: [
        FuseAlertComponent,
        CommonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatButtonModule,
        CompareResultComponent,
        FuseLoadingBarComponent,
    ],
    templateUrl: './compare.component.html',
    styles: '',
})
export class CompareComponent {
    showAlert: boolean = false;
    boxes: number[][] = [];
    names: string[] = [];
    imageUrl: string = '';
    selectedFile: File | null = null;
    filePreview: string | ArrayBuffer | null = null;
    token =
        'ya29.a0AcM612xauOUH7BFSo_FD5sWbQ3Nr5TpqED93W-nnOqhXStVwHxjwO8kWFh7_2RJ99eOt01ayWRUCy-gDZFdiQtA64-PTIPu-K5LrSJJ1HG4zFBQATDl0PH7iBJOt8RZg8KUDDHOCrVioI0pHwd6WeAQfOrPwRZfC7vQXgMO12AaCgYKAWgSARESFQHGX2Mihxmwtv5TPJY86WWA3BQ0Ww0177';

    uploadForm: FormGroup;
    alert = { type: '', message: '' };

    constructor(
        private formBuilder: FormBuilder,
        private fileCompareService: FileCompareService,
        private firestore: Firestore,
        private errorHandlingService: ErrorHandlingService
    ) {
        this.uploadForm = this.formBuilder.group({
            team: ['', Validators.required],
            token: [this.token],
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            this.selectedFile = input.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                this.filePreview = reader.result;
            };
            reader.readAsDataURL(this.selectedFile);
        }
    }

    triggerFileInput(): void {
        const fileInput = document.getElementById('files') as HTMLInputElement;
        fileInput.click();
    }

    async onSubmit(): Promise<void> {
        if (this.uploadForm.valid && this.selectedFile) {
            const teamName = this.uploadForm.value.team;

            const members = await this.fetchTeamMembers(teamName);

            const formData = {
                usernames: members,
                team: teamName,
                token: this.token,
            };

            this.fileCompareService
                .uploadFile(this.selectedFile, formData)
                .subscribe(
                    (response) => {
                        if (response.code === 0) {
                            this.boxes = response.boxes;
                            this.names = response.names;
                            this.imageUrl = URL.createObjectURL(
                                this.selectedFile!
                            );
                            this.uploadForm.reset();
                            this.selectedFile = null;
                            this.filePreview = null;
                        } else {
                            const error =
                                this.errorHandlingService.handleCompareError(
                                    response.code
                                );
                            this.alert = error;
                            this.showAlert = true;
                            this.hideAlertAfterDelay();
                        }
                    },
                    (error) => {
                        this.alert = {
                            type: 'error',
                            message: 'File upload failed.',
                        };
                        this.showAlert = true;
                        this.hideAlertAfterDelay();
                    }
                );
        } else {
            this.uploadForm.enable();
            this.alert = {
                type: 'error',
                message:
                    'Please fill in all metadata fields and select a file.',
            };
            this.showAlert = true;
            this.hideAlertAfterDelay();
        }
    }

    async fetchTeamMembers(teamName: string): Promise<string[]> {
        try {
            const membersCollection = collection(
                this.firestore,
                'teams',
                teamName,
                'members'
            );
            const q = query(membersCollection);
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map((doc) => doc.id);
        } catch (error) {
            console.error('Error fetching team members: ', error);
            return [];
        }
    }

    hideAlertAfterDelay(): void {
        setTimeout(() => {
            this.showAlert = false;
        }, 3000);
    }
}
