import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DietService } from '../../services/diet.service';
import { TrainerService } from '../../../trainers/services/trainer.service';
import { MemberService } from '../../../members/services/member.service';
import { COMMON_MEAL_TYPES, DietItemRequest, GenerateAiDietPlanRequest } from '../../../../models/diet.model';
import { TrainerResponse } from '../../../../models/trainer.model';
import { MemberResponse } from '../../../../models/member.model';

interface ItemRow extends DietItemRequest {
  rowId: number;
}

@Component({
  selector: 'app-diet-plan-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './plan-form.component.html',
  styleUrl: './plan-form.component.css',
})
export class DietPlanFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dietService = inject(DietService);
  private trainerService = inject(TrainerService);
  private memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly member = signal<MemberResponse | null>(null);
  readonly trainers = signal<TrainerResponse[]>([]);
  readonly mealTypeOptions = COMMON_MEAL_TYPES;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.maxLength(1000)]],
    trainerId: [''],
    dailyCalorieTarget: [null as number | null],
    dailyProteinGrams: [null as number | null],
    dailyCarbsGrams: [null as number | null],
    dailyFatGrams: [null as number | null],
    startDate: [''],
    endDate: [''],
  });

  rows: ItemRow[] = [];
  private nextRowId = 1;
  private memberId!: string;

  // ---- AI diet plan generator (alternative to the manual form above) ----
  readonly showAiPanel = signal(false);
  readonly aiDietType = signal('');
  readonly aiCuisine = signal('');
  readonly aiAllergies = signal('');
  readonly aiMealsPerDay = signal<number | null>(null);
  readonly aiTargetCalories = signal<number | null>(null);
  readonly aiNotes = signal('');
  readonly isGeneratingAiPlan = signal(false);
  readonly aiError = signal<string | null>(null);

  ngOnInit(): void {
    this.memberId = this.route.snapshot.paramMap.get('memberId')!;
    this.memberService.getById(this.memberId).subscribe({ next: (m) => this.member.set(m) });
    this.trainerService.listAssignable().subscribe({ next: (t) => this.trainers.set(t) });
    this.addRow();
  }

  get f() {
    return this.form.controls;
  }

  addRow(): void {
    this.rows = [...this.rows, { rowId: this.nextRowId++, mealType: 'Breakfast', foodName: '' }];
  }

  removeRow(rowId: number): void {
    this.rows = this.rows.filter((r) => r.rowId !== rowId);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const items: DietItemRequest[] = this.rows
      .filter((r) => r.foodName.trim())
      .map((r) => ({
        mealType: r.mealType,
        foodName: r.foodName,
        quantityDescription: r.quantityDescription || undefined,
        calories: r.calories || undefined,
        proteinGrams: r.proteinGrams || undefined,
        carbsGrams: r.carbsGrams || undefined,
        fatGrams: r.fatGrams || undefined,
        notes: r.notes || undefined,
      }));

    const raw = this.form.getRawValue();
    this.dietService
      .createPlan({
        name: raw.name!,
        description: raw.description || undefined,
        memberId: this.memberId,
        trainerId: raw.trainerId || undefined,
        dailyCalorieTarget: raw.dailyCalorieTarget ?? undefined,
        dailyProteinGrams: raw.dailyProteinGrams ?? undefined,
        dailyCarbsGrams: raw.dailyCarbsGrams ?? undefined,
        dailyFatGrams: raw.dailyFatGrams ?? undefined,
        startDate: raw.startDate || undefined,
        endDate: raw.endDate || undefined,
        items,
      })
      .subscribe({
        next: (plan) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/diet/plan', plan.id]);
        },
        error: (err: Error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.message);
        },
      });
  }

  toggleAiPanel(): void {
    this.showAiPanel.update((v) => !v);
    this.aiError.set(null);
  }

  generateAiPlan(): void {
    this.isGeneratingAiPlan.set(true);
    this.aiError.set(null);

    const request: GenerateAiDietPlanRequest = {
      memberId: this.memberId,
      dietType: this.aiDietType() || undefined,
      cuisinePreference: this.aiCuisine() || undefined,
      allergiesOrRestrictions: this.aiAllergies() || undefined,
      mealsPerDay: this.aiMealsPerDay() ?? undefined,
      targetCalories: this.aiTargetCalories() ?? undefined,
      additionalNotes: this.aiNotes() || undefined,
      save: true,
    };

    this.dietService.generateAiPlan(request).subscribe({
      next: (plan) => {
        this.isGeneratingAiPlan.set(false);
        this.router.navigate(['/diet/plan', plan.id]);
      },
      error: (err: Error) => {
        this.isGeneratingAiPlan.set(false);
        this.aiError.set(err.message);
      },
    });
  }
}
