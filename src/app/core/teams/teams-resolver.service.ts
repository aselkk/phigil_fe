import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TeamsService } from './teams.service';

export const teamsResolver = (): Observable<any> => {
    const teamsService = inject(TeamsService);
    return teamsService.getTeams();
};
