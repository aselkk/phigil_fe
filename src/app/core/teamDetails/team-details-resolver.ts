import { inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { TeamsService } from '../teams/teams.service';

export const teamDetailsResolver = (
    route: ActivatedRouteSnapshot
): Observable<any> => {
    const teamsService = inject(TeamsService);
    const teamId = route.paramMap.get('teamId');
    return teamsService.getTeamById(teamId!);
};
