import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormControl,
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
        'ya29.a0AcM612zlt9ASxMs3EwQa3015LWgzDg0iy32wRUoJq0va6YEw2o4AYS51K02gRjC1Zc_zlzaqZN4lqnYtJpos1GqBSetRYOJe4kZqt738L1k7pw6rwpOrOsphQjYE-lm8bvrye-VJEJvoZ4ljHNaZss0BNe70bZU6KR5cy_-vaCgYKAZoSARISFQHGX2Mi5r-yAJ_ffTKM5FaLA-ceBg0175';

    uploadForm: FormGroup;
    alert = { type: '', message: '' };

    constructor(
        private formBuilder: FormBuilder,
        private fileCompareService: FileCompareService
    ) {
        this.uploadForm = this.formBuilder.group({
            usernames: this.formBuilder.array([this.createUsernameControl()]),
            team: ['', Validators.required],
            token: [this.token],
        });
    }

    get usernames() {
        return this.uploadForm.get('usernames') as FormArray;
    }

    createUsernameControl(): FormControl {
        return this.formBuilder.control('', Validators.required);
    }

    addUsername(): void {
        this.usernames.push(this.createUsernameControl());
    }

    removeUsername(index: number): void {
        if (this.usernames.length > 1) {
            this.usernames.removeAt(index);
        }
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

    onSubmit(): void {
        if (this.uploadForm.valid && this.selectedFile) {
            const formData = {
                usernames: this.uploadForm.value.usernames,
                team: this.uploadForm.value.team,
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

    hideAlertAfterDelay(): void {
        setTimeout(() => {
            this.showAlert = false;
        }, 3000);
    }
}
