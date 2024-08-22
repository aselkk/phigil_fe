import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import {
    Storage,
    getDownloadURL,
    ref,
    uploadBytes,
} from '@angular/fire/storage';
import { Observable, catchError, from, map, of, switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class OnboardingService {
    private apiUrl =
        'https://onboard-lwdrsd6qmq-uc.a.run.app/predictions/onboard';

    constructor(
        private http: HttpClient,
        private firestore: Firestore,
        private storage: Storage
    ) {}

    createTeam(teamName: string): Promise<void> {
        const teamDocRef = doc(collection(this.firestore, 'teams'), teamName);
        return setDoc(teamDocRef, {});
    }

    addTeamMember(
        teamName: string,
        memberName: string,
        memberData: any,
        file: File
    ): Observable<any> {
        const formData: FormData = new FormData();
        formData.append('image', file, file.name);
        formData.append(
            'meta',
            new Blob([JSON.stringify(memberData)], { type: 'application/json' })
        );

        const apiCall$ = this.http
            .post(this.apiUrl, formData, { observe: 'response' })
            .pipe(
                map((response: any) => {
                    const responseBody = response.body;
                    const { code, description } = responseBody;
                    return { code, description };
                }),
                catchError((error) => {
                    throw new Error('API request failed');
                })
            );

        return apiCall$.pipe(
            switchMap((apiResponse) => {
                if (apiResponse.code === 0) {
                    const fileRef = ref(this.storage, `images/${file.name}`);
                    return from(uploadBytes(fileRef, file)).pipe(
                        switchMap(() => getDownloadURL(fileRef)),
                        switchMap((downloadURL) => {
                            const memberDocRef = doc(
                                collection(
                                    doc(this.firestore, 'teams', teamName),
                                    'members'
                                ),
                                memberName
                            );
                            return from(
                                setDoc(memberDocRef, {
                                    ...memberData,
                                    imageUrl: downloadURL,
                                })
                            ).pipe(
                                map(() => ({
                                    ...apiResponse,
                                    downloadURL,
                                })),
                                catchError((error) => {
                                    throw new Error(
                                        'Error saving metadata to Firestore'
                                    );
                                })
                            );
                        }),
                        catchError((error) => {
                            throw new Error(
                                'Error uploading file to Firebase Storage'
                            );
                        })
                    );
                } else {
                    return of(apiResponse);
                }
            })
        );
    }
}
