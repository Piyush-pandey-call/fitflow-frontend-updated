import { AfterViewInit, Component, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {FormBuilder,ReactiveFormsModule,Validators} from '@angular/forms';
import {AuthService} from '../../../../core/services/auth.service';
@Component({selector:'app-welcome',standalone:true,imports:[CommonModule,RouterLink,ReactiveFormsModule],templateUrl:'./welcome.component.html',styleUrl:'./welcome.component.css'})
export class WelcomeComponent implements AfterViewInit, OnDestroy {
 private fb=inject(FormBuilder);private auth=inject(AuthService);private router=inject(Router);
 readonly loginForm=this.fb.nonNullable.group({email:['',[Validators.required,Validators.email]],password:['',Validators.required]});readonly signingIn=signal(false);readonly loginError=signal('');
 login(){if(this.loginForm.invalid){this.loginForm.markAllAsTouched();return;}this.signingIn.set(true);this.loginError.set('');this.auth.login(this.loginForm.getRawValue()).subscribe({next:r=>{this.signingIn.set(false);if(r.role==='MEMBER'){this.auth.clearLocalSession();this.loginError.set('Please use the member login.');return;}this.router.navigate(['/dashboard']);},error:e=>{this.signingIn.set(false);this.loginError.set(e.message);}});}
 readonly active = signal(0); private observer?: IntersectionObserver; private revealObserver?: IntersectionObserver;
 readonly landingImages = {
  strength: '/assets/gym-strength.jpg',
  memberTraining: '/assets/gym-member-training.jpg',
  coaching: '/assets/gym-coaching.jpg',
  interior: '/assets/gym-interior.jpg',
  flexibility: '/assets/gym-flexibility.jpg',
  groupTraining: '/assets/gym-group-training.jpg',
  cardio: '/assets/gym-member-cardio.jpg',
 };
 readonly stepImages = [
  {src:this.landingImages.interior,alt:'Modern gym training floor'},
  {src:this.landingImages.coaching,alt:'Athlete training in a bright gym'},
  {src:this.landingImages.groupTraining,alt:'Battle-rope conditioning session'},
  {src:this.landingImages.flexibility,alt:'Gym floor prepared for a varied workout'},
 ];
 readonly planImages = [
  {src:this.landingImages.strength,alt:'Strength-training equipment'},
  {src:this.landingImages.cardio,alt:'Member taking part in a cardio workout'},
  {src:this.landingImages.memberTraining,alt:'Member building a fitness routine'},
 ];
 readonly sections=['home','why-fitflow','features','how-it-works','check-in','everyone','pricing','faqs','get-started'];
 readonly plans=[{name:'Monthly',badge:'FLEXIBLE',price:'Rs 999',monthly:'Rs 999 / month',tone:'cyan'},{name:'6 months',badge:'MOST POPULAR',price:'Rs 4,999',monthly:'~ Rs 833 / month',tone:'violet'},{name:'Yearly',badge:'BEST VALUE',price:'Rs 8,999',monthly:'~ Rs 750 / month',tone:'coral'}];
 ngAfterViewInit(){
  const sections=Array.from(document.querySelectorAll<HTMLElement>('.website-experience .experience-section'));
  if(!('IntersectionObserver' in window)){sections.forEach(section=>section.classList.add('is-visible'));return;}
  this.observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)this.active.set(this.sections.indexOf((entry.target as HTMLElement).id));},{threshold:0.35});
  this.revealObserver=new IntersectionObserver(entries=>{for(const entry of entries)(entry.target as HTMLElement).classList.toggle('is-visible',entry.isIntersecting);},{threshold:0.12,rootMargin:'-7% 0px -7% 0px'});
  sections.forEach((section,index)=>{section.classList.add(index%2===0?'reveal-from-left':'reveal-from-right');this.observer!.observe(section);this.revealObserver!.observe(section);});
 }
 ngOnDestroy(){this.observer?.disconnect();this.revealObserver?.disconnect();}
 go(i:number){document.getElementById(this.sections[i])?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
}