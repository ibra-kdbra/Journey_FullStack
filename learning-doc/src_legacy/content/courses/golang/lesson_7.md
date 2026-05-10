# Lesson 7: Maps and Structs

## 🎯 **Lesson Objectives**

- Understand the concept and usage of **maps**.
- Know how to **initialize**, **access**, **add**, **delete elements**, and **check for key existence** in a map.
- Master how to define and use **structs**.
- Apply maps and structs to build practical programs.

## 📝 **Detailed Content**

### 🧠 **1. What is a Map?**

**Concept:**
A map in Go is a **data structure that maps** keys to values (like a dictionary or hash table).

- Keys must be of a **comparable** type (int, string, bool, etc.).
- Values can be of any data type.

**Map initialization syntax:**

```go
m := make(map[string]int)
```

### 🧠 **2. What is a Struct?**

**Concept:**
A struct in Go is a **user-defined custom data type** used to group **related attributes** of a single object.

Example: a `Student` struct might have a name, age, score, etc.

**Declaration syntax:**

```go
type Student struct {
    Name  string
    Age   int
    Score float64
}
```

### 🔄 **Combining Structs with Maps:**

```go
type Student struct {
    Name  string
    Age   int
    Score float64
}

func main() {
    students := make(map[string]Student)

    students["s001"] = Student{"Alice", 20, 8.5}
    students["s002"] = Student{Name: "Bob", Age: 21, Score: 9.2}

    for id, s := range students {
        fmt.Printf("ID: %s - Name: %s - Age: %d - Score: %.2f\n", id, s.Name, s.Age, s.Score)
    }
}
```

## 🏆 **Hands-on Exercise**

### ✅ **Exercise 1: English-Vietnamese Dictionary**

**Task:**
Write a simple dictionary program using `map[string]string` that allows:

- Adding new words.
- Looking up definitions.
- Deleting words.

### ✅ **Exercise 2: Student Management**

**Task:**
Create a student management program:

- Use a `Student struct` containing name, age, and score.
- Store the student list in a `map[string]Student` where the key is the student ID.
- Print the entire list.

## 🔑 **Key Points to Remember**

| 🔍 Topic       | ❗ Note                                                                               |
| -------------- | ------------------------------------------------------------------------------------- |
| Map            | Accessing a non-existent key returns the zero value of the value type.                |
| Map            | Slices and maps cannot be used as keys.                                               |
| Struct         | Structs can be passed by value or by pointer (`*Struct`).                             |
| Struct & Map   | Maps cannot directly contain structs with unexported fields if accessed from outside. |
| Initialization | Use `make()` to initialize a map before use.                                          |

## 📝 **Homework**

### 🧪 **Task 1: Contact List Management**

**Requirements:**
Create a phone contact management program:

- Use `map[string]string` to store name → phone number mappings.
- Allow the user to:
  - Add a contact.
  - Look up a number by name.
  - Print the entire contact list.

### 🧪 **Task 2: Student List Filters**

**Requirements:**
Write a program using `struct` to describe a student (name, age, average score). Store the students in a slice or map.

- Print students with an average score > 8.
- Find the student with the highest score.
