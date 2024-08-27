import { Injectable } from '@angular/core';
import {
    Firestore,
    collection,
    collectionData,
    doc,
    docData,
} from '@angular/fire/firestore';
import { UserService } from 'app/core/user/user.service';
import { Team } from 'app/modules/admin/team-details/team.types';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TeamsService {
    constructor(
        private firestore: Firestore,
        private userService: UserService
    ) {}

    getTeams(): Observable<Team[]> {
        const userId = this.userService.getUid();
        if (!userId) {
            throw new Error('User not authenticated');
        }

        const teamsCollection = collection(
            this.firestore,
            `users/${userId}/teams`
        );
        return collectionData(teamsCollection, { idField: 'id' }) as Observable<
            Team[]
        >;
    }

    getTeamById(teamId: string): Observable<Team> {
        const userId = this.userService.getUid();
        if (!userId) {
            throw new Error('User not authenticated');
        }

        const teamDocRef = doc(
            this.firestore,
            `users/${userId}/teams/${teamId}`
        );
        return docData(teamDocRef, { idField: 'id' }) as Observable<Team>;
    }

    getTeamMembers(teamId: string): Observable<any[]> {
        const userId = this.userService.getUid();
        if (!userId) {
            throw new Error('User not authenticated');
        }

        const membersCollection = collection(
            this.firestore,
            `users/${userId}/teams/${teamId}/members`
        );
        return collectionData(membersCollection, {
            idField: 'id',
        }) as Observable<any[]>;
    }
}
