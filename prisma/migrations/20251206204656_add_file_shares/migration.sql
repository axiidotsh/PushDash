-- CreateTable
CREATE TABLE "file_share" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sharedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_share_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "file_share_fileId_idx" ON "file_share"("fileId");

-- CreateIndex
CREATE INDEX "file_share_email_idx" ON "file_share"("email");

-- CreateIndex
CREATE UNIQUE INDEX "file_share_fileId_email_key" ON "file_share"("fileId", "email");

-- AddForeignKey
ALTER TABLE "file_share" ADD CONSTRAINT "file_share_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE CASCADE;
