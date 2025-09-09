import { Component, Input, forwardRef, OnInit, OnDestroy, ElementRef, ViewChild, HostListener, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday, isBefore, isAfter } from 'date-fns';

@Component({
  selector: 'app-custom-date-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <input
        #dateInput
        type="text"
        [value]="displayValue"
        (click)="toggleCalendar()"
        (blur)="onBlur()"
        (focus)="onFocus()"
        [disabled]="disabled"
        [class]="inputClasses"
        [attr.aria-label]="ariaLabel || 'Select date'"
        [attr.aria-describedby]="ariaDescribedBy"
        [attr.aria-invalid]="hasError"
        [attr.aria-expanded]="isOpen"
        [attr.aria-haspopup]="'dialog'"
        [name]="name"
        placeholder="Dec 25, 2024"
        readonly
      />
    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
    </div>
    <button
      *ngIf="hasValue"
      type="button"
      (click)="clearDate()"
      class="absolute inset-y-0 right-8 flex items-center pr-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
      </svg>
    </button>

      <!-- Calendar Modal -->
      <div
        *ngIf="isOpen"
        class="absolute left-0 right-0 z-50 top-full mt-1"
        (click)="closeCalendar()"
      >
        <div
          class="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mx-auto"
          (click)="$event.stopPropagation()"
          [@modalIn]
        >
        <!-- Calendar Header -->
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-2 sm:px-4 sm:py-3">
          <div class="flex items-center justify-between">
            <button
              type="button"
              (click)="previousMonth()"
              class="p-1.5 sm:p-2 text-white hover:bg-white/20 rounded-lg transition-colors duration-200"
              [attr.aria-label]="'Previous month'"
            >
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <h3 class="text-sm sm:text-lg font-semibold text-white">
              {{ format(currentMonth, 'MMM yyyy') }}
            </h3>
            
            <button
              type="button"
              (click)="nextMonth()"
              class="p-1.5 sm:p-2 text-white hover:bg-white/20 rounded-lg transition-colors duration-200"
              [attr.aria-label]="'Next month'"
            >
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Calendar Body -->
        <div class="p-2 sm:p-4">
          <!-- Day Headers -->
          <div class="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
            <div *ngFor="let day of dayHeaders" class="text-center text-xs sm:text-sm font-medium text-gray-500 py-0.5 sm:py-1 md:py-2">
              {{ day }}
            </div>
          </div>

          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 gap-0.5 sm:gap-1" *ngIf="calendarDays && calendarDays.length > 0">
            <button
              *ngFor="let day of calendarDays"
              type="button"
              (click)="selectDate(day)"
              [disabled]="isDateDisabled(day)"
              [class]="getDayClasses(day)"
              [attr.aria-label]="format(day, 'MMMM d, yyyy')"
            >
              {{ format(day, 'd') }}
            </button>
          </div>
          <!-- Loading state -->
          <div *ngIf="!calendarDays || calendarDays.length === 0" class="flex items-center justify-center py-8">
            <div class="text-gray-500">Loading calendar...</div>
          </div>
        </div>

        <!-- Calendar Footer -->
        <div class="bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 flex justify-between items-center">
          <button
            type="button"
            (click)="selectToday()"
            class="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            Today
          </button>
          <button
            type="button"
            (click)="closeCalendar()"
            class="text-xs sm:text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
          >
            Close
          </button>
        </div>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="hasError && errorMessage" class="mt-1 text-sm text-red-600" role="alert">
        {{ errorMessage }}
      </div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDatePickerComponent),
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
export class CustomDatePickerComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {
  
  @Input() placeholder: string = 'Select date';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() minDate: Date | null = null;
  @Input() maxDate: Date | null = null;
  @Input() ariaLabel: string = '';
  @Input() ariaDescribedBy: string = '';
  @Input() errorMessage: string = '';
  @Input() name: string = '';
  @Input() customClasses: string = '';


  private _value: Date | null = null;
  private _isFocused = false;
  private _hasError = false;
  private _isOpen = false;

  currentMonth = new Date();
  dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: Date[] = [];

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
    return format(this._value, 'MMM dd, yyyy');
  }

  get hasValue(): boolean {
    return this._value !== null;
  }

  get inputClasses(): string {
    const baseClasses = 'w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50 transition-all duration-200 text-sm font-montserrat cursor-pointer bg-white';
    const defaultBorder = 'border-gray-300';
    return this.customClasses ? `${baseClasses} ${this.customClasses}` : `${baseClasses} ${defaultBorder}`;
  }

  ngOnInit() {
    // Initialize current month if not set
    if (!this.currentMonth) {
      this.currentMonth = new Date();
    }
    this.generateCalendarDays();
  }

  ngAfterViewInit() {
    // Ensure data is loaded after view initialization
    this.ensureCalendarDataLoaded();
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
      this.closeCalendar();
    }
  }

  generateCalendarDays() {
    const start = startOfWeek(startOfMonth(this.currentMonth));
    const end = endOfWeek(endOfMonth(this.currentMonth));
    this.calendarDays = eachDayOfInterval({ start, end });
  }

  getDayClasses(day: Date): string {
    const baseClasses = 'w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20';
    
    const isCurrentMonth = isSameMonth(day, this.currentMonth);
    const isSelected = this._value && isSameDay(day, this._value);
    const isTodayDate = isToday(day);
    const isDisabled = this.isDateDisabled(day);
    
    if (isDisabled) {
      return `${baseClasses} text-gray-300 cursor-not-allowed bg-gray-50`;
    }
    
    if (isSelected) {
      return `${baseClasses} text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg transform scale-105`;
    }
    
    if (isTodayDate) {
      return `${baseClasses} text-blue-600 bg-blue-50 hover:bg-blue-100 font-semibold`;
    }
    
    if (!isCurrentMonth) {
      return `${baseClasses} text-gray-400 hover:bg-gray-50`;
    }
    
    return `${baseClasses} text-gray-700 hover:bg-gray-100`;
  }

  isDateDisabled(day: Date): boolean {
    if (this.minDate && isBefore(day, this.minDate)) return true;
    if (this.maxDate && isAfter(day, this.maxDate)) return true;
    return false;
  }

  selectDate(day: Date) {
    if (this.isDateDisabled(day)) return;
    
    this.value = day;
    this._hasError = false;
    this.closeCalendar();
  }

  selectToday() {
    const today = new Date();
    if (!this.isDateDisabled(today)) {
      this.value = today;
      this._hasError = false;
      this.closeCalendar();
    }
  }

  clearDate() {
    this.value = null;
    this._hasError = false;
  }

  previousMonth() {
    this.currentMonth = subMonths(this.currentMonth, 1);
    this.generateCalendarDays();
  }

  nextMonth() {
    this.currentMonth = addMonths(this.currentMonth, 1);
    this.generateCalendarDays();
  }

  toggleCalendar() {
    if (this.disabled) return;
    this._isOpen = !this._isOpen;
    if (this._isOpen) {
      // Use setTimeout to ensure the modal is rendered before loading data
      setTimeout(() => {
        this.ensureCalendarDataLoaded();
      }, 0);
    }
  }

  ensureCalendarDataLoaded() {
    // Ensure we have a valid current month
    if (!this.currentMonth) {
      this.currentMonth = new Date();
    }
    // Always regenerate calendar days to ensure fresh data
    this.generateCalendarDays();
  }

  closeCalendar() {
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
      this.currentMonth = value;
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
    // Initialize calendar data immediately
    this.currentMonth = new Date();
    this.calendarDays = [];
    this.generateCalendarDays();
  }

  format(date: Date, formatStr: string): string {
    return format(date, formatStr);
  }
}
