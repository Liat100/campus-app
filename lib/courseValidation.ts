import { Course } from "@/lib/types";
import { courseSchema } from "@/lib/types";

export function getMissingMandatoryFields(course: Partial<Course>): string[] {
  const missing: string[] = [];

  // Validate using Zod schema
  const result = courseSchema.safeParse(course);
  
  if (!result.success) {
    result.error.errors.forEach((error) => {
      const fieldName = getFieldHebrewName(error.path[0] as string);
      if (fieldName) {
        missing.push(fieldName);
      }
    });
  }

  // Additional business logic validations
  if (course.nameChangeRequired && !course.newName) {
    missing.push("שם חדש (נדרש כאשר נדרש שינוי שם)");
  }

  if (course.type === "certificate") {
    if (!course.gradingPercentages && !course.gradingFile) {
      missing.push("מודל ציונים (חובה לקורס עם תעודה)");
    }
    if (course.clientLogoRequired && !course.clientLogo) {
      missing.push("לוגו לקוח (חובה לקורס עם תעודה)");
    }
    if (!course.signerRole) {
      missing.push("תפקיד החותם (חובה לקורס עם תעודה)");
    }
    if (!course.signerName) {
      missing.push("שם החותם (חובה לקורס עם תעודה)");
    }
    if (!course.certificateSignature) {
      missing.push("חתימה על התעודה (חובה לקורס עם תעודה)");
    }
  }

  if (course.syllabusRequired) {
    if (!course.learningHours && !course.syllabusFile) {
      missing.push("פירוט תכנית הלימודים (חובה כאשר תכנית לימודים נדרשת)");
    }
  }

  // Home page option validation
  const validHomePageOptions = ["homePageFile", "aboutFile", "aboutLink"];
 if (!course.homePageOption || 
    typeof course.homePageOption !== "string" ||
      !validHomePageOptions.includes(course.homePageOption)) {
    missing.push("בחירה בעמוד הבית (חובה לבחור אחת מהאפשרויות)");
  } else {
    // For file upload options, check if courseFolderLink exists (user can click "פתח תיקיית קורס")
    if (course.homePageOption === "homePageFile" && (!course.courseFolderLink || course.courseFolderLink === "")) {
      missing.push("קובץ פרטי עמוד הבית (חובה כאשר נבחרה אפשרות זו)");
    }
    if (course.homePageOption === "aboutFile" && (!course.courseFolderLink || course.courseFolderLink === "")) {
      missing.push("קובץ עמוד אודות (חובה כאשר נבחרה אפשרות זו)");
    }
    // For link option, check if aboutPageLink is filled
    if (course.homePageOption === "aboutLink" && (!course.aboutPageLink || course.aboutPageLink === "")) {
      missing.push("קישור עמוד אודות (חובה כאשר נבחרה אפשרות זו)");
    }
  }

  // Marketing images validation
  if (!course.marketingImagesAvailable) {
    missing.push("תמונות שיווקיות (חובה לסמן)");
  }

  // Support contact validation
  if (!course.supportContact) {
    missing.push("פרטי לשונית תמיכה (חובה למלא)");
  }

  // Surveys validation
  if (!course.surveysAdded) {
    missing.push("הוספת סקרי משוב (חובה לסמן)");
  }

  return missing;
}

function getFieldHebrewName(field: string): string | null {
  const fieldMap: Record<string, string> = {
    name: "שם הקורס",
    type: "סוג קורס",
    nameChangeRequired: "האם נדרש שינוי שם",
    newName: "שם חדש",
    aboutFile: "קובץ אודות",
    syllabusRequired: "תכנית לימודים נדרשת",
    learningHours: "שעות למידה",
    syllabusFile: "קובץ תכנית לימודים",
    surveysAdded: "סקרים נוספו",
    gradingPercentages: "אחוזי ציונים",
    gradingFile: "קובץ מודל ציונים",
    marketingImagesAvailable: "תמונות שיווק זמינות",
    marketingImagesLink: "קישור תמונות שיווק",
    clientLogoRequired: "לוגו לקוח נדרש",
    clientLogo: "לוגו לקוח",
    signerRole: "תפקיד החותם",
    signerName: "שם החותם",
    certificateSignature: "חתימה תעודה",
    supportContact: "יצירת קשר תמיכה",
  };
  return fieldMap[field] || null;
}

export function isCourseReadyForLaunch(course: Partial<Course>): boolean {
  return getMissingMandatoryFields(course).length === 0;
}
