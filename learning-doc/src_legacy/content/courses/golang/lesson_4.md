# Lesson 4: Control Structures - Branching

## 🎯 Lesson Objectives

- Understand and proficiently use `if-else` conditional statements in Golang.
- Master the syntax and usage of `switch-case` statements.
- Apply short statements within branching structures.

## 📝 Detailed Content

### 1. Introduction to Branching Control Structures

Branching control structures allow a program to make decisions and execute different blocks of code based on specific conditions.

- `if-else` statement
- `switch-case` statement

### 2. The if-else Statement

#### 2.1. Basic Syntax

```go
if condition {
    // Code to execute if condition is true
} else {
    // Code to execute if condition is false
}
```

#### 2.2. Full if-else Template

```go
if condition_1 {
    // Executed if condition_1 is true
} else if condition_2 {
    // Executed if condition_1 is false and condition_2 is true
} else if condition_3 {
    // Executed if condition_1 and condition_2 are false, and condition_3 is true
} else {
    // Executed if all above conditions are false
}
```

#### 2.3. Short Statement

Golang allows you to perform an assignment directly before the condition check.

```go
if variable := expression; condition {
    // Use the variable within this block
}
// variable does not exist here
```

### 3. The switch-case Statement

#### 3.1. Basic Syntax

```go
switch expression {
case value_1:
    // Executed if expression == value_1
case value_2:
    // Executed if expression == value_2
...
default:
    // Executed if no cases match
}
```

#### 3.2. Unique Features of Switch in Golang

1. **No `break` keyword needed**: Each case automatically breaks after execution, unlike in C/C++/Java.
2. **Multiple cases**: You can list multiple values in a single case.
3. **Cases are not limited to constants**: They can be any expression.

#### 3.4. Switch with Short Statement

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    switch today := time.Now().Weekday(); today {
    case time.Saturday, time.Sunday:
        fmt.Println("Happy weekend!")
    default:
        fmt.Println("Today is", today, "- Keep working hard!")
    }
}
```

#### 3.5. The `fallthrough` Keyword

The `fallthrough` keyword forces execution to proceed to the next case, regardless of its condition:

```go
package main

import "fmt"

func main() {
    num := 5

    switch num {
    case 5:
        fmt.Println("Number 5")
        fallthrough
    case 6:
        fmt.Println("Number 6")
        fallthrough
    case 7:
        fmt.Println("Number 7")
    case 8:
        fmt.Println("Number 8")
    }
}
```

### 4. Comparing if-else and switch-case: When to use which?

#### 4.1. Use if-else when

- Conditions are complex and not just based on equality.
- There are few conditions (less than 3-4).

#### 4.2. Use switch-case when

- Comparing a single variable against many different values.
- There are many branches (more than 3-4 conditions).

## 🏆 Hands-on Exercise

### Exercise 1: Even/Odd and Positive/Negative Check

**Task:** Write a Go program that takes an integer and determines if it is even or odd, and positive or negative. Use `if-else` structures.

### Exercise 2: Tiered Electricity Pricing

**Task:** Write a Go program to calculate an electricity bill based on a tiered pricing system (refer to the tiers in Lesson 3).

### Exercise 3: Day of the Week Converter

**Task:** Write a program that receives an integer from 1 to 7 representing a day of the week and prints the name of the day in both English and your native language. Use `switch-case`. Display an error if the input is out of range.

## 🔑 Key Points to Remember

1. **Mandatory Braces**: In Golang, curly braces `{}` are required for code blocks, even for single statements.
2. **No Parentheses Needed**: Conditions in `if` statements do not need to be wrapped in parentheses `()`.
3. **Short Statement Scope**: Variables declared in a short statement are only scoped to that block.
4. **Switch Differences**: Automatic breaks and the `fallthrough` keyword are specific to Go.
5. **Performance**: `switch-case` can be more efficient than long `if-else if` chains for multiple equality checks.
6. **Code Style**: Choose the structure that enhances readability based on the complexity of your conditions.

## 📝 Homework

### Task 1: Academic Grading

**Task:** Write a program that takes scores for Math, Physics, and Chemistry. Calculate the average and grade the student:

- Average >= 8.5: Excellent
- 7.0 <= Average < 8.5: Good
- 5.5 <= Average < 7.0: Fair
- 4.0 <= Average < 5.5: Average
- Average < 4.0: Poor

Additional requirement:

- If any subject is below 3.0, the student automatically receives a "Poor" grade regardless of the average.
- Use `if-else` structures.

### Task 2: Simple Calculator

**Task:** Build a simple calculator simulator for (+, -, \*, /, %, ^). Use `switch-case` to handle the operations and manage edge cases like division by zero.

### Task 3: Leap Year Check

**Task:** Write a program to check for a leap year using a short statement within an `if` block.

### Task 4: Number to Words

**Task:** Write a program that converts a digit from 0 to 9 into its corresponding word (zero, one, two, ..., nine). Implement this using both `if-else` and `switch-case`, then compare the readability.
