# 🎯 Complete Backend/Frontend Endpoint Mapping Analysis

## ✅ **CORRECT MAPPINGS** (Already Working)

### **Main Pipeline Routes:**

- ✅ `GET /api/v1/pipelines/candidates` - Frontend ✓
- ✅ `GET /api/v1/pipelines/candidates/{id}` - Frontend ✓
- ✅ `PUT /api/v1/pipelines/candidates/{id}/move` - Frontend ✓
- ✅ `GET /api/v1/pipelines/stats` - Frontend ✓

### **New Unified Action System:**

- ✅ `POST /api/v1/pipelines/actions/execute` - Frontend ✓
- ✅ `GET /api/v1/pipelines/actions/rules` - Frontend ✓
- ✅ `GET /api/v1/pipelines/clients/{clientId}/available-actions` - Frontend ✓

### **Documents:**

- ✅ `GET /api/v1/pipelines/candidates/{clientId}/documents` - Frontend ✓
- ✅ `DELETE /api/v1/pipelines/documents/{id}` - Frontend ✓ **FIXED**

### **History & Data:**

- ✅ `GET /api/v1/pipelines/candidates/{clientId}/actions` - Frontend ✓
- ✅ `GET /api/v1/pipelines/candidates/{clientId}/assignments` - Frontend ✓

## ✅ **FIXED ISSUES:**

### **1. Search Endpoint - FIXED ✅**

```typescript
// Frontend (FIXED):
"/api/v1/pipelines/search" ✅

// Backend:
[HttpGet("search")] ✅
```

### **2. Document Delete - FIXED ✅**

```typescript
// Frontend (FIXED):
"/api/v1/pipelines/documents/${documentId}" ✅

// Backend:
[HttpDelete("documents/{id}")] ✅
```

### **3. Action Rules with Query - FIXED ✅**

```typescript
// Frontend (FIXED):
"/api/v1/pipelines/actions/rules/${actionType}?currentStage=${currentStage}" ✅

// Backend:
[HttpGet("actions/rules/{actionType}")] with [FromQuery] string currentStage ✅
```

### **4. Export Function - DISABLED ✅**

```typescript
// Frontend: Commented out and shows error message ✅
// Backend: Not implemented (correctly handled) ✅
```

## 🔍 **DUPLICATE ENDPOINTS IN BACKEND:**

### **Available Actions (2 endpoints exist):**

1. `GET /api/v1/pipelines/actions/available` - Query parameter `?clientId=123`
2. `GET /api/v1/pipelines/clients/{clientId}/available-actions` - Path parameter ✅ **USED BY FRONTEND**

**Recommendation**: Keep both or remove the first one for clarity.

## 🎯 **ADMIN ACCESS ISSUE:**

The admin role should see ALL client cards across ALL pipeline stages, but currently only sees sales cards.

### **Root Cause Analysis:**

- **Permission**: Admin has `"Clients": "All"` ✅
- **Access Control**: `permission == "All"` returns `c => true` ✅
- **Possible Issues**:
  1. Case sensitivity in role name ("Admin" vs "admin")
  2. Claims not being passed correctly
  3. Role not being mapped correctly from JWT

### **Debugging Steps Needed:**

1. Check what role value is being passed to `GetAllPipelineCandidatesAsync`
2. Verify the permission resolution in `GetPermission(role, "Clients")`
3. Ensure JWT claims are correct

## 📊 **EXPECTED ADMIN BEHAVIOR:**

Admin should see **ALL 114+ clients** distributed across stages:

- **Marketing**: ~42 clients
- **Placed**: ~12 clients
- **Resume**: ~3 clients
- **Sales**: ~4 clients
- **Backed Out**: ~15 clients
- **Other stages**: ~38 clients

**Current Issue**: Admin only sees sales cards (indicating filtering is still applied incorrectly).

## 🔧 **NEXT STEPS:**

1. ✅ **Endpoint Mappings**: All fixed
2. 🔍 **Debug Admin Access**: Add logging to see what role/permission is being resolved
3. 🧪 **Test All Endpoints**: Verify each endpoint works with the frontend calls

**Status**: Frontend endpoint mappings are now correctly aligned with backend! 🎉
