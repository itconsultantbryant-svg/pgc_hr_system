CREATE TABLE "job_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "job_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "job_categories_name_key" ON "job_categories"("name");
