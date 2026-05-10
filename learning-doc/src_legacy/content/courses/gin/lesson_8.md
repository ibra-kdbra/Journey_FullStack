# Lesson 8: File Upload and Download with Gin Framework

## 🎯 Lesson Objectives

After this lesson, students will:

- Clearly understand the file upload and download mechanisms in the Gin Framework.
- Know how to handle single file and multiple file uploads.
- Understand and apply file validation techniques (file type, size).
- Know how to create an API that allows users to download files and stream large files efficiently.
- Master how to organize source code according to standard Gin project structure.
- Be able to build a simple, realistic file management API.

## 📝 Detailed Content

### 1. Concepts of File Upload in Web APIs

**File Upload** is the process of sending files from a client (browser or application) to a server for storage or processing. In HTTP, file uploads typically use the POST or PUT method with `multipart/form-data` encoding.

- **multipart/form-data**: A data type specifically used for sending files and other form fields to a server.
- In Gin, we use `Context.FormFile()` to retrieve a file from a request.

### 2. Concepts of File Download and Streaming

**File Download** occurs when a server sends a file to a client for storage or processing.

- For small files, the entire file can be read and returned.
- For large files or multimedia, **streaming** techniques should be used to avoid excessive memory consumption.
- Gin supports sending files via `Context.File()` or `Context.FileAttachment()`.

### 3. Project Structure According to Requirements

```
├── cmd/
│   └── main.go         # Application entry point
├── internal/
│   ├── handlers/
│   │   └── file.go     # File upload/download handling
│   ├── models/         # (Not used in this lesson)
├── go.mod
└── go.sum
```

### 4. Practical Examples with Detailed Explanations

#### 4.1 Single File Upload

- Retrieve the file from the form field named `"file"` via `c.FormFile("file")`.
- Validate the file (e.g., size, format).
- Save the file to a temporary or permanent storage directory.
- Return a success notification response.

#### 4.2 Multiple Files Upload

- Retrieve the list of files via `c.MultipartForm()`.
- Iterate through each file, validate, and save.
- Return a response containing the list of uploaded files.

#### 4.3 File Download

- Retrieve the filename from the URL or query parameter.
- Check if the file exists on the server.
- Use `c.File()` or `c.FileAttachment()` to send the file to the client.

### 5. Full Sample Code with Standard Structure

#### 5.1 File `cmd/main.go`

```go
package main

import (
    "github.com/gin-gonic/gin"
    "myapp/internal/handlers"
)

func main() {
    r := gin.Default()

    fileGroup := r.Group("/file")
    {
        fileGroup.POST("/upload", handlers.UploadSingleFile)
        fileGroup.POST("/upload-multiple", handlers.UploadMultipleFiles)
        fileGroup.GET("/download/:filename", handlers.DownloadFile)
    }

    r.Run(":8080")
}
```

#### 5.2 File `internal/handlers/file.go`

```go
package handlers

import (
    "fmt"
    "net/http"
    "os"
    "path/filepath"
    "strings"

    "github.com/gin-gonic/gin"
)

const uploadDir = "./uploads"

// validateFileType checks for valid file types (e.g., only allowing jpg, png, gif)
func validateFileType(filename string) bool {
    allowedExt := []string{".jpg", ".jpeg", ".png", ".gif", ".pdf", ".txt"}
    ext := strings.ToLower(filepath.Ext(filename))
    for _, allow := range allowedExt {
        if ext == allow {
            return true
        }
    }
    return false
}

// UploadSingleFile handles single file upload
func UploadSingleFile(c *gin.Context) {
    file, err := c.FormFile("file")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "File was not uploaded or is corrupted"})
        return
    }

    // Validate size (e.g., not exceeding 5MB)
    const maxFileSize = 5 << 20 // 5 MB
    if file.Size > maxFileSize {
        c.JSON(http.StatusBadRequest, gin.H{"error": "File too large, maximum 5MB allowed"})
        return
    }

    // Validate file type
    if !validateFileType(file.Filename) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "File type not allowed"})
        return
    }

    // Create directory if it doesn't exist
    if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
        os.MkdirAll(uploadDir, os.ModePerm)
    }

    // Save file
    dst := filepath.Join(uploadDir, filepath.Base(file.Filename))
    if err := c.SaveUploadedFile(file, dst); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message":  "Upload successful",
        "filename": file.Filename,
        "size":     file.Size,
    })
}

// UploadMultipleFiles handles multiple files upload
func UploadMultipleFiles(c *gin.Context) {
    form, err := c.MultipartForm()
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to retrieve multipart form data"})
        return
    }

    files := form.File["files"] // form field "files"

    if len(files) == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "No files selected for upload"})
        return
    }

    // Create directory if it doesn't exist
    if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
        os.MkdirAll(uploadDir, os.ModePerm)
    }

    var uploaded []string
    for _, file := range files {
        if file.Size > (5 << 20) {
            c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("File %s is too large", file.Filename)})
            return
        }

        if !validateFileType(file.Filename) {
            c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("File %s has an invalid type", file.Filename)})
            return
        }

        dst := filepath.Join(uploadDir, filepath.Base(file.Filename))
        if err := c.SaveUploadedFile(file, dst); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save file %s", file.Filename)})
            return
        }
        uploaded = append(uploaded, file.Filename)
    }

    c.JSON(http.StatusOK, gin.H{
        "message":        "Multiple files uploaded successfully",
        "filenames":      uploaded,
        "total_uploaded": len(uploaded),
    })
}

// DownloadFile handles file download by filename
func DownloadFile(c *gin.Context) {
    filename := c.Param("filename")
    if filename == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Filename cannot be empty"})
        return
    }

    filePath := filepath.Join(uploadDir, filename)
    if _, err := os.Stat(filePath); os.IsNotExist(err) {
        c.JSON(http.StatusNotFound, gin.H{"error": "File does not exist"})
        return
    }

    // Send file directly, client will automatically download it
    c.FileAttachment(filePath, filename)
}
```

## 🏆 Hands-on Exercise with Detailed Solution

### Task

Build a file upload/download management API with the following requirements:

- Endpoint to upload a single file.
- Endpoint to upload multiple files simultaneously.
- Endpoint to list all uploaded files.
- Endpoint to download a file by its name.
- Validate that uploads must be images (jpg, png, gif) and have a maximum size of 3MB.
- Store files in the `uploads` directory.
- Return clear JSON result messages.

### Step-by-step Solution

#### 1. Create a new handler `ListFiles` to list files

```go
func ListFiles(c *gin.Context) {
    files := []string{}

    if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
        c.JSON(http.StatusOK, gin.H{"files": files})
        return
    }

    err := filepath.Walk(uploadDir, func(path string, info os.FileInfo, err error) error {
        if !info.IsDir() {
            files = append(files, info.Name())
        }
        return nil
    })
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to read files directory"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"files": files})
}
```

#### 2. Update `validateFileType` to only allow jpg, png, and gif images

```go
func validateFileType(filename string) bool {
    allowedExt := []string{".jpg", ".jpeg", ".png", ".gif"}
    ext := strings.ToLower(filepath.Ext(filename))
    for _, allow := range allowedExt {
        if ext == allow {
            return true
        }
    }
    return false
}
```

#### 3. Decrease the maximum file size to 3MB

```go
const maxFileSize = 3 << 20 // 3MB
```

#### 4. Update `main.go` to add the new route

```go
fileGroup.GET("/list", handlers.ListFiles)
```

#### 5. Complete code for single file upload (shortened)

```go
func UploadSingleFile(c *gin.Context) {
    file, err := c.FormFile("file")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "File not uploaded or corrupted"})
        return
    }

    if file.Size > maxFileSize {
        c.JSON(http.StatusBadRequest, gin.H{"error": "File too large, max 3MB"})
        return
    }

    if !validateFileType(file.Filename) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Only image files (jpg, png, gif) are allowed"})
        return
    }

    if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
        os.MkdirAll(uploadDir, os.ModePerm)
    }

    dst := filepath.Join(uploadDir, filepath.Base(file.Filename))
    if err := c.SaveUploadedFile(file, dst); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message":  "Upload successful",
        "filename": file.Filename,
        "size":     file.Size,
    })
}
```

### Analysis

- **Breaking down logic:** Small, readable, and maintainable functions.
- **Thorough validation:** File type and size checks.
- **Automatic directory creation:** Prevents errors when the folder doesn't exist.
- **Clear JSON responses:** Helps the client handle the results easily.

## 🔑 Key Points to Remember

- **Multipart/form-data:** Ensure the form is sent with the correct `enctype="multipart/form-data"`.
- **Field matching:** The form field name must match the name used in `c.FormFile("fieldname")` or `form.File["fieldname"]`.
- **Validation:** Always validate file size and format for error prevention and security.
- **Permissions:** The storage directory must have write permissions.
- **Existence check:** When downloading, check if the file exists to avoid 500 errors or data leakage.
- **Filename handling:** Avoid saving files with their original names without sanitization to prevent overwriting or attacks (consider adding a UUID or timestamp).
- **Streaming:** Use streaming for large files to avoid loading the entire content into memory.
- **Server limits:** Maximum upload sizes should align with server (e.g., Nginx) configurations.

## 📝 Homework

### Task

- Build an API for uploading user profile pictures (single file) with these requirements:
  - Only allow jpg and png files.
  - Maximum size of 2MB.
  - Store files in the `profile_pics` directory.
  - Name the saved file on the server using the format: `userID-timestamp.extension` (assume userID is taken from a query parameter).
  - Create an endpoint to retrieve a profile picture by userID.
  - Return the image as a file download.
- Simulate an API client request (e.g., using Postman) to test it.
