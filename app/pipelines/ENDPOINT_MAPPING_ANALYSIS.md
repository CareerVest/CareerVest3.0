# 🔍 Backend/Frontend Endpoint Mapping Analysis

## ✅ **EXISTING Backend Endpoints** (From PipelineApiController.cs)

### **Main Pipeline Routes:**
- `GET /api/v1/pipelines/candidates` ✅ **USED BY FRONTEND**
- `GET /api/v1/pipelines/candidates/{id}` ✅ **USED BY FRONTEND** 
- `PUT /api/v1/pipelines/candidates/{id}/move` ✅ **MATCHES BACKEND**
- `GET /api/v1/pipelines/stats` ✅ **USED BY FRONTEND**
- `GET /api/v1/pipelines/search` ❌ **FRONTEND MISMATCH**

### **Action System (New Unified):**
- `POST /api/v1/pipelines/actions/execute` ✅ **USED BY FRONTEND**
- `GET /api/v1/pipelines/actions/rules` ✅ **USED BY FRONTEND**
- `GET /api/v1/pipelines/actions/rules/{actionType}` ❌ **FRONTEND MISMATCH**
- `GET /api/v1/pipelines/clients/{clientId}/available-actions` ✅ **USED BY FRONTEND**

### **Documents:**
- `GET /api/v1/pipelines/candidates/{clientId}/documents` ✅ **USED BY FRONTEND**
- `POST /api/v1/pipelines/documents` ❌ **NOT USED BY FRONTEND**
- `DELETE /api/v1/pipelines/documents/{id}` ❌ **FRONTEND MISMATCH**

### **Actions & History:**
- `GET /api/v1/pipelines/candidates/{clientId}/actions` ✅ **USED BY FRONTEND**
- `POST /api/v1/pipelines/actions` ❌ **NOT USED BY FRONTEND**
- `POST /api/v1/pipelines/transitions` ❌ **NOT USED BY FRONTEND**

### **Assignments & Transitions:**
- `GET /api/v1/pipelines/candidates/{clientId}/assignments` ✅ **USED BY FRONTEND**
- `GET /api/v1/pipelines/candidates/{clientId}/transitions` ❌ **NOT USED BY FRONTEND**
- `POST /api/v1/pipelines/assignments` ❌ **NOT USED BY FRONTEND**
- `POST /api/v1/pipelines/stage-transitions` ❌ **NOT USED BY FRONTEND**

## ❌ **FRONTEND ENDPOINT MISMATCHES:**

### **1. Search Endpoint Mismatch:**
```typescript
// Frontend (WRONG):
"/api/v1/pipelines/candidates/search" 

// Backend (CORRECT):
"/api/v1/pipelines/search"
```

### **2. Document Delete Mismatch:**
```typescript
// Frontend (WRONG):
"/api/v1/pipelines/candidates/documents/${documentId}"

// Backend (CORRECT):
"/api/v1/pipelines/documents/${id}"
```

### **3. Action Rules Endpoint Mismatch:**
```typescript
// Frontend (WRONG):
"/api/v1/pipelines/rules/${actionType}/${currentStage}"

// Backend (CORRECT):
"/api/v1/pipelines/actions/rules/${actionType}?currentStage=${currentStage}"
```

### **4. Missing/Incorrect Endpoints:**
```typescript
// Frontend calls that don't exist in backend:
"/api/v1/pipelines/candidates/export" ❌ NOT IN BACKEND
```

## 🔧 **Required Frontend Fixes:**

1. **Search URL**: Change to `/api/v1/pipelines/search`
2. **Document Delete URL**: Change to `/api/v1/pipelines/documents/${id}`  
3. **Action Rules URL**: Change to `/api/v1/pipelines/actions/rules/${actionType}?currentStage=${currentStage}`
4. **Remove Export Call**: Not implemented in backend

## 🎯 **Admin Access Issue:**

The admin role has `"Clients": "All"` permission which should return all clients, but there might be an issue with:
1. Role name case sensitivity ("Admin" vs "admin")
2. Access control filter not being applied correctly

**Admin should see ALL client cards in ALL stages, not just sales!**
