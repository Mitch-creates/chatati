-- Deduplicate ContactRequest: keep earliest per (senderId, recipientId), delete rest
DELETE FROM "ContactRequest" a
USING "ContactRequest" b
WHERE a."senderId" = b."senderId"
  AND a."recipientId" = b."recipientId"
  AND (a."createdAt" > b."createdAt" OR (a."createdAt" = b."createdAt" AND a.id > b.id));

-- CreateIndex
CREATE UNIQUE INDEX "ContactRequest_senderId_recipientId_key" ON "ContactRequest"("senderId", "recipientId");
