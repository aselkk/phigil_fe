import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class OnboardingService {
    private apiUrl =
        'https://onboard-lwdrsd6qmq-uc.a.run.app/predictions/onboard';

    constructor(private http: HttpClient) {}

    uploadFile(file: File, meta: any): Observable<any> {
        const formData: FormData = new FormData();
        formData.append('image', file, file.name);
        formData.append(
            'meta',
            new Blob([JSON.stringify(meta)], { type: 'application/json' })
        );
        console.log(formData, 'formData');

        return this.http.post(this.apiUrl, formData);
    }
}
