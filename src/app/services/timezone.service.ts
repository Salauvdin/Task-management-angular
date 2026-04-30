import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimezoneService {
  private timezoneSubject: BehaviorSubject<string>;
  public timezone$: Observable<string>;

  private readonly timezones = [
    { value: 'IST', label: 'Indian Standard Time (IST)', offset: '+5:30', timeZone: 'Asia/Kolkata' },
    // { value: 'EST', label: 'Eastern Standard Time (EST)', offset: '-5:00', timeZone: 'America/New_York' },
    { value: 'PST', label: 'Pacific Standard Time (PST)', offset: '-8:00', timeZone: 'America/Los_Angeles' },
    // { value: 'CST', label: 'Central Standard Time (CST)', offset: '-6:00', timeZone: 'America/Chicago' },
    // { value: 'UTC', label: 'Coordinated Universal Time (UTC)', offset: '+0:00', timeZone: 'UTC' },
    // { value: 'GMT', label: 'Greenwich Mean Time (GMT)', offset: '+0:00', timeZone: 'Europe/London' },
    // { value: 'CET', label: 'Central European Time (CET)', offset: '+1:00', timeZone: 'Europe/Paris' },
    // { value: 'JST', label: 'Japan Standard Time (JST)', offset: '+9:00', timeZone: 'Asia/Tokyo' },
    { value: 'AEST', label: 'Australian Eastern Standard Time (AEST)', offset: '+10:00', timeZone: 'Australia/Sydney' }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    const stored = isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined'
      ? localStorage.getItem('userTimezone')
      : null;
    this.timezoneSubject = new BehaviorSubject<string>(stored || 'IST');
    this.timezone$ = this.timezoneSubject.asObservable();
  }

  // ----- Core getters / setters -----
  getUserTimezone(): string {
    return this.timezoneSubject.value;
  }

  setUserTimezone(timezone: string): void {
    if (isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined') {
      localStorage.setItem('userTimezone', timezone);
    }
    this.timezoneSubject.next(timezone);
  }

  // ----- Helper utilities -----
  private findTimezone(tz?: string) {
    return this.timezones.find(t => t.value === (tz || this.getUserTimezone()));
  }

  getTimezoneOffset(tz?: string): string {
    const found = this.findTimezone(tz);
    return found ? found.offset : '+5:30';
  }

  getTimezoneLabel(tz?: string): string {
    const found = this.findTimezone(tz);
    return found ? found.label : 'Indian Standard Time (IST)';
  }

  getTimezoneString(tz?: string): string {
    const found = this.findTimezone(tz);
    return found ? found.timeZone : 'Asia/Kolkata';
  }

  getTimezoneOptions() {
    return this.timezones;
  }

  // ----- Formatting methods -----
  formatDate(date: string | Date, tz?: string): string {
    const timezone = tz || this.getUserTimezone();
    const tzString = this.getTimezoneString(timezone);
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    try {
      const formatted = new Intl.DateTimeFormat('en-US', {
        timeZone: tzString,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(d);
      return formatted.replace(', ', ' • ');
    } catch (e) {
      console.error('Error formatting date:', e);
      return d.toLocaleString();
    }
  }

  formatDateTime(date: string | Date, tz?: string): string {
    return this.formatDate(date, tz);
  }

  formatDateOnly(date: string | Date, tz?: string): string {
    const timezone = tz || this.getUserTimezone();
    const tzString = this.getTimezoneString(timezone);
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: tzString,
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(d);
    } catch (e) {
      console.error('Error formatting date only:', e);
      return d.toLocaleDateString();
    }
  }

  formatTimeOnly(date: string | Date, tz?: string): string {
    const timezone = tz || this.getUserTimezone();
    const tzString = this.getTimezoneString(timezone);
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: tzString,
        hour: '2-digit',
        minute: '2-digit'
      }).format(d);
    } catch (e) {
      console.error('Error formatting time only:', e);
      return d.toLocaleTimeString();
    }
  }

  getRelativeTime(date: string | Date, tz?: string): string {
    const timezone = tz || this.getUserTimezone();
    const tzString = this.getTimezoneString(timezone);
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    try {
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return this.formatDate(d, timezone);
    } catch (e) {
      console.error('Error calculating relative time:', e);
      return this.formatDate(d, timezone);
    }
  }

  convertToTimezone(date: string | Date, targetTz: string): string {
    const tzString = this.getTimezoneString(targetTz);
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: tzString,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(d);
    } catch (e) {
      console.error('Error converting timezone:', e);
      return d.toLocaleString();
    }
  }
}
