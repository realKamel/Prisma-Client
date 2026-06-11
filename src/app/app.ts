import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/Services/auth';
import { toast, NgxSonnerToaster } from 'ngx-sonner';
// import { CustomToast } from './Components/custom-toast/custom-toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Prisma.Client');
  protected readonly toast = toast;
  auth = inject(AuthService);
  router = inject(Router);

  fire() {
    // toast.custom(CustomToast, {
    //   componentProps: {
    //     title: 'This is <br />multiline message',
    //   },
    // });
  }
  ngOnInit() {
    console.log('App Init');
    // this.auth.login({
    //   id: '1',
    //   name: 'Test User',
    //   email: 'test@test.com',
    //   role: 'student', // 'student' | 'admin' | 'teacher' | 'assistant'
    // });
  }
}
