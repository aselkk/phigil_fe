import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
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
        'ya29.a0AcM612wNW3F2ulREuRvJGtd90GsLPRjmujr1YPE4NREypTG6TVAoHt0l9n2f_LpPGkXYczSIemz1kwahBl897WIIMyJYJeQiCRuBEiKNvu5fNU0IiuUw3Ck5RVosUQatslxMDf2x7UIk5m2wZoSThdTomV-5OmXtHacGCE0yaCgYKATISARISFQHGX2MiLnsV2KVND27s9_kd5k0GmA0175';

    uploadForm: FormGroup;
    alert = { type: '', message: '' };

    constructor(
        private formBuilder: FormBuilder,
        private fileCompareService: FileCompareService,
        private errorHandlingService: ErrorHandlingService,
        private dialog: MatDialog
    ) {
        this.uploadForm = this.formBuilder.group({
            team: ['', Validators.required],
            token: [this.token],
        });
    }

    triggerFileInput(): void {
        const fileInput = document.getElementById('files') as HTMLInputElement;
        fileInput.click();
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

    async onSubmit(): Promise<void> {
        if (this.uploadForm.valid && this.selectedFile) {
            const formData = {
                team: this.uploadForm.value.team,
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
                            this.resetFileInput();

                            this.openCompareResultModal();
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

    resetFileInput(): void {
        const fileInput = document.getElementById('files') as HTMLInputElement;
        fileInput.value = '';
    }

    openCompareResultModal(): void {
        this.dialog.open(CompareResultComponent, {
            width: '60%',
            maxWidth: '600px',
            maxHeight: '100vh',
            data: {
                imageUrl: this.imageUrl,
                boxes: this.boxes,
                names: this.names,
            },
        });
    }

    hideAlertAfterDelay(): void {
        setTimeout(() => {
            this.showAlert = false;
        }, 3000);
    }
}
