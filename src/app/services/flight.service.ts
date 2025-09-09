import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, orderBy, onSnapshot, Timestamp } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environment';

export interface Flight {
  id?: string;
  userId: string;
  from: string;
  to: string;
  date: Date;
  airline: string;
  createdAt: Date;
  // API Challenge data
  flightNumber?: string;
  arrivalTime?: string;
  numOfGuests?: number;
  candidateName?: string;
  comments?: string;
}

export interface FlightInfoPayload {
  airline: string;
  arrivalDate: string;
  arrivalTime: string;
  flightNumber: string;
  numOfGuests: number;
  comments?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private flightsSubject = new BehaviorSubject<Flight[]>([]);
  public flights$ = this.flightsSubject.asObservable();

  private readonly API_URL = environment.api.url;
  private readonly API_TOKEN = environment.api.token;

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.initializeFlightsListener();
  }

  private initializeFlightsListener(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.subscribeToUserFlights(user.uid);
      } else {
        this.flightsSubject.next([]);
      }
    });
  }

  private subscribeToUserFlights(userId: string): void {
    const flightsRef = collection(this.firestore, 'flights');
    const q = query(
      flightsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    onSnapshot(q, (snapshot) => {
      const flights: Flight[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        flights.push({
          id: doc.id,
          userId: data['userId'],
          from: data['from'],
          to: data['to'],
          date: data['date'].toDate(),
          airline: data['airline'],
          createdAt: data['createdAt'].toDate(),
          // API Challenge data
          flightNumber: data['flightNumber'] || '',
          arrivalTime: data['arrivalTime'] || '',
          numOfGuests: data['numOfGuests'] || 1,
          candidateName: data['candidateName'] || '',
          comments: data['comments'] || ''
        });
      });
      this.flightsSubject.next(flights);
    });
  }

  async addFlight(flight: Omit<Flight, 'id' | 'userId' | 'createdAt'>): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const flightData = {
      ...flight,
      userId: user.uid,
      date: Timestamp.fromDate(flight.date),
      createdAt: Timestamp.fromDate(new Date())
    };

    const flightsRef = collection(this.firestore, 'flights');
    await addDoc(flightsRef, flightData);
  }

  async submitFlightInfo(payload: FlightInfoPayload, candidateName: string): Promise<any> {
    const headers = new HttpHeaders({
      'token': this.API_TOKEN,
      'candidate': candidateName,
      'Content-Type': 'application/json'
    });

    return this.http.post(this.API_URL, payload, { headers }).toPromise();
  }
}
