# Testing Account Deletion

## Current Status
- ✅ Server is running on port 5001
- ✅ Supabase auth router is loaded and working
- ✅ Delete account endpoint exists and responds to requests
- ✅ Authentication middleware is in place

## Debugging Steps

### 1. Check Server Status
```bash
curl http://localhost:5001/health
```

### 2. Test Supabase Auth Router
```bash
curl http://localhost:5001/api/supabase-auth/test
```

### 3. Test Delete Endpoint (without auth)
```bash
curl -X DELETE http://localhost:5001/api/supabase-auth/delete-account
```
Expected: `{"message":"Authorization header required"}`

### 4. Test with Invalid Token
```bash
curl -X DELETE http://localhost:5001/api/supabase-auth/delete-account \
  -H "Authorization: Bearer invalid-token"
```
Expected: `{"message":"Invalid or expired token"}`

## Client-Side Testing

1. **Open browser console** when testing account deletion
2. **Look for debug messages**:
   - "Deleting account with server URL: http://localhost:5001"
   - "Session token available: true"

3. **Check network tab** for the actual request to `/api/supabase-auth/delete-account`

## Common Issues

### Issue: "API endpoint not found"
- **Cause**: Server not running or wrong URL
- **Solution**: Ensure server is running on port 5001

### Issue: "Authorization header required"
- **Cause**: Session token not being sent
- **Solution**: Check if user is properly logged in

### Issue: "Invalid or expired token"
- **Cause**: Token verification failing
- **Solution**: Check Supabase configuration

## Production Testing

For production, the server URL should be:
- `https://shopnsplit.vercel.app` (not `shop-nsplit.vercel.app`)

## Next Steps

1. Try deleting an account in the browser
2. Check browser console for debug messages
3. Check server console for authentication logs
4. Report any specific error messages 