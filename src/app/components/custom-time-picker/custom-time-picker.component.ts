import { Component, Input, forwardRef, OnInit, OnDestroy, ElementRef, ViewChild, HostListener, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { format, setHours, setMinutes, addHours, subHours, addMinutes, subMinutes } from 'date-fns';

@Component({
  selector: 'app-custom-time-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <input
      #timeInput
      type="text"
      [value]="displayValue"
      (click)="toggleTimePicker()"
      (blur)="onBlur()"
      (focus)="onFocus()"
      [disabled]="disabled"
      [class]="inputClasses"
      [attr.aria-label]="ariaLabel || 'Select time'"
      [attr.aria-describedby]="ariaDescribedBy"
      [attr.aria-invalid]="hasError"
      [attr.aria-expanded]="isOpen"
      [attr.aria-haspopup]="'dialog'"
      [name]="name"
      placeholder="2:30 PM"
      readonly
    />
    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </div>
    <button
      *ngIf="hasValue"
      type="button"
      (click)="clearTime()"
      class="absolute inset-y-0 right-8 flex items-center pr-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
      </svg>
    </button>

      <!-- Time Picker Modal -->
      <div
        *ngIf="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        (click)="closeTimePicker()"
      >
        <div
          class="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          (click)="$event.stopPropagation()"
          [@modalIn]
        >
        <!-- Time Picker Header -->
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-2 sm:px-4 sm:py-3">
          <h3 class="text-sm sm:text-lg font-semibold text-white text-center">Select Time</h3>
        </div>

        <!-- Time Picker Body -->
        <div class="p-3 sm:p-4">
          <!-- Time Display -->
          <div class="text-center mb-4 sm:mb-6" *ngIf="currentTime">
            <div class="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              {{ formatTime(currentTime) }}
            </div>
            <div class="text-xs sm:text-sm text-gray-500">
              {{ formatTime12(currentTime) }}
            </div>
          </div>
          <!-- Loading state -->
          <div *ngIf="!currentTime" class="text-center mb-4 sm:mb-6">
            <div class="text-gray-500">Loading time...</div>
          </div>

          <!-- Time Controls -->
          <div class="space-y-2 sm:space-y-3 md:space-y-4" *ngIf="currentTime">
            <!-- Hours -->
            <div class="space-y-1 sm:space-y-2">
              <label class="text-xs sm:text-sm font-medium text-gray-700">Hours</label>
              <div class="flex items-center space-x-1 sm:space-x-2">
                <button
                  type="button"
                  (click)="decrementHours()"
                  class="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <svg class="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <div class="flex-1 bg-gray-50 rounded-lg p-1.5 sm:p-2 md:p-3 text-center">
                  <div class="text-base sm:text-lg md:text-2xl font-bold text-gray-900">{{ currentTime.getHours().toString().padStart(2, '0') }}</div>
                </div>
                
                <button
                  type="button"
                  (click)="incrementHours()"
                  class="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <svg class="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Minutes -->
            <div class="space-y-1 sm:space-y-2">
              <label class="text-xs sm:text-sm font-medium text-gray-700">Minutes</label>
              <div class="flex items-center space-x-1 sm:space-x-2">
                <button
                  type="button"
                  (click)="decrementMinutes()"
                  class="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <svg class="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <div class="flex-1 bg-gray-50 rounded-lg p-1.5 sm:p-2 md:p-3 text-center">
                  <div class="text-base sm:text-lg md:text-2xl font-bold text-gray-900">{{ currentTime.getMinutes().toString().padStart(2, '0') }}</div>
                </div>
                
                <button
                  type="button"
                  (click)="incrementMinutes()"
                  class="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <svg class="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Quick Time Buttons -->
            <div class="space-y-1 sm:space-y-2">
              <label class="text-xs sm:text-sm font-medium text-gray-700">Quick Select</label>
              <div class="grid grid-cols-2 gap-1 sm:gap-2">
                <button
                  *ngFor="let time of quickTimes"
                  type="button"
                  (click)="selectQuickTime(time)"
                  class="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  {{ time }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Time Picker Footer -->
        <div class="bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 flex justify-between items-center">
          <button
            type="button"
            (click)="selectCurrentTime()"
            class="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            Now
          </button>
          <div class="space-x-1 sm:space-x-2">
            <button
              type="button"
              (click)="closeTimePicker()"
              class="px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="confirmTime()"
              class="px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-200"
            >
              Select
            </button>
          </div>
        </div>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="hasError && errorMessage" class="mt-1 text-sm text-red-600" role="alert">
        {{ errorMessage }}
      </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomTimePickerComponent),
      multi: true
    }
  ],
  animations: [
    trigger('modalIn', [
      state('void', style({
        opacity: 0,
        transform: 'scale(0.9)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'scale(1)'
      })),
      transition('void => *', [
        animate('200ms ease-out')
      ]),
      transition('* => void', [
        animate('150ms ease-in')
      ])
    ])
  ]
})
export class CustomTimePickerComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {
  @Input() placeholder: string = 'Select time';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() ariaLabel: string = '';
  @Input() ariaDescribedBy: string = '';
  @Input() errorMessage: string = '';
  @Input() name: string = '';
  @Input() customClasses: string = '';

  @ViewChild('timeInput') timeInput!: ElementRef<HTMLInputElement>;

  private _value: Date | null = null;
  private _isFocused = false;
  private _hasError = false;
  private _isOpen = false;

  currentTime = new Date();
  quickTimes = ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM'];

  // ControlValueAccessor implementation
  private onChange = (value: Date | null) => {};
  private onTouched = () => {};

  get value(): Date | null {
    return this._value;
  }

  set value(val: Date | null) {
    this._value = val;
    this.onChange(val);
  }

  get hasError(): boolean {
    return this._hasError;
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  get displayValue(): string {
    if (!this._value) return '';
    return format(this._value, 'h:mm a');
  }

  get hasValue(): boolean {
    return this._value !== null;
  }

  get inputClasses(): string {
    const baseClasses = 'w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50 transition-all duration-200 text-sm font-montserrat cursor-pointer';
    const defaultBorder = 'border-gray-300';
    return this.customClasses ? `${baseClasses} ${this.customClasses}` : `${baseClasses} ${defaultBorder}`;
  }

  ngOnInit() {
    // Initialize current time if not set
    if (!this.currentTime) {
      this.currentTime = new Date();
    }
  }

  ngAfterViewInit() {
    // Ensure data is loaded after view initialization
    this.ensureTimeDataLoaded();
  }

  ngOnDestroy() {
    // Restore body scroll if modal was open when component is destroyed
    if (this._isOpen) {
      document.body.style.overflow = '';
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    if (this.isOpen) {
      this.closeTimePicker();
    }
  }

  formatTime(date: Date): string {
    return format(date, 'HH:mm');
  }

  formatTime12(date: Date): string {
    return format(date, 'h:mm a');
  }

  incrementHours() {
    this.currentTime = addHours(this.currentTime, 1);
  }

  decrementHours() {
    this.currentTime = subHours(this.currentTime, 1);
  }

  incrementMinutes() {
    this.currentTime = addMinutes(this.currentTime, 15);
  }

  decrementMinutes() {
    this.currentTime = subMinutes(this.currentTime, 15);
  }

  selectQuickTime(timeStr: string) {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    this.currentTime = setHours(setMinutes(new Date(), minutes), hour24);
  }

  selectCurrentTime() {
    this.currentTime = new Date();
  }

  confirmTime() {
    this.value = new Date(this.currentTime);
    this._hasError = false;
    this.closeTimePicker();
  }

  clearTime() {
    this.value = null;
    this._hasError = false;
  }

  toggleTimePicker() {
    if (this.disabled) return;
    this._isOpen = !this._isOpen;
    if (this._isOpen) {
      // Lock body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Use setTimeout to ensure the modal is rendered before loading data
      setTimeout(() => {
        this.ensureTimeDataLoaded();
      }, 0);
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = '';
    }
  }

  ensureTimeDataLoaded() {
    // Initialize current time if not set or if we have a value
    if (this._value) {
      this.currentTime = new Date(this._value);
    } else if (!this.currentTime) {
      this.currentTime = new Date();
    }
  }

  closeTimePicker() {
    this._isOpen = false;
    // Restore body scroll when modal is closed
    document.body.style.overflow = '';
  }

  onFocus() {
    this._isFocused = true;
  }

  onBlur() {
    this._isFocused = false;
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: Date | null): void {
    this._value = value;
    if (value) {
      this.currentTime = new Date(value);
    }
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  constructor(private elementRef: ElementRef) {
    // Initialize time data immediately
    this.currentTime = new Date();
    this.quickTimes = ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM'];
  }
}
