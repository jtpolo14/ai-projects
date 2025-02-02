import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AssetsComponent } from './pages/assets/assets.component';
import { AskComponent } from './pages/ask/ask.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
    },
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: 'assets',
        component: AssetsComponent
    },
    {
        path: 'ask',
        component: AskComponent
    }
];
