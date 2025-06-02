# Firebase Storage Rules Configuration

## Current Issue
Image uploads are getting stuck at "Uploading file..." step. This is typically caused by Firebase Storage security rules that don't allow the upload operation.

## Required Firebase Storage Rules

To fix the image upload issue, you need to update your Firebase Storage security rules in the Firebase Console.

### Step 1: Access Firebase Console
1. Go to https://console.firebase.google.com/
2. Select your project: `rekrutracker-app`
3. Click on "Storage" in the left sidebar
4. Click on the "Rules" tab

### Step 2: Update Storage Rules

Replace the current rules with these updated rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload and read their own files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Legacy path support for existing files (if any)
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && resource == null; // Only allow new files
    }
    
    // Test uploads path (can be removed after testing)
    match /test-uploads/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 3: Deploy the Rules
1. Click "Publish" to deploy the new rules
2. Wait for the deployment to complete (usually takes a few seconds)

## What These Rules Do

1. **User-specific paths**: `users/{userId}/applications/` - Only the authenticated user can upload to their own folder
2. **Security**: Files are isolated per user using their Firebase Auth UID
3. **Read access**: Authenticated users can read their own files
4. **Write access**: Users can only create/update files in their own directory

## Current File Structure
The app uploads files to: `users/{USER_UID}/applications/{filename}`

Example path: `users/abc123def456/applications/1703123456789_0_image.jpg`

## Testing After Rule Update

1. Open the detailed storage test: http://localhost:8000/detailed-storage-test.html
2. Make sure you're logged in
3. Select a test image file
4. Click "Test Direct Upload" 
5. Check the console log for detailed upload progress

## Alternative Storage Configuration

If the above rules don't work, try this more permissive temporary rule for testing:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ Warning**: The alternative rule is less secure and should only be used for testing.

## Common Issues and Solutions

### Issue 1: "Permission denied" error
- **Cause**: Storage rules don't allow the operation
- **Solution**: Update rules as shown above

### Issue 2: "Network error" or timeout
- **Cause**: Large files or slow connection
- **Solution**: Implement file size limits (current limit: 5MB)

### Issue 3: "Invalid bucket" error  
- **Cause**: Wrong storage bucket name in config
- **Solution**: Verify bucket name in Firebase Console matches config

### Issue 4: User not authenticated
- **Cause**: User authentication expired or not properly set
- **Solution**: Check authentication state before upload

## Current Configuration Status

✅ Firebase v10 modular syntax - COMPLETED
✅ Storage modules imported - COMPLETED  
✅ User authentication - COMPLETED
❓ Storage rules - NEEDS VERIFICATION
❓ Upload permissions - NEEDS TESTING

## Next Steps

1. Update Firebase Storage rules as shown above
2. Test upload with detailed-storage-test.html
3. If successful, test the main application
4. Remove test files after successful verification
