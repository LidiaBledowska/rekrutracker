# 🔒 Security Testing Checklist
**RekruTracker - Manual Security Validation**

## ✅ Quick Security Test Checklist

### 🎯 **Multi-User Testing (CRITICAL)**
- [ ] **Browser Setup**: Open 2 different browsers (Chrome + Firefox)
- [ ] **User A**: Login in Browser 1, create test applications
- [ ] **User B**: Login in Browser 2, create test applications  
- [ ] **Data Isolation**: User A cannot see User B's applications
- [ ] **Data Isolation**: User B cannot see User A's applications

### 🛡️ **Authorization Testing**
- [ ] **Edit Protection**: User A cannot edit User B's applications
- [ ] **Delete Protection**: User A cannot delete User B's applications
- [ ] **File Upload**: Files uploaded to user-specific paths only
- [ ] **Error Messages**: Proper "Nie masz uprawnień" messages shown

### 🔐 **Authentication Testing**  
- [ ] **Login Required**: Unauthenticated users redirected to login
- [ ] **Session Persistence**: Login state maintained across page reloads
- [ ] **Logout Works**: Logout properly clears session and redirects

### 📁 **Storage Security**
- [ ] **User Paths**: Files stored in `/users/{userId}/applications/{appId}/`
- [ ] **Path Isolation**: Users cannot access other users' file paths
- [ ] **Upload Security**: File uploads verify application ownership

---

## 🧪 **Automated Testing**

**Use the automated test:** Open `security-validation-test.html` in your browser

**Tests included:**
1. ✅ Authentication verification
2. ✅ Data isolation testing  
3. ✅ Cross-user access prevention
4. ✅ Storage path security
5. ✅ Edit/Delete authorization
6. ✅ Unauthenticated access blocking

---

## 🚨 **Critical Test Scenarios**

### **Scenario 1: ID Manipulation Attack**
1. User A creates application (note the ID)
2. User B tries to access via URL manipulation or direct DB access
3. **Expected Result**: "Nie masz uprawnień" error

### **Scenario 2: File Access Attack** 
1. User A uploads files to application
2. User B tries to access User A's file URLs
3. **Expected Result**: Access denied or 403 error

### **Scenario 3: Edit Form Attack**
1. User A opens edit modal for their application
2. User B somehow gets application ID and tries to edit
3. **Expected Result**: Ownership verification blocks access

---

## ✅ **Success Criteria**

**🟢 SECURE** - All tests pass:
- Data is properly isolated by user
- All operations verify ownership
- No cross-user data access possible
- Error messages don't leak information

**🔴 CRITICAL ISSUE** - Any test fails:
- Immediate review required
- Do not deploy to production
- Fix issues before proceeding

---

## 🎯 **Next Steps After Testing**

1. **✅ All tests pass** → Ready for production deployment
2. **⚠️ Some tests fail** → Review and fix issues first  
3. **📋 Document results** → Update security audit with test results

---

**Testing Date**: ___________  
**Tested By**: ___________  
**Results**: ___________
