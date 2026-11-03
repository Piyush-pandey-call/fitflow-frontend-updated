import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Generic "chip list" editor for a string[] field - backs
 * CreateTrainerRequest.certifications / .specializations today, but isn't
 * trainer-specific: any future List<String> form field (e.g. workout tags,
 * diet restrictions) can reuse this as-is via [tags] + (tagsChange).
 */
@Component({
  selector: 'app-tag-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tag-input.component.html',
  styleUrl: './tag-input.component.css',
})
export class TagInputComponent {
  @Input() tags: string[] = [];
  @Input() placeholder = 'Type and press Enter…';
  @Output() tagsChange = new EventEmitter<string[]>();

  draft = '';

  add(): void {
    const value = this.draft.trim();
    if (!value || this.tags.includes(value)) {
      this.draft = '';
      return;
    }
    this.tagsChange.emit([...this.tags, value]);
    this.draft = '';
  }

  remove(index: number): void {
    this.tagsChange.emit(this.tags.filter((_, i) => i !== index));
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.add();
    } else if (event.key === 'Backspace' && !this.draft && this.tags.length) {
      this.remove(this.tags.length - 1);
    }
  }
}
