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
    uploadedImages: any[] = [];
    token =
        'ya29.a0AcM612z_sgsjNF1EKbiFQpbFTxckn8yfcBA3YlkAZ1AvAUTsnWq8DkOk25JG0ZPHIEnC2un0tXkGvSl85ZuLllRZfxuDIyOvKKc8ulb8KJmiQb__eOIVoL355J06_PjOETvx7mIQaWUM24pgGFprJSIPfyu4y719_iwuucu49QaCgYKAUoSARESFQHGX2MikJ0WLQsPSSWJAcju0tDjDQ0177';

    uploadForm: FormGroup;
    alert = { type: '', message: '' };

    constructor(
        private formBuilder: FormBuilder,
        private fileCompareService: FileCompareService,
        private firestore: Firestore // Inject Firestore
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

            // Fetch team members from Firestore
            const members = await this.fetchTeamMembers(teamName);

            // Include team members in the compare request
            const formData = {
                usernames: members,
                team: teamName,
                token: this.token,
            };

            this.fileCompareService
                .uploadFile(this.selectedFile, formData)
                .subscribe(
                    (response) => {
                        this.uploadedImages.push({
                            url: URL.createObjectURL(this.selectedFile!),
                            meta: { ...formData },
                        });
                        this.boxes = response.boxes;
                        this.names = response.names;
                        this.imageUrl = URL.createObjectURL(this.selectedFile!);
                        this.uploadForm.reset();
                        this.selectedFile = null;
                        this.filePreview = null;
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

            return querySnapshot.docs.map((doc) => doc.id); // Assuming the document ID is the member's name
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
