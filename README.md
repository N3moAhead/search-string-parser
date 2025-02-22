
# Search String Parser

This repository contains a small program designed to parse a search string into an Abstract Syntax Tree (AST) or, for example, transform it into SQL.

## Problem Statement

The primary motivation behind this project is to provide users with a precise and efficient way to perform searches. Traditional search implementations often rely on multiple filters and select inputs, which can be cumbersome and inefficient, especially for developers who prefer keyboard-driven workflows over mouse interactions.

To address this, I developed a simple parser that allows users to construct search queries in a concise and readable format, such as:

```
firstName=Lukas or firstName=Brian and lastName=Mueller
```

## Features

- Supports logical operators `and` and `or` to combine statements.
- Each statement consists of:
  - An **identifier** (e.g., `firstName`)
  - An **operator** (e.g., `=`, `~`, `:`)
  - A **value** (e.g., `n3mo`)
- Operators include:
  - `=` (exact match)
  - `~` (regex match)
  - `:` (partial match, similar to SQL `LIKE`)

## Current Status

This project is not intended to be a fully developed library. If you find it useful, feel free to copy and modify the code as needed.

### Security Notice
Currently, there are no built-in security measures, so use it cautiously, especially in production environments.

### Future Improvements
- Implementing robust error handling and descriptive error messages.
- Enhancing security and input validation.
- Optimizing parsing efficiency.

## Grammar Definition

The parsing logic follows a simple top-down approach and adheres to the following grammar:

```
expression    := andStatement "or" expression
                 | andStatement
andStatement  := statement "and" andStatement
                 | statement
statement     := identifier operator value
                 | ""
identifier    := ALPHANUMERIC STRING
operator      := "="
                 | "~"
                 | ":"
value         := ALPHANUMERIC STRING
```

While this implementation is not yet production-ready, it serves as a good foundation for further development.
