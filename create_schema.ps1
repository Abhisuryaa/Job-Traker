$schema = @'
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String        @id @default(cuid())
  email         String        @unique
  name          String?
  password      String
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  applications  Application[]
}

model Application {
  id           String     @id @default(cuid())
  company      String
  position     String
  status       String     // e.g., "APPLIED", "INTERVIEWING", "REJECTED", "ACCEPTED"
  appliedDate  DateTime   @default(now())
  responseDate DateTime?
  notes        String?
  url          String?
  salary       String?
  location     String?
  userId       String
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  reminders    Reminder[]
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model Reminder {
  id            String      @id @default(cuid())
  description   String
  dueDate       DateTime
  completed     Boolean     @default(false)
  applicationId String
  application   Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}
'@

Set-Content -Path "prisma/schema.prisma" -Value $schema 