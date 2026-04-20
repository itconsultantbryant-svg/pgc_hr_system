CREATE TABLE "job_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "job_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "job_categories_name_key" ON "job_categories"("name");

INSERT INTO "job_categories" ("id", "name", "isActive", "createdAt", "updatedAt") VALUES
('cat-healthcare', 'Healthcare', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-construction', 'Construction', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-security', 'Security', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-driver-logistics', 'Driver & Logistics', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-cleaning-housekeeping', 'Cleaning & Housekeeping', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-customer-service', 'Customer Service', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-sales-marketing', 'Sales & Marketing', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-admin-office', 'Admin & Office Support', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-information-technology', 'Information Technology', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-education-training', 'Education & Training', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-engineering-technical', 'Engineering & Technical', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-finance-accounting', 'Finance & Accounting', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
