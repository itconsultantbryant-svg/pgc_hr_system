ALTER TABLE "job_seeker_profiles"
ADD COLUMN "profilePictures" TEXT[] DEFAULT ARRAY[]::TEXT[];
