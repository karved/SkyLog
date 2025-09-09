import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FlightService, Flight, FlightInfoPayload } from '../../services/flight.service';
import { Router } from '@angular/router';
import { US_AIRPORTS, US_AIRLINES, Airport, Airline } from '../../constants/us-airports.constants';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { CustomDatePickerComponent } from '../custom-date-picker/custom-date-picker.component';
import { CustomTimePickerComponent } from '../custom-time-picker/custom-time-picker.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CustomDatePickerComponent, CustomTimePickerComponent],
  template: `
    <div class="h-screen bg-background flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-white/90 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div class="max-w-7xl mx-auto px-6">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </div>
              <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-primary bg-clip-text text-transparent font-montserrat">SkyLog</h1>
              <span class="ml-3 text-sm text-gray-500 font-medium font-montserrat">Flight Tracker</span>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-700 font-medium font-montserrat">Welcome, {{ userName }}</span>
              <button
                (click)="logout()"
                class="btn-outline px-4 py-2 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div class="flex-1 max-w-7xl mx-auto px-6 py-6 overflow-hidden">
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
          <!-- Flight Form -->
          <div class="card h-full overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-gray-900 font-montserrat">Log New Flight</h2>
              <div class="flex items-center space-x-2">
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="isRoundtrip" 
                    (ngModelChange)="onRoundtripToggle()"
                    name="isRoundtrip"
                    class="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                  >
                  <span class="ml-2 text-sm font-medium text-gray-700">Roundtrip</span>
                </label>
              </div>
            </div>
            
            <form (ngSubmit)="submitFlight()" #flightForm="ngForm" class="space-y-4">
              <!-- Airport Selection -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group">
                  <label for="from" class="label-with-icon">
                    <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Departure Airport
                  </label>
                  <div class="relative">
                    <input
                      type="text"
                      id="from"
                      name="from"
                      [(ngModel)]="fromSearchTerm"
                      (input)="onFromInputChange($event)"
                      (focus)="onFromInputFocus()"
                      (blur)="onFromInputBlur()"
                      required
                      [class]="'w-full pl-4 pr-10 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm font-montserrat ' + (isFromAirportValid ? 'border-gray-200' : 'border-red-300 bg-red-50')"
                      placeholder="e.g., LAX - Los Angeles"
                    >
                    <button
                      type="button"
                      *ngIf="selectedFromAirport"
                      (click)="clearFromAirport()"
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                      </svg>
                    </button>
                    <div *ngIf="filteredFromAirports.length > 0 && showFromDropdown" class="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      <div
                        *ngFor="let airport of filteredFromAirports"
                        (click)="selectFromAirport(airport)"
                        (mousedown)="$event.preventDefault()"
                        class="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div class="flex justify-between items-center">
                          <div>
                            <div class="font-semibold text-gray-900 text-sm">{{ airport.code }} - {{ airport.city }}</div>
                            <div class="text-xs text-gray-500">{{ airport.name }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div *ngIf="!isFromAirportValid && fromSearchTerm" class="text-red-500 text-xs mt-1">
                      Please select a valid airport from the dropdown
                    </div>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="to" class="label-with-icon">
                    <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Arrival Airport
                  </label>
                  <div class="relative">
                    <input
                      type="text"
                      id="to"
                      name="to"
                      [(ngModel)]="toSearchTerm"
                      (input)="onToInputChange($event)"
                      (focus)="onToInputFocus()"
                      (blur)="onToInputBlur()"
                      required
                      [class]="'w-full pl-4 pr-10 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm font-montserrat ' + (isToAirportValid ? 'border-gray-200' : 'border-red-300 bg-red-50')"
                      placeholder="e.g., JFK - New York"
                    >
                    <button
                      type="button"
                      *ngIf="selectedToAirport"
                      (click)="clearToAirport()"
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                      </svg>
                    </button>
                    <div *ngIf="filteredToAirports.length > 0 && showToDropdown" class="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      <div
                        *ngFor="let airport of filteredToAirports"
                        (click)="selectToAirport(airport)"
                        (mousedown)="$event.preventDefault()"
                        class="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div class="flex justify-between items-center">
                          <div>
                            <div class="font-semibold text-gray-900 text-sm">{{ airport.code }} - {{ airport.city }}</div>
                            <div class="text-xs text-gray-500">{{ airport.name }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div *ngIf="!isToAirportValid && toSearchTerm" class="text-red-500 text-xs mt-1">
                      Please select a valid airport from the dropdown
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Airport Validation Error -->
              <div *ngIf="airportValidationError" class="bg-red-50 border border-red-200 rounded-lg p-3">
                <div class="flex items-center">
                  <svg class="w-4 h-4 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                  <p class="text-red-700 text-sm font-medium">{{ airportValidationError }}</p>
                </div>
              </div>

              <!-- Airline and Date Selection -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group">
                  <label for="airline" class="label-with-icon">
                    <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                    Airline
                  </label>
                  <div class="relative">
                    <input
                      type="text"
                      id="airline"
                      name="airline"
                      [(ngModel)]="airlineSearchTerm"
                      (input)="onAirlineInputChange($event)"
                      (focus)="onAirlineInputFocus()"
                      (blur)="onAirlineInputBlur()"
                      required
                      [class]="'w-full pl-4 pr-10 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm font-montserrat ' + (isAirlineValid ? 'border-gray-200' : 'border-red-300 bg-red-50')"
                      placeholder="e.g., American Airlines"
                    >
                    <button
                      type="button"
                      *ngIf="selectedAirline"
                      (click)="clearAirline()"
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                      </svg>
                    </button>
                    <div *ngIf="filteredAirlines.length > 0 && showAirlineDropdown" class="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      <div
                        *ngFor="let airline of filteredAirlines"
                        (click)="selectAirline(airline)"
                        (mousedown)="$event.preventDefault()"
                        class="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div class="flex justify-between items-center">
                          <div>
                            <div class="font-semibold text-gray-900 text-sm">{{ airline.name }}</div>
                            <div class="text-xs text-gray-500">{{ airline.code }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div *ngIf="!isAirlineValid && airlineSearchTerm" class="text-red-500 text-xs mt-1">
                      Please select a valid airline from the dropdown
                    </div>
                  </div>
                </div>
                
                <div class="form-group">
                  <label class="label-with-icon">
                    <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    Flight Date
                  </label>
                  <div class="relative">
                    <app-custom-date-picker
                      [(ngModel)]="flightDate"
                      (ngModelChange)="onFlightDateChange($event)"
                      [required]="true"
                      [minDate]="minDate"
                      [maxDate]="maxDate"
                      ariaLabel="Select flight date"
                      errorMessage="Please select a valid flight date"
                      name="flightDate"
                    ></app-custom-date-picker>
                  </div>
                </div>
              </div>
              
              <!-- Roundtrip Return Date -->
              <div *ngIf="isRoundtrip" class="form-group">
                <label class="label-with-icon">
                  <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Return Date
                </label>
                <div class="relative">
                  <app-custom-date-picker
                    [(ngModel)]="returnDate"
                    (ngModelChange)="onReturnDateChange($event)"
                    [required]="isRoundtrip"
                    [minDate]="minReturnDate"
                    [maxDate]="maxDate"
                    ariaLabel="Select return date"
                    errorMessage="Please select a valid return date"
                    name="returnDate"
                  ></app-custom-date-picker>
                </div>
                <!-- Return Date Validation Error -->
                <div *ngIf="returnDateValidationError" class="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                  <div class="flex items-center">
                    <svg class="w-4 h-4 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    <p class="text-red-700 text-sm font-medium">{{ returnDateValidationError }}</p>
                  </div>
                </div>
                
              </div>

              <!-- API Challenge Fields -->
              <div class="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-xl border border-primary/20 space-y-4">
                <h3 class="text-sm font-semibold text-primary flex items-center font-montserrat">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Flight Details (API Challenge)
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="form-group">
                    <label for="flightNumber" class="label-with-icon">
                      <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                      </svg>
                      Flight Number
                    </label>
                    <input
                      type="text"
                      id="flightNumber"
                      name="flightNumber"
                      [(ngModel)]="apiData.flightNumber"
                      required
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm font-montserrat"
                      placeholder="e.g., AA123"
                    >
                  </div>
                  
                  <div class="form-group">
                    <label class="label-with-icon">
                      <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Arrival Time
                    </label>
                    <div class="relative">
                      <app-custom-time-picker
                        [(ngModel)]="arrivalTime"
                        [required]="true"
                        ariaLabel="Select arrival time"
                        errorMessage="Please select a valid arrival time"
                        name="arrivalTime"
                      ></app-custom-time-picker>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="form-group">
                    <label for="numOfGuests" class="label-with-icon">
                      <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      Number of Guests
                    </label>
                    <div class="relative">
                      <input
                        type="number"
                        id="numOfGuests"
                        name="numOfGuests"
                        [(ngModel)]="apiData.numOfGuests"
                        required
                        min="1"
                        class="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm font-montserrat [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="1"
                      >
                      <div class="absolute right-3 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1">
                        <button type="button" (click)="incrementGuests()" class="text-gray-400 hover:text-gray-600 transition-colors">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                          </svg>
                        </button>
                        <button type="button" (click)="decrementGuests()" class="text-gray-400 hover:text-gray-600 transition-colors">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="candidateName" class="label-with-icon">
                      <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="candidateName"
                      name="candidateName"
                      [(ngModel)]="candidateName"
                      required
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm font-montserrat"
                      placeholder="Your full name"
                    >
                  </div>
                </div>

                <div class="form-group">
                  <label for="comments" class="label-with-icon">
                    <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    Comments (Optional)
                  </label>
                  <textarea
                    id="comments"
                    name="comments"
                    [(ngModel)]="apiData.comments"
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm font-montserrat resize-none"
                    rows="2"
                    placeholder="Additional comments about your flight..."
                  ></textarea>
                </div>
              </div>

              <!-- Return Flight Details Section -->
              <div *ngIf="isRoundtrip" class="bg-gradient-to-r from-accent/5 to-primary/5 p-4 rounded-xl border border-accent/20 space-y-4">
                <h3 class="text-sm font-semibold text-accent flex items-center font-montserrat">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Return Flight Details
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="form-group">
                    <label for="returnFlightNumber" class="label-with-icon">
                      <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                      </svg>
                      Return Flight Number
                    </label>
                    <input
                      type="text"
                      id="returnFlightNumber"
                      name="returnFlightNumber"
                      [(ngModel)]="returnApiData.flightNumber"
                      required
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200 text-sm font-montserrat"
                      placeholder="e.g., AA456"
                    >
                  </div>
                  
                  <div class="form-group">
                    <label class="label-with-icon">
                      <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Return Arrival Time
                    </label>
                    <div class="relative">
                      <app-custom-time-picker
                        [(ngModel)]="returnArrivalTime"
                        [required]="isRoundtrip"
                        ariaLabel="Select return arrival time"
                        errorMessage="Please select a valid return arrival time"
                        name="returnArrivalTime"
                      ></app-custom-time-picker>
                    </div>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="returnComments" class="label-with-icon">
                    <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    Return Flight Comments (Optional)
                  </label>
                  <textarea
                    id="returnComments"
                    name="returnComments"
                    [(ngModel)]="returnApiData.comments"
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200 text-sm font-montserrat resize-none"
                    rows="2"
                    placeholder="Additional comments about your return flight..."
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                [disabled]="!flightForm.form.valid || isSubmitting || !isFromAirportValid || !isToAirportValid || !isAirlineValid || !isReturnDateValid"
                class="btn-primary w-full"
              >
                <span *ngIf="isSubmitting" class="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                <span *ngIf="!isSubmitting" class="flex items-center justify-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                  {{ isSubmitting ? 'Logging Flight...' : (isRoundtrip ? 'Log Roundtrip Flight' : 'Log Flight') }}
                </span>
              </button>
            </form>

            <!-- Success/Error Messages -->
            <div *ngIf="successMessage" class="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <p class="text-green-800 text-sm font-medium">{{ successMessage }}</p>
              </div>
            </div>
            
            <div *ngIf="errorMessage" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                </svg>
                <p class="text-red-800 text-sm font-medium">{{ errorMessage }}</p>
              </div>
            </div>
          </div>

          <!-- Flight History -->
          <div class="card h-full overflow-y-auto">
            <h2 class="text-xl font-bold text-gray-900 mb-4 font-montserrat">Flight History</h2>
            
            <div *ngIf="flights.length === 0" class="text-center py-12">
              <div class="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </div>
              <p class="text-gray-500 text-lg font-medium">No flights logged yet</p>
              <p class="text-sm text-gray-400 mt-2">Start by logging your first flight!</p>
            </div>

            <div *ngIf="flights.length > 0" class="space-y-3">
              <div
                *ngFor="let flight of flights"
                class="flight-card"
              >
                <div class="flex justify-between items-start mb-3">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                      </svg>
                    </div>
                    <div>
                      <div class="font-semibold text-gray-900 text-sm font-montserrat">{{ flight.from }} → {{ flight.to }}</div>
                      <div class="text-xs text-gray-500 font-montserrat">{{ flight.airline }}</div>
                    </div>
                  </div>
                  <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-montserrat">{{ formatDate(flight.date) }}</span>
                </div>
                
                <!-- Flight Details -->
                <div class="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div *ngIf="flight.flightNumber" class="flex items-center">
                    <span class="text-gray-500 mr-1">Flight:</span>
                    <span class="font-medium text-gray-700">{{ flight.flightNumber }}</span>
                  </div>
                  <div *ngIf="flight.arrivalTime" class="flex items-center">
                    <span class="text-gray-500 mr-1">Arrival:</span>
                    <span class="font-medium text-gray-700">{{ flight.arrivalTime }}</span>
                  </div>
                  <div *ngIf="flight.numOfGuests" class="flex items-center">
                    <span class="text-gray-500 mr-1">Guests:</span>
                    <span class="font-medium text-gray-700">{{ flight.numOfGuests }}</span>
                  </div>
                  <div *ngIf="flight.candidateName" class="flex items-center">
                    <span class="text-gray-500 mr-1">Name:</span>
                    <span class="font-medium text-gray-700">{{ flight.candidateName }}</span>
                  </div>
                </div>
                
                <!-- Comments -->
                <div *ngIf="flight.comments" class="mb-3">
                  <div class="text-xs text-gray-500 mb-1">Comments:</div>
                  <div class="text-xs text-gray-700 bg-gray-50 rounded-lg p-2 font-montserrat">{{ flight.comments }}</div>
                </div>
                
                <div class="text-xs text-gray-400 mt-2 font-montserrat">
                  Logged {{ formatDate(flight.createdAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  userName = '';
  userFirstName = '';
  userLastName = '';
  flights: Flight[] = [];
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  candidateName = '';
  isRoundtrip = false;
  airportValidationError = '';
  returnDateString = '';
  
  // New custom picker properties
  flightDate: Date | null = null;
  returnDate: Date | null = null;
  arrivalTime: Date | null = null;
  returnArrivalTime: Date | null = null;
  
  // Date constraints
  minDate = new Date();
  maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // One year from now
  
  get minReturnDate(): Date {
    return this.flightDate || new Date();
  }

  flightData = {
    from: '',
    to: '',
    airline: '',
    date: new Date()
  };

  apiData: FlightInfoPayload = {
    airline: '',
    arrivalDate: '',
    arrivalTime: '',
    flightNumber: '',
    numOfGuests: 1,
    comments: ''
  };

  returnApiData: FlightInfoPayload = {
    airline: '',
    arrivalDate: '',
    arrivalTime: '',
    flightNumber: '',
    numOfGuests: 1,
    comments: ''
  };

  // Dropdown options
  airports = US_AIRPORTS;
  airlines = US_AIRLINES;

  // Filtered airports for search
  filteredFromAirports: Airport[] = [];
  filteredToAirports: Airport[] = [];
  filteredAirlines: Airline[] = [];

  // Search terms
  fromSearchTerm = '';
  toSearchTerm = '';
  airlineSearchTerm = '';

  // Selected options
  selectedFromAirport: Airport | null = null;
  selectedToAirport: Airport | null = null;
  selectedAirline: Airline | null = null;

  // Dropdown visibility
  showFromDropdown = false;
  showToDropdown = false;
  showAirlineDropdown = false;

  // Validation flags
  isFromAirportValid = true;
  isToAirportValid = true;
  isAirlineValid = true;
  isReturnDateValid = true;

  // Form reset flag
  isResettingForm = false;

  flightDateString = '';
  returnDateValidationError = '';

  constructor(
    private authService: AuthService,
    private flightService: FlightService,
    private router: Router,
    private errorHandler: ErrorHandlerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Get current user info
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.displayName || user.email || 'User';
        // Extract first and last name from display name
        const displayName = user.displayName || '';
        const nameParts = displayName.split(' ');
        this.userFirstName = nameParts[0] || '';
        this.userLastName = nameParts.slice(1).join(' ') || '';
        
        // Prepopulate candidate name
        if (this.userFirstName && this.userLastName) {
          this.candidateName = `${this.userFirstName} ${this.userLastName}`;
        } else if (this.userFirstName) {
          this.candidateName = this.userFirstName;
        }
      }
    });

    // Subscribe to flights
    this.flightService.flights$.subscribe(flights => {
      this.flights = flights;
    });
  }

  async submitFlight() {
    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.airportValidationError = '';

    try {
      // Validate return date if roundtrip
      if (this.isRoundtrip) {
        this.validateReturnDate();
        if (!this.isReturnDateValid) {
          this.isSubmitting = false;
          return;
        }
      }

      // Validate airports
      if (this.selectedFromAirport && this.selectedToAirport) {
        if (this.selectedFromAirport.code === this.selectedToAirport.code) {
          this.airportValidationError = 'Departure and arrival airports cannot be the same.';
          this.isSubmitting = false;
          return;
        }
      } else if (this.flightData.from && this.flightData.to) {
        // Also check the display strings
        const fromCode = this.flightData.from.split(' - ')[0];
        const toCode = this.flightData.to.split(' - ')[0];
        if (fromCode === toCode) {
          this.airportValidationError = 'Departure and arrival airports cannot be the same.';
          this.isSubmitting = false;
          return;
        }
      }

      // Update flight data with current form values
      this.flightData.date = this.flightDate || new Date();
      this.flightData.airline = this.apiData.airline;

      // Prepare API payload
      const apiPayload: FlightInfoPayload = {
        ...this.apiData,
        airline: this.flightData.airline,
        arrivalDate: this.flightDate ? this.flightDate.toISOString().split('T')[0] : '',
        arrivalTime: this.arrivalTime ? this.arrivalTime.toTimeString().slice(0, 5) : ''
      };

      // Submit to API first
      await this.flightService.submitFlightInfo(apiPayload, this.candidateName);

      // Prepare complete flight data for Firestore
      const completeFlightData = {
        ...this.flightData,
        flightNumber: this.apiData.flightNumber,
        arrivalTime: this.apiData.arrivalTime,
        numOfGuests: this.apiData.numOfGuests,
        candidateName: this.candidateName,
        comments: this.apiData.comments
      };

      // Then save to Firestore
      await this.flightService.addFlight(completeFlightData);

      // Handle roundtrip
      if (this.isRoundtrip && this.returnDate) {
        // Create return flight data
        const returnFlightData = {
          ...this.flightData,
          from: this.flightData.to, // Swap airports
          to: this.flightData.from,
          date: this.returnDate,
          flightNumber: this.returnApiData.flightNumber,
          arrivalTime: this.returnArrivalTime ? this.returnArrivalTime.toTimeString().slice(0, 5) : '',
          numOfGuests: this.returnApiData.numOfGuests,
          candidateName: this.candidateName,
          comments: (this.returnApiData.comments || '') + ' (Return flight)'
        };

        // Create return API payload
        const returnApiPayload: FlightInfoPayload = {
          ...this.returnApiData,
          airline: this.flightData.airline,
          arrivalDate: this.returnDate.toISOString().split('T')[0],
          arrivalTime: this.returnArrivalTime ? this.returnArrivalTime.toTimeString().slice(0, 5) : '',
          comments: (this.returnApiData.comments || '') + ' (Return flight)'
        };

        // Submit return flight to API
        await this.flightService.submitFlightInfo(returnApiPayload, this.candidateName);

        // Save return flight to Firestore
        await this.flightService.addFlight(returnFlightData);
      }

      this.successMessage = this.isRoundtrip ? 'Roundtrip flight logged successfully!' : 'Flight logged successfully!';
      
      // Close all dropdowns immediately
      this.showFromDropdown = false;
      this.showToDropdown = false;
      this.showAirlineDropdown = false;
      
      // Reset form after a small delay to ensure dropdowns are closed
      setTimeout(() => {
        this.resetForm();
      }, 100);
    } catch (error: any) {
      this.errorHandler.logError(error, 'DashboardComponent.submitFlight');
      this.errorMessage = this.errorHandler.getGenericErrorMessage(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  resetForm() {
    // Set flag to prevent dropdown opening during reset
    this.isResettingForm = true;
    
    this.flightData = {
      from: '',
      to: '',
      airline: '',
      date: new Date()
    };

    this.apiData = {
      airline: '',
      arrivalDate: '',
      arrivalTime: '',
      flightNumber: '',
      numOfGuests: 1,
      comments: ''
    };

    this.returnApiData = {
      airline: '',
      arrivalDate: '',
      arrivalTime: '',
      flightNumber: '',
      numOfGuests: 1,
      comments: ''
    };

    this.flightDateString = '';
    this.returnDateString = '';
    this.flightDate = null;
    this.returnDate = null;
    this.arrivalTime = null;
    this.returnArrivalTime = null;
    this.isRoundtrip = false;
    this.airportValidationError = '';
    this.returnDateValidationError = '';
    
    // Reset validation flags
    this.isFromAirportValid = true;
    this.isToAirportValid = true;
    this.isAirlineValid = true;
    this.isReturnDateValid = true;
    
    // Clear dropdown selections
    this.clearFromAirport();
    this.clearToAirport();
    this.clearAirline();
    
    // Reset flag after a delay
    setTimeout(() => {
      this.isResettingForm = false;
    }, 200);
  }

  incrementGuests() {
    this.apiData.numOfGuests = (this.apiData.numOfGuests || 1) + 1;
  }

  decrementGuests() {
    if (this.apiData.numOfGuests > 1) {
      this.apiData.numOfGuests = this.apiData.numOfGuests - 1;
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  logout() {
    this.router.navigate(['/logout']);
  }

  // Handle roundtrip toggle
  onRoundtripToggle() {
    if (this.isRoundtrip) {
      // Copy departure data to return data
      this.returnApiData = {
        ...this.apiData,
        arrivalTime: '', // Reset arrival time for return
        comments: '' // Reset comments for return
      };
      // Validate return date when roundtrip is enabled
      this.validateReturnDate();
    } else {
      // Clear return date validation when roundtrip is disabled
      this.isReturnDateValid = true;
      this.returnDateValidationError = '';
    }
  }


  // Search and filter methods
  filterFromAirports() {
    this.showFromDropdown = true;
    this.filteredFromAirports = this.airports.filter(airport => {
      // Exclude the selected arrival airport from departure options
      if (this.selectedToAirport && airport.code === this.selectedToAirport.code) {
        return false;
      }
      return airport.name.toLowerCase().includes(this.fromSearchTerm.toLowerCase()) ||
             airport.city.toLowerCase().includes(this.fromSearchTerm.toLowerCase()) ||
             airport.code.toLowerCase().includes(this.fromSearchTerm.toLowerCase());
    });
  }

  filterToAirports() {
    this.showToDropdown = true;
    this.filteredToAirports = this.airports.filter(airport => {
      // Exclude the selected departure airport from arrival options
      if (this.selectedFromAirport && airport.code === this.selectedFromAirport.code) {
        return false;
      }
      return airport.name.toLowerCase().includes(this.toSearchTerm.toLowerCase()) ||
             airport.city.toLowerCase().includes(this.toSearchTerm.toLowerCase()) ||
             airport.code.toLowerCase().includes(this.toSearchTerm.toLowerCase());
    });
  }

  filterAirlines() {
    this.showAirlineDropdown = true;
    this.filteredAirlines = this.airlines.filter(airline =>
      airline.name.toLowerCase().includes(this.airlineSearchTerm.toLowerCase()) ||
      airline.code.toLowerCase().includes(this.airlineSearchTerm.toLowerCase())
    );
  }

  // Silent filter methods (don't open dropdowns)
  filterFromAirportsSilently() {
    this.filteredFromAirports = this.airports.filter(airport => {
      // Exclude the selected arrival airport from departure options
      if (this.selectedToAirport && airport.code === this.selectedToAirport.code) {
        return false;
      }
      return airport.name.toLowerCase().includes(this.fromSearchTerm.toLowerCase()) ||
             airport.city.toLowerCase().includes(this.fromSearchTerm.toLowerCase()) ||
             airport.code.toLowerCase().includes(this.fromSearchTerm.toLowerCase());
    });
  }

  filterToAirportsSilently() {
    this.filteredToAirports = this.airports.filter(airport => {
      // Exclude the selected departure airport from arrival options
      if (this.selectedFromAirport && airport.code === this.selectedFromAirport.code) {
        return false;
      }
      return airport.name.toLowerCase().includes(this.toSearchTerm.toLowerCase()) ||
             airport.city.toLowerCase().includes(this.toSearchTerm.toLowerCase()) ||
             airport.code.toLowerCase().includes(this.toSearchTerm.toLowerCase());
    });
  }

  selectFromAirport(airport: Airport) {
    this.selectedFromAirport = airport;
    this.flightData.from = `${airport.code} - ${airport.city}`;
    this.fromSearchTerm = `${airport.code} - ${airport.city}`;
    this.filteredFromAirports = [];
    this.showFromDropdown = false;
    this.airportValidationError = ''; // Clear validation error
    // Re-filter the arrival airports to exclude the selected departure
    this.filterToAirports();
  }

  selectToAirport(airport: Airport) {
    this.selectedToAirport = airport;
    this.flightData.to = `${airport.code} - ${airport.city}`;
    this.toSearchTerm = `${airport.code} - ${airport.city}`;
    this.filteredToAirports = [];
    this.showToDropdown = false;
    this.airportValidationError = ''; // Clear validation error
    // Re-filter the departure airports to exclude the selected arrival
    this.filterFromAirports();
  }

  selectAirline(airline: Airline) {
    this.selectedAirline = airline;
    this.flightData.airline = airline.name;
    this.apiData.airline = airline.name;
    this.airlineSearchTerm = airline.name;
    this.filteredAirlines = [];
    this.showAirlineDropdown = false;
  }

  clearFromAirport() {
    this.selectedFromAirport = null;
    this.flightData.from = '';
    this.fromSearchTerm = '';
    this.filteredFromAirports = this.airports;
    this.showFromDropdown = false;
    // Re-filter the arrival airports since departure is cleared (without opening dropdown)
    this.filterToAirportsSilently();
  }

  clearToAirport() {
    this.selectedToAirport = null;
    this.flightData.to = '';
    this.toSearchTerm = '';
    this.filteredToAirports = this.airports;
    this.showToDropdown = false;
    // Re-filter the departure airports since arrival is cleared (without opening dropdown)
    this.filterFromAirportsSilently();
  }

  clearAirline() {
    this.selectedAirline = null;
    this.flightData.airline = '';
    this.apiData.airline = '';
    this.airlineSearchTerm = '';
    this.filteredAirlines = this.airlines;
    this.showAirlineDropdown = false;
  }

  // Input change handlers with validation
  onFromInputChange(event: any) {
    const value = event.target.value;
    
    // If user is trying to edit a selected airport, prevent it
    if (this.selectedFromAirport && value !== `${this.selectedFromAirport.code} - ${this.selectedFromAirport.city}`) {
      // Reset to selected value
      this.fromSearchTerm = `${this.selectedFromAirport.code} - ${this.selectedFromAirport.city}`;
      return;
    }
    
    this.fromSearchTerm = value;
    this.filterFromAirports();
    this.validateFromAirport();
  }

  onToInputChange(event: any) {
    const value = event.target.value;
    
    // If user is trying to edit a selected airport, prevent it
    if (this.selectedToAirport && value !== `${this.selectedToAirport.code} - ${this.selectedToAirport.city}`) {
      // Reset to selected value
      this.toSearchTerm = `${this.selectedToAirport.code} - ${this.selectedToAirport.city}`;
      return;
    }
    
    this.toSearchTerm = value;
    this.filterToAirports();
    this.validateToAirport();
  }

  onAirlineInputChange(event: any) {
    const value = event.target.value;
    
    // If user is trying to edit a selected airline, prevent it
    if (this.selectedAirline && value !== this.selectedAirline.name) {
      // Reset to selected value
      this.airlineSearchTerm = this.selectedAirline.name;
      return;
    }
    
    this.airlineSearchTerm = value;
    this.filterAirlines();
    this.validateAirline();
  }

  // Focus handlers
  onFromInputFocus() {
    // Don't open dropdown during form reset
    if (this.isResettingForm) {
      return;
    }
    
    // Only show dropdown if no airport is selected
    if (!this.selectedFromAirport) {
      this.filterFromAirports();
    } else {
      this.showFromDropdown = false;
    }
  }

  onToInputFocus() {
    // Don't open dropdown during form reset
    if (this.isResettingForm) {
      return;
    }
    
    // Only show dropdown if no airport is selected
    if (!this.selectedToAirport) {
      this.filterToAirports();
    } else {
      this.showToDropdown = false;
    }
  }

  onAirlineInputFocus() {
    // Don't open dropdown during form reset
    if (this.isResettingForm) {
      return;
    }
    
    // Only show dropdown if no airline is selected
    if (!this.selectedAirline) {
      this.filterAirlines();
    } else {
      this.showAirlineDropdown = false;
    }
  }

  // Blur handlers for dropdowns
  onFromInputBlur() {
    setTimeout(() => {
      this.showFromDropdown = false;
      this.validateFromAirport();
    }, 200); // Small delay to allow click events to fire
  }

  onToInputBlur() {
    setTimeout(() => {
      this.showToDropdown = false;
      this.validateToAirport();
    }, 200); // Small delay to allow click events to fire
  }

  onAirlineInputBlur() {
    setTimeout(() => {
      this.showAirlineDropdown = false;
      this.validateAirline();
    }, 200); // Small delay to allow click events to fire
  }

  // Validation methods
  validateFromAirport() {
    if (this.selectedFromAirport) {
      this.isFromAirportValid = true;
      return;
    }
    
    // Check if the current input matches any airport
    const isValid = this.airports.some(airport => 
      `${airport.code} - ${airport.city}`.toLowerCase() === this.fromSearchTerm.toLowerCase() ||
      airport.name.toLowerCase() === this.fromSearchTerm.toLowerCase()
    );
    
    this.isFromAirportValid = isValid || this.fromSearchTerm === '';
  }

  validateToAirport() {
    if (this.selectedToAirport) {
      this.isToAirportValid = true;
      return;
    }
    
    // Check if the current input matches any airport
    const isValid = this.airports.some(airport => 
      `${airport.code} - ${airport.city}`.toLowerCase() === this.toSearchTerm.toLowerCase() ||
      airport.name.toLowerCase() === this.toSearchTerm.toLowerCase()
    );
    
    this.isToAirportValid = isValid || this.toSearchTerm === '';
  }

  validateAirline() {
    if (this.selectedAirline) {
      this.isAirlineValid = true;
      return;
    }
    
    // Check if the current input matches any airline
    const isValid = this.airlines.some(airline => 
      airline.name.toLowerCase() === this.airlineSearchTerm.toLowerCase() ||
      airline.code.toLowerCase() === this.airlineSearchTerm.toLowerCase()
    );
    
    this.isAirlineValid = isValid || this.airlineSearchTerm === '';
  }

  // Date change handlers
  onFlightDateChange(date: Date | null) {
    this.flightDate = date;
    // Validate return date when flight date changes
    if (this.isRoundtrip) {
      this.validateReturnDate();
    }
  }

  onReturnDateChange(date: Date | null) {
    this.returnDate = date;
    // Validate return date when return date changes
    if (this.isRoundtrip) {
      this.validateReturnDate();
    }
  }

  validateReturnDate() {
    if (!this.isRoundtrip || !this.flightDate || !this.returnDate) {
      this.isReturnDateValid = true;
      this.returnDateValidationError = '';
      return;
    }

    // Compare only the date parts, not the time
    const flightDateOnly = new Date(this.flightDate.getFullYear(), this.flightDate.getMonth(), this.flightDate.getDate());
    const returnDateOnly = new Date(this.returnDate.getFullYear(), this.returnDate.getMonth(), this.returnDate.getDate());
    
    if (returnDateOnly <= flightDateOnly) {
      this.isReturnDateValid = false;
      this.returnDateValidationError = 'Return date must be after departure date';
    } else {
      this.isReturnDateValid = true;
      this.returnDateValidationError = '';
    }
    
    // Trigger change detection to ensure UI updates
    this.cdr.detectChanges();
  }
}
