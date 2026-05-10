# Lesson 16: Error Handling in Rust

## Learning Objectives

- Clearly understand Rust's error handling philosophy.
- Distinguish between and correctly use different error handling methods.
- Apply effective error handling techniques in real-world applications.
- Create and manage custom error types.
- Master the use of popular error handling support libraries.

## 1. Introduction to Error Handling in Rust

### 1.1 The Importance of Error Handling

- Rust is designed with a "fail fast, fail early" philosophy - detecting errors as soon as possible.
- Error handling is an integral part of safe programming.
- Rust requires developers to handle errors explicitly (no hidden errors).

### 1.2 Classifying Errors in Rust

- **Unrecoverable errors**: Critical errors where the program cannot recover and must stop.
- **Recoverable errors**: Errors that can be handled, allowing the program to continue execution.

### 1.3 Comparison with Other Languages

- Does not use exceptions like Java, Python, or C++.
- Does not use return codes like C.
- Leverages the type system to enforce error handling at compile time.

## 2. Panic! and Unrecoverable Errors

### 2.1 Understanding panic

- `panic!` is the mechanism for handling critical, unrecoverable errors.
- When a `panic!` occurs, the program will:
  - Print an error message.
  - Perform unwinding (default) or abort.
  - Stop the current thread or the entire program.

```rust
fn main() {
    println!("Before panic");
    panic!("This is a critical error!");
    println!("After panic - this line will never execute");
}
```

### 2.2 When to use panic

- Critical errors that cannot be recovered.
- Invalid states where the program cannot continue safely.
- During development to detect bugs early.
- "Impossible" situations in the code.

### 2.3 Cases where panic! occurs automatically

- Array access with an out-of-bounds index.
- Division by zero.
- Unwrapping an Option::None or Result::Err.
- Failed assertions.

```rust
fn demo_auto_panic() {
    // 1. Index out of bounds
    let v = vec![1, 2, 3];
    let value = v[99]; // Panic!

    // 2. Unwrapping None
    let x: Option<i32> = None;
    let value = x.unwrap(); // Panic!

    // 3. Division by zero
    let result = 10 / 0; // Panic!
}
```

### 2.4 Configuring Panic Behavior

- Default: unwinding (cleans up memory and then exits).
- Abort: terminates immediately (smaller binary size).
- Configure in Cargo.toml:

```toml
[profile.release]
panic = "abort"
```

### 2.5 Backtrace

- Displays a stack trace when a panic occurs.
- How to enable: `RUST_BACKTRACE=1 cargo run`.
- How to read a backtrace for effective debugging.

## 3. Result<T, E> and Recoverable Errors

### 3.1 The Result enum

- Definition:

```rust
enum Result<T, E> {
    Ok(T),   // Success with value T
    Err(E),  // Failure with error E
}
```

- Used for functions that can fail but are not critical enough to panic.

### 3.2 How to use Result

```rust
fn read_file(path: &str) -> Result<String, std::io::Error> {
    std::fs::read_to_string(path)
}

fn main() {
    let result = read_file("config.txt");

    match result {
        Ok(content) => println!("File read successfully: {}", content),
        Err(error) => println!("Could not read file: {}", error),
    }
}
```

### 3.3 Useful Result methods

- `unwrap()`: Returns the Ok value or panics if it's an Err.
- `expect(msg)`: Like unwrap but with a custom message.
- `unwrap_or(default)`: Returns the Ok value or a default value.
- `unwrap_or_else(f)`: Returns the Ok value or the result of function f.
- `is_ok()`, `is_err()`: Check the result.

```rust
// Ways to handle Result
fn demo_result_methods() {
    let file_result = std::fs::File::open("config.txt");

    // 1. unwrap - avoid using in production
    let file1 = std::fs::File::open("config.txt").unwrap();

    // 2. expect - better than unwrap for debugging
    let file2 = std::fs::File::open("config.txt")
        .expect("Could not open config.txt");

    // 3. unwrap_or_else - flexible error handling
    let file3 = std::fs::File::open("config.txt").unwrap_or_else(|error| {
        println!("Encountered error: {}", error);
        // Fallback, e.g., create a new file
        std::fs::File::create("config.txt").unwrap()
    });

    // 4. match - the most complete and explicit way
    let file4 = match std::fs::File::open("config.txt") {
        Ok(file) => file,
        Err(error) => {
            println!("Encountered error opening file: {}", error);
            // Handle specific errors
            match error.kind() {
                std::io::ErrorKind::NotFound => {
                    println!("File does not exist, creating new file");
                    std::fs::File::create("config.txt").unwrap()
                },
                std::io::ErrorKind::PermissionDenied => {
                    panic!("Permission denied to access file");
                },
                _ => {
                    panic!("Unknown error: {}", error);
                }
            }
        }
    };
}
```

### 3.4 if let and while let with Result

```rust
fn demo_if_let() {
    let result = std::fs::read_to_string("config.txt");

    if let Ok(content) = result {
        println!("File content: {}", content);
    } else {
        println!("Could not read file");
    }
}
```

## 4. Propagating Errors with the ? operator

### 4.1 Introduction to the ? operator

- Concise syntax to pass errors to the calling function.
- Replaces verbose pattern matching.
- Only usable in functions returning Result or Option.

### 4.2 How it works

```rust
fn read_config() -> Result<String, std::io::Error> {
    let mut content = String::new();

    // Without using ?
    let mut file = match std::fs::File::open("config.txt") {
        Ok(file) => file,
        Err(e) => return Err(e),
    };

    // Using ?
    let mut file = std::fs::File::open("config.txt")?;
    file.read_to_string(&mut content)?;

    Ok(content)
}
```

### 4.3 Chaining ? operators

```rust
fn read_username_from_file() -> Result<String, std::io::Error> {
    let content = std::fs::read_to_string("config.txt")?;
    let username = content.lines().next().ok_or(std::io::Error::new(
        std::io::ErrorKind::InvalidData,
        "Config file does not contain a username"
    ))?;

    Ok(username.to_string())
}
```

### 4.4 Error type conversion with ?

- The ? operator automatically converts errors via the From trait.
- Allows combining different error types.

```rust
fn process_data() -> Result<(), Box<dyn std::error::Error>> {
    let data = std::fs::read_to_string("data.txt")?; // std::io::Error
    let number: u32 = data.trim().parse()?;          // std::num::ParseIntError

    Ok(())
}
```

## 5. Custom Error Types

### 5.1 Why use custom error types

- Provide specific error information for the application.
- Group multiple error types together.
- Improve library APIs.
- Enable more flexible error handling.

### 5.2 Creating error types with enums

```rust
#[derive(Debug)]
enum AppError {
    IoError(std::io::Error),
    ParseError(std::num::ParseIntError),
    ConfigError(String),
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            AppError::IoError(e) => write!(f, "IO Error: {}", e),
            AppError::ParseError(e) => write!(f, "Number parse error: {}", e),
            AppError::ConfigError(msg) => write!(f, "Configuration error: {}", msg),
        }
    }
}

impl std::error::Error for AppError {}

// Conversion from IoError to AppError
impl From<std::io::Error> for AppError {
    fn from(error: std::io::Error) -> Self {
        AppError::IoError(error)
    }
}

// Conversion from ParseIntError to AppError
impl From<std::num::ParseIntError> for AppError {
    fn from(error: std::num::ParseIntError) -> Self {
        AppError::ParseError(error)
    }
}
```

### 5.3 Using custom error types

```rust
fn read_config() -> Result<u32, AppError> {
    let content = std::fs::read_to_string("config.txt")?; // Auto-converts IoError to AppError

    if content.is_empty() {
        return Err(AppError::ConfigError("Config file is empty".to_string()));
    }

    let number = content.trim().parse()?; // Auto-converts ParseIntError to AppError

    Ok(number)
}
```

## 6. The thiserror and anyhow libraries

### 6.1 thiserror

- Reduces boilerplate code when creating custom error types.
- Uses derive macros to automatically implement required traits.
- Usage:

```rust
use thiserror::Error;

#[derive(Error, Debug)]
enum AppError {
    #[error("IO Error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Number parse error: {0}")]
    ParseError(#[from] std::num::ParseIntError),

    #[error("Configuration error: {0}")]
    ConfigError(String),

    #[error("Invalid input at line {line}: {message}")]
    InvalidInput { line: usize, message: String },
}
```

### 6.2 anyhow

- Designed for application code (not libraries).
- Simplifies handling multiple error types.
- Focuses on convenience rather than detailed error types.

```rust
use anyhow::{Context, Result, anyhow};

fn read_config() -> Result<u32> {
    let content = std::fs::read_to_string("config.txt")
        .context("Could not read configuration file")?;

    if content.is_empty() {
        return Err(anyhow!("Configuration file is empty"));
    }

    let number = content.trim().parse()
        .context("Could not convert configuration to a number")?;

    Ok(number)
}
```

### 6.3 When to use thiserror vs anyhow

- **thiserror**:

  - When writing a library.
  - When you need precise control over error types.
  - When the API needs to be explicit about possible errors.

- **anyhow**:
  - When writing an application.
  - For simple error handling.
  - When you don't need to distinguish between specific error types.

## 7. Real-world Example: Building a File Processing Application

### 7.1 Designing the Error Structure

```rust
use thiserror::Error;

#[derive(Error, Debug)]
enum FileProcessError {
    #[error("File read error: {0}")]
    ReadError(#[from] std::io::Error),

    #[error("Format error at line {line}: {message}")]
    FormatError { line: usize, message: String },

    #[error("Number parse error: {0}")]
    ParseError(#[from] std::num::ParseIntError),

    #[error("File contains no data")]
    EmptyFile,
}

type Result<T> = std::result::Result<T, FileProcessError>;
```

### 7.2 Reading and Processing a File

```rust
fn read_numbers_from_file(path: &str) -> Result<Vec<i32>> {
    let content = std::fs::read_to_string(path)?;

    if content.trim().is_empty() {
        return Err(FileProcessError::EmptyFile);
    }

    let mut results = Vec::new();

    for (line_number, line) in content.lines().enumerate() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }

        match line.parse() {
            Ok(num) => results.push(num),
            Err(e) => {
                return Err(FileProcessError::FormatError {
                    line: line_number + 1,
                    message: format!("Could not convert '{}' to a number", line),
                });
            }
        }
    }

    Ok(results)
}
```

### 7.3 Usage in main

```rust
fn main() {
    let results = read_numbers_from_file("data.txt");

    match results {
        Ok(numbers) => {
            println!("Successfully read {} numbers from file", numbers.len());
            println!("Sum: {}", numbers.iter().sum::<i32>());
        },
        Err(error) => {
            eprintln!("File processing error: {}", error);

            // Detailed handling for each error type
            match &error {
                FileProcessError::EmptyFile => {
                    eprintln!("Empty file, please add data");
                },
                FileProcessError::FormatError { line, message } => {
                    eprintln!("Format error at line {}: {}", line, message);
                    eprintln!("Please correct the file and try again");
                },
                FileProcessError::ReadError(e) => {
                    if e.kind() == std::io::ErrorKind::NotFound {
                        eprintln!("File not found, creating a new file...");
                        // Create new file
                    } else {
                        eprintln!("Could not read file. Please check permissions");
                    }
                },
                FileProcessError::ParseError(_) => {
                    eprintln!("Data conversion error");
                }
            }

            std::process::exit(1);
        }
    }
}
```

## 8. Practice: Improving Error Messages in an Application

### 8.1 Exercise Requirements

- Build an application to read a key-value configuration file.
- Handle all possible error types.
- Display user-friendly error messages.
- Log detailed errors for debugging.

### 8.2 Program Structure

```rust
use std::collections::HashMap;
use std::path::Path;
use thiserror::Error;

#[derive(Error, Debug)]
enum ConfigError {
    #[error("File read error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Format error at line {line}: {message}")]
    FormatError { line: usize, message: String },

    #[error("Missing required field: {0}")]
    MissingField(String),

    #[error("Invalid value for {field}: {message}")]
    InvalidValue { field: String, message: String },
}

type Result<T> = std::result::Result<T, ConfigError>;

struct Config {
    settings: HashMap<String, String>,
}

impl Config {
    fn load(path: impl AsRef<Path>) -> Result<Self> {
        let content = std::fs::read_to_string(path)?;
        let mut settings = HashMap::new();

        for (line_num, line) in content.lines().enumerate() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }

            if let Some(pos) = line.find('=') {
                let key = line[..pos].trim().to_string();
                let value = line[pos+1..].trim().to_string();
                settings.insert(key, value);
            } else {
                return Err(ConfigError::FormatError {
                    line: line_num + 1,
                    message: format!("Missing '=' character in line: '{}'", line),
                });
            }
        }

        // Check for required fields
        let required_fields = ["database_url", "port"];
        for field in required_fields {
            if !settings.contains_key(field) {
                return Err(ConfigError::MissingField(field.to_string()));
            }
        }

        // Validate values
        if let Some(port) = settings.get("port") {
            if let Err(_) = port.parse::<u16>() {
                return Err(ConfigError::InvalidValue {
                    field: "port".to_string(),
                    message: "Must be a number between 1-65535".to_string()
                });
            }
        }

        Ok(Config { settings })
    }

    fn get(&self, key: &str) -> Option<&String> {
        self.settings.get(key)
    }

    fn get_or<'a>(&'a self, key: &str, default: &'a str) -> &'a str {
        self.settings.get(key).map(|s| s.as_str()).unwrap_or(default)
    }
}

fn main() {
    match Config::load("config.ini") {
        Ok(config) => {
            println!("Configuration loaded successfully!");
            println!("Database URL: {}", config.get("database_url").unwrap());
            println!("Port: {}", config.get("port").unwrap());
            println!("Timeout: {}", config.get_or("timeout", "30"));
        },
        Err(err) => {
            match &err {
                ConfigError::IoError(io_err) => {
                    match io_err.kind() {
                        std::io::ErrorKind::NotFound => {
                            eprintln!("Configuration file not found!");
                            eprintln!("Create a config.ini file with the following content:");
                            eprintln!("database_url = postgres://user:pass@localhost/dbname");
                            eprintln!("port = 8080");
                        },
                        std::io::ErrorKind::PermissionDenied => {
                            eprintln!("Permission denied to read configuration file!");
                        },
                        _ => {
                            eprintln!("File read error: {}", io_err);
                        }
                    }
                },
                ConfigError::FormatError { line, message } => {
                    eprintln!("Format error at line {}: {}", line, message);
                    eprintln!("Each line must follow the format: key = value");
                },
                ConfigError::MissingField(field) => {
                    eprintln!("Missing required configuration field: {}", field);
                    eprintln!("Please add this field to the configuration file");
                },
                ConfigError::InvalidValue { field, message } => {
                    eprintln!("Invalid value for field {}: {}", field, message);
                }
            }

            // Log details
            eprintln!("\nError details for debugging:");
            eprintln!("{:?}", err);

            std::process::exit(1);
        }
    }
}
```

## 9. Advanced Strategies and Best Practices

### 9.1 Using Context

- Add context to errors for easier debugging.
- Example with anyhow:

```rust
use anyhow::{Context, Result};

fn read_config() -> Result<Config> {
    let content = std::fs::read_to_string("config.ini")
        .context("Could not read configuration file")?;

    // ...
}
```

### 9.2 Appropriate Error Conversion

- Convert low-level errors into context-appropriate errors.
- Do not expose implementation details via errors.

```rust
fn validate_input(input: &str) -> Result<(), AppError> {
    if input.parse::<i32>().is_err() {
        return Err(AppError::ValidationError("Input must be a number".to_string()));
    }

    Ok(())
}
```

### 9.3 Logging errors

- Combine error handling with logging.
- Use libraries like `log` or `tracing`.

```rust
use log::{error, warn, info};

fn process_file(path: &str) -> Result<(), AppError> {
    match std::fs::read_to_string(path) {
        Ok(content) => {
            info!("Successfully read file {}", path);
            // Process content
            Ok(())
        },
        Err(e) => {
            error!("Could not read file {}: {}", path, e);
            Err(AppError::from(e))
        }
    }
}
```

### 9.4 Testing error handling

- Check error cases in unit tests.
- Ensure error handling code works correctly.

```rust
#[test]
fn test_missing_file() {
    let result = read_file("non_existent.txt");
    assert!(result.is_err());

    if let Err(e) = result {
        match e {
            AppError::IoError(io_error) => {
                assert_eq!(io_error.kind(), std::io::ErrorKind::NotFound);
            },
            _ => panic!("Incorrect error type"),
        }
    }
}
```

## 10. Summary

### 10.1 Error Handling Principles in Rust

- Explicit and mandatory error handling.
- Clear distinction between recoverable and unrecoverable errors.
- Leveraging the type system for safe error handling.

### 10.2 Knowledge Recap

- `panic!` for unrecoverable errors.
- `Result<T, E>` for recoverable errors.
- The `?` operator for error propagation.
- Custom error types for explicit APIs.
- The thiserror and anyhow libraries for simplification.

### 10.3 Next Steps

- Learn more about error handling in async/await.
- Study error handling patterns in major libraries.
- Build an error handling framework for your own projects.

## Homework

1. Write a program that reads a CSV file, processes the data, and writes the results to a new file with full error handling.
2. Improve the configuration application to support:
   - Multiple configuration sources (files, environment variables).
   - Encryption/decryption of sensitive values.
   - Automatic generation of a sample configuration file if it doesn't exist.
3. Create a custom error handling library for a specific domain (e.g., web API, data processing, database access).

## 11. Real-world Example: File Processing Application

Here is a complete example of a file processing application with professional error handling:

```rust
use std::fs::File;
use std::io::{self, BufRead, BufReader, Write};
use std::path::Path;
use thiserror::Error;

// Define error types
#[derive(Error, Debug)]
enum AppError {
    #[error("File read error: {0}")]
    IoError(#[from] io::Error),

    #[error("Number parse error at line {line}: {source}")]
    ParseError {
        line: usize,
        #[source] source: std::num::ParseIntError
    },

    #[error("Input file is empty")]
    EmptyFile,

    #[error("No numbers found in file")]
    NoNumbers,
}

// Type alias for cleaner code
type Result<T> = std::result::Result<T, AppError>;

// Function to read numbers from a file, calculate the sum, and write to a new file
fn process_numbers(input_path: &str, output_path: &str) -> Result<i64> {
    println!("Reading numbers from file: {}", input_path);

    // Open input file
    let file = File::open(input_path)?;
    let reader = BufReader::new(file);
    let lines: Vec<String> = reader.lines().collect::<io::Result<_>>()?;

    if lines.is_empty() {
        return Err(AppError::EmptyFile);
    }

    // Read and parse numbers
    let mut numbers = Vec::new();

    for (idx, line) in lines.iter().enumerate() {
        let line = line.trim();

        // Skip empty lines and comments
        if line.is_empty() || line.starts_with('#') {
            continue;
        }

        // Parse number
        match line.parse::<i64>() {
            Ok(num) => numbers.push(num),
            Err(err) => {
                return Err(AppError::ParseError {
                    line: idx + 1,
                    source: err,
                });
            }
        }
    }

    if numbers.is_empty() {
        return Err(AppError::NoNumbers);
    }

    // Calculate total
    let sum: i64 = numbers.iter().sum();
    let average: f64 = sum as f64 / numbers.len() as f64;

    // Write results to a new file
    let mut output = File::create(output_path)?;
    writeln!(output, "Count: {}", numbers.len())?;
    writeln!(output, "Sum: {}", sum)?;
    writeln!(output, "Average: {:.2}", average)?;
    writeln!(output, "Max: {}", numbers.iter().max().unwrap())?;
    writeln!(output, "Min: {}", numbers.iter().min().unwrap())?;

    println!("Results written to file: {}", output_path);

    Ok(sum)
}

fn main() {
    // File paths
    let input_file = "numbers.txt";
    let output_file = "results.txt";

    // Handle results from process_numbers
    match process_numbers(input_file, output_file) {
        Ok(sum) => {
            println!("✅ Processing successful!");
            println!("Total sum: {}", sum);
        },
        Err(error) => {
            // Handle each error type with user-friendly messages
            match &error {
                AppError::IoError(io_error) => {
                    match io_error.kind() {
                        io::ErrorKind::NotFound => {
                            eprintln!("❌ File not found: {}", input_file);
                            eprintln!("Please create a file with a list of numbers, one per line.");

                            // Create sample file if it doesn't exist
                            if !Path::new(input_file).exists() {
                                println!("Creating sample file...");
                                let mut sample = File::create(input_file).unwrap();
                                writeln!(sample, "# List of numbers (one per line)").unwrap();
                                writeln!(sample, "42").unwrap();
                                writeln!(sample, "17").unwrap();
                                writeln!(sample, "123").unwrap();
                                println!("Sample file created: {}", input_file);
                            }
                        },
                        io::ErrorKind::PermissionDenied => {
                            eprintln!("❌ Permission denied to access file: {}", input_file);
                            eprintln!("Please check file permissions and try again.");
                        },
                        _ => {
                            eprintln!("❌ Error reading/writing file: {}", io_error);
                        }
                    }
                },
                AppError::ParseError { line, source } => {
                    eprintln!("❌ Error at line {}: could not convert to a number", line);
                    eprintln!("Details: {}", source);
                    eprintln!("Please ensure all lines contain valid integers.");
                },
                AppError::EmptyFile => {
                    eprintln!("❌ Input file is empty.");
                    eprintln!("Please add numbers to the file and try again.");
                },
                AppError::NoNumbers => {
                    eprintln!("❌ No numbers found in the file.");
                    eprintln!("The file might only contain empty lines or comments.");
                }
            }

            // Print error details in debug format to help with resolution
            eprintln!("\nError details: {:?}", error);

            // Exit with error code
            std::process::exit(1);
        }
    }
}
```

### Example Explanation

1. **Custom Error Type**: Uses the `AppError` enum to represent specific error types.
2. **thiserror**: Uses `#[derive(Error)]` to automatically implement required traits.
3. **Error Context**: Adds context to errors (e.g., the line number where the error occurred).
4. **Error Propagation**: Uses the `?` operator to pass errors up to the caller.
5. **User-Friendly Messages**: Displays clear error notifications to the user.
6. **Recovery Mechanisms**: Automatically generates a sample file if the input file is missing.

## 12. References

### Official Books and Documentation

- [The Rust Programming Language](https://doc.rust-lang.org/book/ch09-00-error-handling.html) - Chapter 9: Error Handling
- [Rust By Example](https://doc.rust-lang.org/rust-by-example/error.html) - Error Handling
- [Rustonomicon](https://doc.rust-lang.org/nomicon/unwinding.html) - Unwinding

### Useful Libraries

- [thiserror](https://github.com/dtolnay/thiserror) - Define error types easily.
- [anyhow](https://github.com/dtolnay/anyhow) - Flexible error handling.
- [eyre](https://github.com/yaahc/eyre) - Error reporting in Rust.
- [snafu](https://github.com/shepmaster/snafu) - Detailed error handling and context.
- [miette](https://github.com/zkat/miette) - Error handling with beautiful diagnostic reporting.

### Articles and Tutorials

- [Error Handling in Rust](https://blog.burntsushi.net/rust-error-handling/) - Andrew Gallant (BurntSushi)
- [Rust Error Handling Best Practices](https://nick.groenen.me/posts/rust-error-handling/) - Nick Groenen
- [Pretty Errors with Thiserror and Anyhow](https://robertohuertas.com/2020/05/05/pretty-errors-with-thiserror-and-anyhow/) - Roberto Huertas

## 13. FAQ - Frequently Asked Questions

### 1. When should I use panic! and when should I use Result?

- Use `panic!` when:
  - Encountering an unrecoverable error where the program cannot safely continue.
  - The error is due to a programming mistake and should be caught during development.
  - "Impossible" situations (unwrapping a checked Option/Result).
- Use `Result` when:
  - The error is expected and can be handled reasonably.
  - Interacting with external systems (files, network, input).
  - The API should allow the user to decide how to handle the error.

### 2. How do I convert from one error type to another?

- Implement the `From<OtherError>` trait for your error type.
- Use `thiserror` and the `#[from]` attribute.
- Use `map_err()` to convert errors within a `Result`.
- Use the `?` operator (requires the `From` trait to be implemented).

### 3. How can I avoid too many match blocks in my error handling code?

- Use the `?` operator to propagate errors.
- Use methods like `unwrap_or` and `unwrap_or_else`.
- Use a library like `anyhow` for application code.
- Create helper functions to reuse error handling logic.

### 4. How do I handle errors in async functions?

- Principles are similar to synchronous code.
- The `?` operator works normally in async functions.
- Combine with futures to handle errors in concurrent tasks.
- Consider using `try_join!` instead of `join!` if you want errors to propagate.

### 5. When should I create a custom error type and when should I use Box<dyn Error>?

- Create a custom error type when:
  - Writing a library with a public API.
  - You need to handle each error type specifically.
  - You want to provide detailed error information.
- Use `Box<dyn Error>` or `anyhow::Error` when:
  - Writing an application, not a library.
  - You just need to display the error and don't need detailed handling.
  - You need to combine multiple error types simply.

## 14. Appendix: Advanced Error Handling Patterns

### 1. Fallible Iterator

```rust
fn process_items<I>(items: I) -> Result<Vec<i32>, AppError>
where
    I: Iterator<Item = Result<i32, AppError>>,
{
    items.collect()
}
```

### 2. Error Context Stack

```rust
use anyhow::{Context, Result};

fn read_config() -> Result<Config> {
    std::fs::read_to_string("config.json")
        .context("Reading configuration file")?
        .parse::<serde_json::Value>()
        .context("Parsing JSON")?
        .try_into()
        .context("Converting to Config")
}
```

### 3. Typed Error Handling

```rust
enum DatabaseError {
    ConnectionFailed(String),
    QueryFailed(String),
    TransactionFailed(String),
}

enum ApiError {
    NotFound,
    Unauthorized,
    InternalError(Box<dyn std::error::Error>),
}

impl From<DatabaseError> for ApiError {
    fn from(err: DatabaseError) -> Self {
        match err {
            DatabaseError::ConnectionFailed(_) | DatabaseError::TransactionFailed(_) =>
                ApiError::InternalError(Box::new(err)),
            DatabaseError::QueryFailed(_) =>
                ApiError::NotFound,
        }
    }
}
```

### 4. Try Blocks (Experimental)

```rust
fn process() -> Result<(), AppError> {
    let result = try {
        let file = std::fs::File::open("data.txt")?;
        let content = std::io::read_to_string(file)?;
        content.parse::<i32>()?
    };

    match result {
        Ok(number) => println!("Number: {}", number),
        Err(err) => println!("Error: {}", err),
    }

    Ok(())
}
```

### 5. Railway Oriented Programming

```rust
fn validate_then_process(input: &str) -> Result<Output, AppError> {
    validate_input(input)
        .and_then(parse_input)
        .and_then(process_data)
        .and_then(format_output)
}
```

## 15. Preparation for the Lesson

### 1. Environment Preparation

- Create a new Rust project: `cargo new error_handling_demo`
- Add dependencies to Cargo.toml:

  ```toml
  [dependencies]
  thiserror = "1.0.40"
  anyhow = "1.0.70"
  serde = { version = "1.0", features = ["derive"] }
  serde_json = "1.0"
  ```

### 2. Prepare Demo Files

- Create a `numbers.txt` file with:

  ```
  # List of numbers
  42
  17
  bad
  123
  ```

- Create a `config.ini` file with:

  ```
  # Application configuration
  database_url = postgres://user:pass@localhost/dbname
  port = 8080
  timeout = 30
  ```

### 3. Prepare Slides or Presentation Materials

- Key points of the lesson.
- Sample code for each section.
- Diagrams illustrating concepts (Result, propagation, etc.).

### 4. Prepare Homework

- Create code templates for students.
- Prepare test cases for students to self-check.
- Define requirements with varying levels of difficulty.

## 16. Lesson Summary

Error handling in Rust is a vital component for writing safe and reliable code. Rust provides powerful tools like `panic!` for unrecoverable errors and `Result<T, E>` for recoverable errors. The `?` operator makes error handling code concise and readable. Creating custom error types with `thiserror` or using `anyhow` allows applications to handle and report errors professionally.

After this lesson, you have the knowledge to:

1. Distinguish between and correctly use error handling methods.
2. Create appropriate custom error types for your applications.
3. Use error handling support libraries.
4. Build applications with professional error handling.

In the next lessons, we will explore error handling in the context of asynchronous programming and working with web APIs.

Happy learning!
