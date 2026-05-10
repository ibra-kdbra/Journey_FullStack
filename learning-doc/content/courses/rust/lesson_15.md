# Lesson 15: Collections - HashMaps in Rust

## Introduction (5 minutes)

**Greetings and Introduction**

- Welcome to the 15th lesson in our Rust programming series.
- Today, we will explore HashMaps - one of the most important and common collections in Rust.
- HashMaps allow us to store data in key-value pairs, enabling fast and efficient data retrieval.

**Why are HashMaps important?**

- HashMaps are a fundamental data structure in almost all programming languages.
- In practice, HashMaps are widely used for:
  - Storing application configurations
  - Counting frequency of occurrences (e.g., word counts in text)
  - Data caching
  - Building database indexes

**Lesson Overview**

- Understanding HashMaps and how they work
- Basic HashMap methods
- Inserting and retrieving data
- Ownership and borrowing with HashMaps
- Updating values based on old values
- Hash functions
- Practice: Building a word counter and a configuration app

## Part 1: HashMap<K, V> and How It Works (10 minutes)

**Basic Concept**

- HashMap<K, V> is a collection that stores data in key-value pairs.
- K: The data type of the key (must implement the `Hash` + `Eq` traits).
- V: The data type of the value (can be any type).

**Importing and Initialization**

```rust
// Import HashMap from the standard library
use std::collections::HashMap;

// Initialize an empty HashMap
let mut scores = HashMap::new();

// Initialize with explicit types
let mut scores: HashMap<String, i32> = HashMap::new();

// Initialize from vectors using collect
let teams = vec![String::from("Blue"), String::from("Red")];
let initial_scores = vec![10, 50];
let mut scores: HashMap<_, _> = teams.into_iter().zip(initial_scores.into_iter()).collect();
```

**Working Principle**

- A hash function converts the key into an integer (hash code).
- The hash code is used to determine the storage location of the value in memory.
- Rust uses SipHash as its default hashing algorithm - balancing speed and security.
- When multiple keys result in the same hash code (collision), Rust uses a linked list for storage.

**Important Properties**

- Fast retrieval: O(1) in the best case.
- Does not guarantee the order of elements.
- Automatically grows in size as needed.
- Key uniqueness is enforced.

## Part 2: Inserting and Retrieving Data (10 minutes)

**Inserting Data**

```rust
let mut scores = HashMap::new();

// Insert data using insert
scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Red"), 50);

// Overwrites the value if the key already exists
scores.insert(String::from("Blue"), 25); // "Blue" score is now 25
```

**Retrieving Data**

```rust
// Use get - returns Option<&V>
let team_name = String::from("Blue");
let score = scores.get(&team_name);
match score {
    Some(s) => println!("Score for team Blue: {}", s),
    None => println!("Team Blue not found"),
}

// Use indexing with []
// Note: Can panic if the key does not exist
let blue_score = scores["Blue"];
println!("Score for team Blue: {}", blue_score);

// Check if a key exists
if scores.contains_key(&team_name) {
    println!("Team Blue is already in the HashMap");
}
```

**Conditional Insertion**

```rust
// entry API - insert if key does not exist
scores.entry(String::from("Yellow")).or_insert(0);

// or_insert returns &mut V, allowing value modification
let yellow_score = scores.entry(String::from("Yellow")).or_insert(0);
*yellow_score += 1; // Increment score
```

**Iterating through all elements**

```rust
for (key, value) in &scores {
    println!("{}: {}", key, value);
}
```

## Part 3: Ownership with HashMaps (10 minutes)

**Ownership rules for keys and values**

- For data types that do not implement the Copy trait:
  - The HashMap takes ownership of the key and value upon insertion.
  - Data is moved into the HashMap and cannot be used after insertion.

```rust
let team_name = String::from("Blue");
let team_score = 10;

let mut scores = HashMap::new();
scores.insert(team_name, team_score);

// OK because i32 implements the Copy trait
println!("Score: {}", team_score);

// Error: team_name has been moved into the HashMap
// println!("Team: {}", team_name);
```

**Cloning to retain ownership**

```rust
let team_name = String::from("Blue");
let mut scores = HashMap::new();

// Use clone to retain ownership
scores.insert(team_name.clone(), 10);
println!("Team: {}", team_name); // OK because we cloned it
```

**Borrowing from a HashMap**

```rust
let blue_score = scores.get("Blue");
// blue_score is &i32, a reference to the value in the HashMap

let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);

// Borrow a mutable reference
if let Some(score) = scores.get_mut("Blue") {
    *score += 5; // Increment score by 5
}
```

**Lifetimes with HashMap references**

- References from `get()` and `get_mut()` are only valid as long as the HashMap exists.
- The borrow checker ensures we cannot use references after the HashMap has been dropped.

## Part 4: Updating Values Based on Old Values (10 minutes)

**Frequency Counting**

```rust
let text = "hello world wonderful world";
let mut word_count = HashMap::new();

for word in text.split_whitespace() {
    // Get reference to current value or create new with value 0
    let count = word_count.entry(word).or_insert(0);
    // Increment value by 1
    *count += 1;
}

println!("{:?}", word_count);
// Output: {"world": 2, "hello": 1, "wonderful": 1}
```

**Replacing a Value**

```rust
let mut scores = HashMap::new();
scores.insert("Blue", 10);

// Method 1: Check before replacing
if let Some(value) = scores.get_mut("Blue") {
    if *value < 20 {
        *value = 20;
    }
}

// Method 2: Use entry API
scores.entry("Blue").and_modify(|score| {
    if *score < 20 {
        *score = 20;
    }
}).or_insert(20);
```

**Upsert (Insert or Update)**

```rust
let mut player_stats = HashMap::new();

// Insert new or update existing player info
fn update_player(
    stats: &mut HashMap<String, (i32, i32, i32)>,
    name: &str,
    kills: i32,
    deaths: i32,
    assists: i32
) {
    stats.entry(name.to_string()).and_modify(|stat| {
        stat.0 += kills;
        stat.1 += deaths;
        stat.2 += assists;
    }).or_insert((kills, deaths, assists));
}

update_player(&mut player_stats, "Player1", 5, 2, 3);
update_player(&mut player_stats, "Player1", 3, 1, 2); // Update further

println!("{:?}", player_stats);
// Output: {"Player1": (8, 3, 5)}
```

## Part 5: Hash Functions and Security (10 minutes)

**HashDoS and SipHash**

- Hash DoS (Denial of Service) is an attack where many keys are created to cause collisions.
- Rust uses SipHash-1-3 as its default hashing algorithm.
- SipHash may be slightly slower than some algorithms but provides better security.

**Custom Hash Functions**

- You can use a different hash function via the BuildHasher trait.
- External libraries like `fnv` provide faster hashing for cases where high security is not required.

```rust
// Need to add fnv crate to Cargo.toml first
use fnv::FnvHashMap;

// Use FnvHashMap instead of standard HashMap
let mut scores = FnvHashMap::default();
scores.insert(String::from("Blue"), 10);
```

**Implementing Required Traits for Custom Keys**

```rust
use std::collections::HashMap;
use std::hash::{Hash, Hasher};

struct Team {
    id: u32,
    name: String,
}

// Need to implement Eq and Hash to use as a key
impl PartialEq for Team {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id
    }
}

impl Eq for Team {}

impl Hash for Team {
    fn hash<H: Hasher>(&self, state: &mut H) {
        // Hash only the id, not the name
        self.id.hash(state);
    }
}

// Now Team can be used as a key
let mut team_scores = HashMap::new();
team_scores.insert(Team { id: 1, name: String::from("Blue") }, 10);
```

## Part 6: Practice - Counting Words in Text (15 minutes)

**Exercise: Write a word counting program**

```rust
use std::collections::HashMap;
use std::io;

fn main() {
    println!("Enter text to count words:");

    let mut input = String::new();
    io::stdin()
        .read_line(&mut input)
        .expect("Failed to read input");

    let word_counts = count_words(&input);

    // Print the top 5 most frequent words
    print_top_words(&word_counts, 5);
}

fn count_words(text: &str) -> HashMap<String, usize> {
    let mut word_counts = HashMap::new();

    // Convert to lowercase and remove punctuation
    let text = text.to_lowercase();
    let text = text.replace(&['.', ',', '!', '?', ':', ';', '"', '(', ')', '[', ']'], "");

    for word in text.split_whitespace() {
        *word_counts.entry(word.to_string()).or_insert(0) += 1;
    }

    word_counts
}

fn print_top_words(word_counts: &HashMap<String, usize>, limit: usize) {
    // Convert hashmap to vector for sorting
    let mut counts_vec: Vec<(&String, &usize)> = word_counts.iter().collect();

    // Sort by frequency (descending)
    counts_vec.sort_by(|a, b| b.1.cmp(a.1));

    println!("\nMost frequent words:");
    println!("{:<15} {:<10}", "Word", "Frequency");
    println!("{:-<26}", "");

    for (i, (word, count)) in counts_vec.iter().take(limit).enumerate() {
        println!("{:<15} {:<10}", word, count);
    }
}
```

**Step-by-step Explanation:**

1. Read text from the user.
2. Pre-processing: convert to lowercase, remove punctuation.
3. Split into individual words and count occurrences using a HashMap.
4. Sort words by their frequency.
5. Print the top words.

**Advanced:**

- Add a stop words filter.
- Save results to a file.
- Read text from a file.

## Part 7: Practice - Storing Configuration (15 minutes)

**Exercise: Create a simple configuration management application**

```rust
use std::collections::HashMap;
use std::io;
use std::fs;
use std::io::Write;

struct ConfigManager {
    config: HashMap<String, String>,
    filename: String,
}

impl ConfigManager {
    // Create new with specified file
    fn new(filename: &str) -> Self {
        let config = Self::load_from_file(filename)
            .unwrap_or_else(|_| HashMap::new());

        ConfigManager {
            config,
            filename: filename.to_string(),
        }
    }

    // Load configuration from file
    fn load_from_file(filename: &str) -> Result<HashMap<String, String>, io::Error> {
        let contents = fs::read_to_string(filename)?;
        let mut config = HashMap::new();

        for line in contents.lines() {
            if line.trim().is_empty() || line.starts_with('#') {
                continue;
            }

            if let Some((key, value)) = line.split_once('=') {
                config.insert(key.trim().to_string(), value.trim().to_string());
            }
        }

        Ok(config)
    }

    // Save configuration to file
    fn save_to_file(&self) -> Result<(), io::Error> {
        let mut file = fs::File::create(&self.filename)?;

        writeln!(&mut file, "# Configuration file")?;
        writeln!(&mut file, "# Generated on: {}", chrono::Local::now())?;
        writeln!(&mut file)?;

        for (key, value) in &self.config {
            writeln!(&mut file, "{} = {}", key, value)?;
        }

        Ok(())
    }

    // Get value by key
    fn get(&self, key: &str) -> Option<&String> {
        self.config.get(key)
    }

    // Set value for key
    fn set(&mut self, key: &str, value: &str) {
        self.config.insert(key.to_string(), value.to_string());
    }

    // Remove key
    fn remove(&mut self, key: &str) -> bool {
        self.config.remove(key).is_some()
    }

    // Display all configurations
    fn display_all(&self) {
        println!("\nCurrent configuration:");
        println!("{:<20} {:<20}", "Key", "Value");
        println!("{:-<41}", "");

        for (key, value) in &self.config {
            println!("{:<20} {:<20}", key, value);
        }
    }
}

fn main() {
    let mut config_manager = ConfigManager::new("app_config.txt");

    loop {
        println!("\n--- CONFIGURATION MANAGEMENT ---");
        println!("1. Display all configurations");
        println!("2. Add/Update configuration");
        println!("3. Remove configuration");
        println!("4. Save to file");
        println!("0. Exit");

        let mut choice = String::new();
        io::stdin().read_line(&mut choice).expect("Failed to read input");

        match choice.trim() {
            "1" => config_manager.display_all(),
            "2" => {
                println!("Enter key:");
                let mut key = String::new();
                io::stdin().read_line(&mut key).expect("Failed to read input");

                println!("Enter value:");
                let mut value = String::new();
                io::stdin().read_line(&mut value).expect("Failed to read input");

                config_manager.set(key.trim(), value.trim());
                println!("Configuration updated.");
            },
            "3" => {
                println!("Enter key to remove:");
                let mut key = String::new();
                io::stdin().read_line(&mut key).expect("Failed to read input");

                if config_manager.remove(key.trim()) {
                    println!("Configuration removed.");
                } else {
                    println!("Key not found.");
                }
            },
            "4" => {
                match config_manager.save_to_file() {
                    Ok(_) => println!("Configuration saved to file."),
                    Err(e) => println!("Error saving file: {}", e),
                }
            },
            "0" => break,
            _ => println!("Invalid choice."),
        }
    }
}
```

**Application Features:**

1. Read and write configuration from/to a text file.
2. Simple command-line interface.
3. Supports CRUD operations for configurations.

## Part 8: Lesson Summary (5 minutes)

**What we've learned**

- The concept and use of HashMaps in Rust
- Basic operations: insert, retrieve, update, remove
- Handling ownership and borrowing
- Updating values based on old values
- Understanding hash functions and Rust's safety guarantees
- Practice with real-world applications

**Homework**

1. Extend the word counting application:

   - Add features to compare two texts.
   - Filter out stop words.
   - Analyze frequency by word length.

2. Enhance the configuration management app:
   - Support hierarchical configurations.
   - Add JSON import/export features.
   - Add data type validation.

**References**

- Rust Book: <https://doc.rust-lang.org/book/ch08-03-hash-maps.html>
- Rust by Example: <https://doc.rust-lang.org/rust-by-example/std/hash.html>
- Rust std::collections: <https://doc.rust-lang.org/std/collections/index.html>

## Conclusion (2 minutes)

**Summary**

- HashMaps are a powerful data structure in Rust.
- Enable efficient data storage and retrieval.
- Intuitive API while still adhering to Rust's ownership rules.
- Numerous practical applications in software development.

**Next Session**

- In the next lesson, we will explore other collections such as BTreeMap, HashSet, and BTreeSet.
- We will also delve deeper into performance optimization when working with collections in Rust.

**Acknowledgments**

- Thank you for following this lesson.
- Please leave your comments or questions below the video.
- Don't forget to like, share, and subscribe so you don't miss the next lessons!
