-- CreateTable
CREATE TABLE "FailedJobs" (
    "id" SERIAL NOT NULL,
    "jobId" TEXT NOT NULL,
    "queue" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "failedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FailedJobs_pkey" PRIMARY KEY ("id")
);
