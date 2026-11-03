import { Routes } from '@angular/router';

export const GYM_INFO_ROUTES: Routes = [
  {
    path: 'about',
    data: { page: 'about' },
    loadComponent: () => import('./pages/gym-info/gym-info.component').then((m) => m.GymInfoComponent),
    title: 'About the Gym | FitFlow',
  },
  {
    path: 'training',
    data: { page: 'training' },
    loadComponent: () => import('./pages/gym-info/gym-info.component').then((m) => m.GymInfoComponent),
    title: 'Training Options | FitFlow',
  },
  {
    path: 'benefits',
    data: { page: 'benefits' },
    loadComponent: () => import('./pages/gym-info/gym-info.component').then((m) => m.GymInfoComponent),
    title: 'Benefits of Joining | FitFlow',
  },
  {
    path: 'membership',
    data: { page: 'membership' },
    loadComponent: () => import('./pages/gym-info/gym-info.component').then((m) => m.GymInfoComponent),
    title: 'Gym Membership Guide | FitFlow',
  },
];
