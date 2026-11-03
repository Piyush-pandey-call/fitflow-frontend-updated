import { AfterViewInit, Component, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../services/attendance.service';
import { AttendanceResponse } from '../../../../models/attendance.model';

/**
 * Handheld/desk USB and Bluetooth QR scanners (the kind gyms actually use at
 * a front desk) work by emulating a keyboard: they "type" the scanned value
 * into whatever input is focused, then send an Enter keystroke. So this page
 * is just an always-focused text input listening for Enter - no camera
 * permissions, no JS barcode-scanning library, and it works with the real
 * hardware this feature is for. (A phone-camera self-check-in flow could be
 * added later as a second mode if you want members scanning with their own
 * phones, but that needs a camera/QR-decoding library this project doesn't
 * currently depend on.)
 */
@Component({
  selector: 'app-qr-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qr-attendance.component.html',
  styleUrl: './qr-attendance.component.css',
})
export class QrAttendanceComponent implements AfterViewInit {
  @ViewChild('scanInput') scanInputRef!: ElementRef<HTMLInputElement>;

  scanValue = '';
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly lastCheckIn = signal<AttendanceResponse | null>(null);
  readonly recentCheckIns = signal<AttendanceResponse[]>([]);

  constructor(private attendanceService: AttendanceService) {}

  ngAfterViewInit(): void {
    this.focusInput();
  }

  focusInput(): void {
    this.scanInputRef?.nativeElement.focus();
  }

  onScan(): void {
    const value = this.scanValue.trim();
    if (!value || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.attendanceService.checkInByQr(value).subscribe({
      next: (record) => {
        this.lastCheckIn.set(record);
        this.recentCheckIns.set([record, ...this.recentCheckIns()].slice(0, 8));
        this.scanValue = '';
        this.isSubmitting.set(false);
        this.focusInput();
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.scanValue = '';
        this.isSubmitting.set(false);
        this.focusInput();
      },
    });
  }
}
