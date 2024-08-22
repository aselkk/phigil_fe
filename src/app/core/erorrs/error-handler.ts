import { Injectable } from '@angular/core';
import { FuseAlertType } from '@fuse/components/alert';

@Injectable({
    providedIn: 'root',
})
export class ErrorHandlingService {
    handleOnboardingError(code: number): {
        type: FuseAlertType;
        message: string;
    } {
        let type: FuseAlertType = 'error';
        let message: string;

        switch (code) {
            case 0:
                type = 'success';
                message = 'Successful check!';
                break;
            case 1:
                message =
                    'No face detected, or the image is too small or of poor quality.';
                break;
            case 2:
                message = 'More than one face detected in the image.';
                break;
            case 3:
                message = 'Face is not centered in the image.';
                break;
            default:
                message = 'Unknown error occurred. Please try again.';
                break;
        }

        return { type, message };
    }

    handleCompareError(code: number): { type: FuseAlertType; message: string } {
        let type: FuseAlertType = 'error';
        let message: string;

        switch (code) {
            case 0:
                type = 'success';
                message = 'Check successful!';
                break;
            case 1:
                message =
                    'No face detected, or the image is too small or of poor quality.';
                break;
            default:
                message = 'Unknown error occurred. Please try again.';
                break;
        }

        return { type, message };
    }
}
