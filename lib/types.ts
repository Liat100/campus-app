import { z } from "zod";

// הגדרת מבנה הקורס
export interface Course {
  id: number;
  name: string;
  nameChangeRequired: boolean;
  newName?: string;
  type: "certificate" | "no_certificate";
  homePageOption?: "homePageFile" | "aboutFile" | "aboutLink";
  homePageFile?: string;
  aboutFile?: string;
  aboutPageLink?: string;
  syllabusRequired: boolean;
  learningHours?: string;
  syllabusFile?: string;
  surveysAdded: boolean;
  gradingPercentages?: string;
  gradingFile?: string;
  marketingImagesAvailable: boolean;
  marketingImagesLink?: string;
  clientLogoRequired?: boolean;
  clientLogo?: string;
  signerRole?: string;
  signerName?: string;
  certificateSignature?: string;
  supportContact?: string;
  courseLaunchDate?: Date;
  additionalNotes?: string;
  createdAt?: Date;
}

// סכימה לאימות הנתונים (Validation)
export const courseSchema = z.object({
  name: z.string().min(1, "שם הקורס הוא שדה חובה"),
  type: z.enum(["certificate", "no_certificate"]).default("no_certificate"),
  nameChangeRequired: z.boolean().default(false),
  newName: z.string().optional(),
  aboutFile: z.string().optional(),
  syllabusRequired: z.boolean().default(false),
  learningHours: z.string().optional(),
  surveysAdded: z.boolean().default(false),
  marketingImagesAvailable: z.boolean().default(false),
  marketingImagesLink: z.string().optional(),
  supportContact: z.string().optional(),
});
