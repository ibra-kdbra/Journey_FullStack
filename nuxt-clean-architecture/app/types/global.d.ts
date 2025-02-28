// ========= Email ============= //

type Email = string

// ========= Result ============= //
type FailureMessage = string

type Result<T> = Success<T> | Failure

type Success<T> = {
  success: true
  value: T
}

type Failure = {
  success: false
  error: FailureMessage | Error
}
