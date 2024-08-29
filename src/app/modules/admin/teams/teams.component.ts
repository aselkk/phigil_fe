import { CommonModule } from '@angular/common';
import { Component, OnInit, Signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FuseCardComponent } from '@fuse/components/card';
import { TeamsStoreService } from 'app/core/store/team-store.service';
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
    teams: Signal<string[]>;

    constructor(private teamsStoreService: TeamsStoreService) {}

    ngOnInit(): void {
        this.teams = this.teamsStoreService.getTeams();
    }
}
