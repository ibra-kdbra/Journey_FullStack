# Lesson 2: Variables and Basic Data Types in Golang

## 🎯 Lesson Objectives

1. Understand and master variable declaration and usage in Golang.
2. Become familiar with basic Go data types: int, float, bool, and string.
3. Understand the concept of zero values (default values) in Golang.
4. Grasp and apply type conversion and type inference.
5. Practice writing code using the learned concepts.

## 📝 Detailed Content

### 1. Declaring Variables and Constants

#### 1.1. Variable Declaration

Golang provides multiple ways to declare variables:

**Method 1: Full declaration with the `var` keyword**

```go
var variable_name data_type = value
```

Example:

```go
var name string = "Golang"
var age int = 25
var isActive bool = true
```

**Method 2: Short declaration with `:=`**

```go
variable_name := value
```

Example:

```go
name := "Golang"
age := 25
isActive := true
```

**Method 3: Declaration without initial value**

```go
var variable_name data_type
```

Example:

```go
var count int
var name string
```

#### 1.2. Constant Declaration

Constants in Golang are declared with the `const` keyword:

```go
const PI = 3.14159
const APP_NAME = "Golang Tutorial"
```

Declaring multiple constants:

```go
const (
    STATUS_OK    = 200
    STATUS_ERROR = 500
    MAX_SIZE     = 1024
)
```

**Using iota in constant declaration:**

`iota` is a counter that automatically increments within `const` blocks.

```go
const (
    MONDAY = iota
    TUESDAY
    WEDNESDAY
    THURSDAY
    FRIDAY
)
```

### 2. Basic Data Types

#### 2.1. Integer Types

- **Signed Types**: `int`, `int8`, `int16`, `int32`, `int64`
- **Unsigned Types**: `uint`, `uint8`, `uint16`, `uint32`, `uint64`, `uintptr`

```go
var a int = 10
var b int8 = 127
var c uint16 = 65000
```

#### 2.2. Floating-Point Types

- `float32`
- `float64`

```go
var pi float64 = 3.14159265359
var e float32 = 2.71828
```

#### 2.3. Boolean Type

- `bool`: true or false

```go
var isValid bool = true
var isCompleted bool = false
```

#### 2.4. String Type

- `string`: A sequence of UTF-8 characters

```go
var greeting string = "Hello"
var name string = "Golang"
```

**Multi-line strings with backticks:**

```go
var poem string = `
    This is a poem
    written on multiple lines
    in Golang
`
```

### 3. Zero Values

Golang always automatically initializes variables with a default value (zero value) when they are declared without an initial value:

- Numeric types (`int`, `float`, etc.): `0`
- Boolean type (`bool`): `false`
- String type (`string`): `""` (empty string)
- Pointers, interfaces, slices, maps, channels: `nil`

```go
var i int
var f float64
var b bool
var s string
```

### 4. Type Conversion and Type Inference

#### 4.1. Type Conversion

Golang does not support automatic (implicit) type conversion. You must convert data types explicitly:

```go
var i int = 42
var f float64 = float64(i)

var f2 float64 = 3.14
var i2 int = int(f2)

var r rune = 'A'
var s string = string(r)
```

**Converting between strings and numbers:**

```go
import "strconv"

// String to int
s := "123"
i, err := strconv.Atoi(s)
// or
i, err := strconv.ParseInt(s, 10, 64)

// Int to string
i := 123
s := strconv.Itoa(i)
// or
s := strconv.FormatInt(int64(i), 10)
```

#### 4.2. Type Inference

Golang can infer the data type based on the assigned value:

```go
name := "Golang"
count := 10
isActive := true
pi := 3.14
```

## 🏆 Hands-on Exercise

### Exercise 1: Declare and Print Variables

**Task:**
Write a Go program to declare and print your personal information using basic data types: int, float64, bool, and string.

### Exercise 2: Data Type Conversion

**Task:**
Write a program that performs the following conversions:

1. Integer to float and vice versa.
2. String to integer and vice versa.
3. Between different sizes of integer types.

### Exercise 3: Student Information Calculation

**Task:**
Write a program to manage student info including: full name, age, and scores for subjects (Math, Physics, Chemistry). Calculate the average score and display all information formatted appropriately.

## 🔑 Key Points to Remember

1. **Static Typing**: Golang is a statically typed language.
2. **Zero Values**: Golang always initializes variables with default values.
3. **No Implicit Casting**: Golang requires explicit type conversion.
4. **`:=` vs `var`**:
   - `:=` can only be used inside functions.
   - `var` can be used anywhere.
5. **Compile-time Constants**: Constants must be determined at compile time.

## 📝 Homework

### Task 1: BMI Calculation

Write a program to calculate BMI (Body Mass Index) based on height (m) and weight (kg). Formula: BMI = weight / (height \* height). Display the result and classify it:

- BMI < 18.5: Underweight
- 18.5 <= BMI < 25.0: Normal
- 25.0 <= BMI < 30.0: Overweight
- BMI >= 30.0: Obese

### Task 2: Temperature Conversion

Write a program to convert between Celsius, Fahrenheit, and Kelvin. The program should take a source unit and value, then convert it to others.

### Task 3: Product Management

Write a program to manage product information including: code, name, price, quantity, and availability. Calculate:

1. Total value (price \* quantity)
2. VAT (10% of total)
3. Final price after tax

### Task 4: Iota Practice

Use `iota` to create constants representing:

1. Log levels: DEBUG, INFO, WARNING, ERROR, FATAL.
2. Storage units: KB, MB, GB, TB (each 1024 times larger than the previous).
3. File permissions: READ, WRITE, EXECUTE (bit flags: 1, 2, 4).

### Task 5: String and Character Processing

Write a program to:

1. Declare a string with special characters.
2. Count and display the number of characters (runes, not bytes).
3. Convert to uppercase and lowercase.
4. Extract the first and last 5 characters.
5. Concatenate two strings.
