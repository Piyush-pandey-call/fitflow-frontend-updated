import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {forkJoin} from 'rxjs';
import {AuthService} from '../../core/services/auth.service';
import {MemberService} from '../members/services/member.service';
import {WorkoutService} from '../workouts/services/workout.service';
import {DietService} from '../diet/services/diet.service';
import {DashboardService} from '../dashboard/services/dashboard.service';
import {MemberSummaryResponse} from '../../models/member.model';
import {WorkoutPlanResponse, DAY_OF_WEEK_LABELS} from '../../models/workout.model';
import {DietPlanResponse} from '../../models/diet.model';
@Component({selector:'app-wellness',standalone:true,imports:[CommonModule,FormsModule,RouterLink],templateUrl:'./wellness.component.html'})
export class WellnessComponent implements OnInit {
 readonly user=inject(AuthService).currentUser; private membersApi=inject(MemberService);private workoutsApi=inject(WorkoutService);private dietApi=inject(DietService);private dashboardApi=inject(DashboardService);
 readonly members=signal<MemberSummaryResponse[]>([]);readonly workouts=signal<WorkoutPlanResponse[]>([]);readonly diets=signal<DietPlanResponse[]>([]);readonly loading=signal(false);readonly error=signal('');readonly downloading=signal(false);readonly days=DAY_OF_WEEK_LABELS;
 memberId=''; search='';readonly isMember=this.user()?.role==='MEMBER';
 ngOnInit(){if(this.isMember){this.loading.set(true);this.dashboardApi.getMemberDashboard().subscribe({next:d=>{this.memberId=d.member.id;this.workouts.set(d.workouts.content);this.diets.set(d.dietPlans.content);this.loading.set(false);},error:e=>{this.error.set(e.message);this.loading.set(false);}});}else this.searchMembers();}
 searchMembers(){this.membersApi.list({search:this.search,page:0,size:50,sortBy:'fullName',sortDirection:'ASC'}).subscribe({next:p=>{this.members.set(p.content);if(!this.memberId && p.content.length){this.memberId=p.content[0].id;this.load();}},error:e=>this.error.set(e.message)});}
 load(){if(!this.memberId)return;this.loading.set(true);this.error.set('');forkJoin({workouts:this.workoutsApi.getMemberPlans(this.memberId,0,20),diets:this.dietApi.getMemberPlans(this.memberId,0,20)}).subscribe({next:r=>{this.workouts.set(r.workouts.content);this.diets.set(r.diets.content);this.loading.set(false);},error:e=>{this.error.set(e.message);this.loading.set(false);}});}
 download(plan:DietPlanResponse){this.downloading.set(true);this.dietApi.downloadPdf(plan.id).subscribe({next:b=>{const url=URL.createObjectURL(b);const a=document.createElement('a');a.href=url;a.download='diet-plan.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);this.downloading.set(false);},error:e=>{this.error.set(e.message);this.downloading.set(false);}});}
}