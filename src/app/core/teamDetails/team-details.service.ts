import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TeamDetailsService {
    constructor(private firestore: Firestore) {}

    getTeamName(userId: string, teamId: string): Observable<string> {
        const teamDocRef = doc(
            this.firestore,
            `users/${userId}/teams/${teamId}`
        );
        return from(getDoc(teamDocRef)).pipe(
            map((docSnapshot) =>
                docSnapshot.exists() ? docSnapshot.data().name : null
            )
        );
    }
}
