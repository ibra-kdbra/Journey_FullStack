/**
 * Time is an external dependency like any other. Injecting it is what lets the
 * overdue rules be tested without waiting fourteen days.
 */
export interface Clock {
  now(): Date
}
