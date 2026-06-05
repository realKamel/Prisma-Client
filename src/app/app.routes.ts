import { Routes } from '@angular/router';
import { LandingPage } from './Pages/landing-page/landing-page';
import { Register } from './Pages/register/register';

export const routes: Routes = [
        {path:'', redirectTo:"home", pathMatch:"full"},
        {path:'home',component:LandingPage},
        {path:'register',component:Register}


];
