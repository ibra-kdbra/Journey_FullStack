# Lesson 3: Operators and Expressions

## 🎯 Lesson Objectives

- Understand and proficiently use various types of operators in Golang.
- Master the operator precedence when they appear in expressions.
- Apply operators to solve real-world problems.
- Build calculation applications using different types of operators.

## 📝 Detailed Content

### 1. Arithmetic Operators

Golang provides familiar arithmetic operators for basic calculations:

| Operator | Description    | Example                        |
| -------- | -------------- | ------------------------------ |
| `+`      | Addition       | `3 + 2 = 5`                    |
| `-`      | Subtraction    | `3 - 2 = 1`                    |
| `*`      | Multiplication | `3 * 2 = 6`                    |
| `/`      | Division       | `3 / 2 = 1` (integer division) |
| `%`      | Modulo         | `3 % 2 = 1`                    |

```go
a := 5 / 2
b := 5.0 / 2
c := 5 / 2.0
d := float64(5) / 2
```

Golang also supports increment/decrement and assignment operators:

| Operator | Description    | Example                            |
| -------- | -------------- | ---------------------------------- |
| `++`     | Increment by 1 | `a++` is equivalent to `a = a + 1` |
| `--`     | Decrement by 1 | `a--` is equivalent to `a = a - 1` |

```go
a := 5
a++
```

### 2. Comparison Operators

Comparison operators return a `bool` result (true/false):

| Operator | Description           | Example  |
| -------- | --------------------- | -------- |
| `==`     | Equal                 | `3 == 2` |
| `!=`     | Not Equal             | `3 != 2` |
| `<`      | Less Than             | `3 < 2`  |
| `>`      | Greater Than          | `3 > 2`  |
| `<=`     | Less Than or Equal    | `3 <= 3` |
| `>=`     | Greater Than or Equal | `3 >= 2` |

These operators are commonly used in conditional statements and loops.

### 3. Logical Operators

| Operator | Description                    | Example              |
| -------- | ------------------------------ | -------------------- | ----------------------------------- | -------- | --- | -------- |
| `&&`     | AND - both conditions are true | `(3 > 2) && (5 > 1)` |
| `        |                                | `                    | OR - at least one condition is true | `(3 < 2) |     | (5 > 1)` |
| `!`      | NOT - reverses the condition   | `!(3 < 2)`           |

### 4. Assignment Operators

Golang provides assignment operators to perform calculations and assignments combined:

| Operator | Description         | Example                            |
| -------- | ------------------- | ---------------------------------- |
| `=`      | Assign              | `a = 5`                            |
| `+=`     | Add and Assign      | `a += 2` equivalent to `a = a + 2` |
| `-=`     | Subtract and Assign | `a -= 2` equivalent to `a = a - 2` |
| `*=`     | Multiply and Assign | `a *= 2` equivalent to `a = a * 2` |
| `/=`     | Divide and Assign   | `a /= 2` equivalent to `a = a / 2` |
| `%=`     | Modulo and Assign   | `a %= 2` equivalent to `a = a % 2` |

### 5. Bitwise Operators

Golang supports operations on bits:

| Operator | Description         |
| -------- | ------------------- | ---------- |
| `&`      | Bitwise AND         |
| `        | `                   | Bitwise OR |
| `^`      | Bitwise XOR         |
| `<<`     | Left Shift          |
| `>>`     | Right Shift         |
| `&^`     | Bit Clear (AND NOT) |

Bitwise operators are useful in high-performance applications or when working with bit masks.

### 6. Operator Precedence

Operators in Golang have different levels of precedence, determining the order of evaluation:

| Precedence  | Operator                             |
| ----------- | ------------------------------------ | ----- | --- |
| 5 (Highest) | `*`, `/`, `%`, `<<`, `>>`, `&`, `&^` |
| 4           | `+`, `-`, `                          | `,`^` |
| 3           | `==`, `!=`, `<`, `<=`, `>`, `>=`     |
| 2           | `&&`                                 |
| 1 (Lowest)  | `                                    |       | `   |

## 🏆 Hands-on Exercise

### Exercise 1: Calculate Trapezoid Area and Perimeter

**Task:** Write a Go program to calculate the area and perimeter of a trapezoid, given bases a and b, sides c and d, and height h.

### Exercise 2: Leap Year Check

**Task:** Write a Go program to check if a year is a leap year. A leap year is divisible by 4 but not by 100, unless it is also divisible by 400.

### Exercise 3: Simple Calculator

**Task:** Write a Go program that acts as a simple calculator. The program receives two floats and an operator (+, -, \*, /) from the user, performs the calculation, and displays the result. Ensure division by zero is handled.

## 🔑 Key Points to Remember

1. **Integer Division**:

   - Division between two integers always returns an integer (truncating the remainder).

2. **`++` and `--` Operators**:

   - In Go, `++` and `--` can only be used as statements, not as expressions.

3. **Short-Circuit Evaluation**:

   - For `&&`, if the left side is false, the right side is not evaluated.
   - For `||`, if the left side is true, the right side is not evaluated.

4. **Bitwise Operators**:

   - Use clear comments when using bitwise operators as they can be hard to read.

5. **Precedence**:

   - Use parentheses `()` to clarify intent and avoid precedence confusion.

6. **Edge Cases**:
   - Always check for division by zero conditions.

## 📝 Homework

### Task 1: BMI Calculation

**Task:** Write a Go program to calculate BMI (Body Mass Index) based on height (m) and weight (kg) input by the user. Formula: BMI = weight / (height^2). Classify the result:

- Under 18.5: Underweight
- 18.5 to 24.9: Normal
- 25 to 29.9: Overweight
- 30 or higher: Obese

### Task 2: Temperature Conversion

**Task:** Write a Go program to allow users to convert between Celsius (°C), Fahrenheit (°F), and Kelvin (K). Display a menu for the user to choose the conversion type, then input the value.

### Task 3: Electricity Bill Calculation

**Task:** Write a Go program to calculate an electricity bill based on a tiered pricing system:

- First 50 kWh: 1,678 VND/kWh
- 51 - 100 kWh: 1,734 VND/kWh
- 101 - 200 kWh: 2,014 VND/kWh
- 201 - 300 kWh: 2,536 VND/kWh
- 301 - 400 kWh: 2,834 VND/kWh
- Above 400 kWh: 2,927 VND/kWh

### Task 4: Triangle Verification and Area

**Task:** Write a Go program that takes three side lengths of a triangle:

1. Verify if they form a valid triangle.
2. Determine the type (Equilateral, Isosceles, Right, etc.).
3. Calculate the area using Heron's formula.
