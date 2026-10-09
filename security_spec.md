# Security Specification - RDO Inteligente

## 1. Data Invariants
- An unauthenticated user must NEVER read or write any company, work, teamMember, rdo, document, or user profile.
- A user can only access and modify data within the scope of their organization or assigned works.
- Users with role 'Visualizador' can only read records, never create, update, or delete.
- Users with role 'Editor' can create, edit, and finalize records.
- User profiles can only be written by the authenticated user matching the userId path.
- Immutable fields like `createdBy` and `createdAt` cannot be modified once set.
- RDO reports must reference a valid work and have non-negative sequential numbers.

## 2. The Dirty Dozen Payloads (Rejection Scenarios)
1. Unauthenticated read attempt on `/rdos/{rdoId}` -> REJECT (Missing Auth).
2. Unauthenticated write attempt on `/works/{workId}` -> REJECT (Missing Auth).
3. Visualizador user attempting to create an RDO -> REJECT (Role restriction).
4. Visualizador user attempting to delete a work -> REJECT (Role restriction).
5. User modifying another user's profile at `/users/{otherUserId}` -> REJECT (Owner mismatch).
6. Modifying immutable `createdBy` on an RDO -> REJECT (Immutable field).
7. Injecting oversized junk payload (>1MB) into RDO fields -> REJECT (Size bounds).
8. Creating a work with missing required fields (e.g. without `name` or `code`) -> REJECT (Schema violation).
9. Creating an RDO with negative `sequentialNumber` -> REJECT (Validation failed).
10. Creating a company with invalid/spoofed creator ID -> REJECT (Auth mismatch).
11. Modifying finalized RDO status to arbitrary string -> REJECT (Enum violation).
12. Attempting to blanket query without authentication -> REJECT (Catch-all deny).

## 3. Test Runner Invariant
All operations must pass through authenticated security gates with valid ABAC rules and schema compliance.
