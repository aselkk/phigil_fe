import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FuseCardComponent } from '@fuse/components/card';
import { TeamsService } from 'app/core/teams/teams.service';
import { Observable } from 'rxjs';
import { FuseLoadingBarComponent } from '../../../../@fuse/components/loading-bar/loading-bar.component';

@Component({
    selector: 'app-teams',
    templateUrl: './teams.component.html',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FuseLoadingBarComponent,
        FuseCardComponent,
        MatIconModule,
    ],
})
export class TeamsComponent implements OnInit {
    teams$: Observable<any[]>;
    constructor(private teamsService: TeamsService) {}

    ngOnInit(): void {
        this.teams$ = this.teamsService.getTeams();
    }
}
