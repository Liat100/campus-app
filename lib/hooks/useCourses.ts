"use client";

import { useState, useEffect, useCallback } from "react";
import { Course } from "@/lib/types";

const STORAGE_KEY = "campus-courses";

// Helper functions for localStorage (backup/cache)
function getCoursesFromStorage(): Course[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return parsed.map((course: any) => ({
        ...course,
        createdAt: course.createdAt ? new Date(course.createdAt) : undefined,
        courseLaunchDate: course.courseLaunchDate ? new Date(course.courseLaunchDate) : undefined,
      }));
    }
  } catch (error) {
    console.error("Error reading courses from localStorage:", error);
  }

  return [];
}

function saveCoursesToStorage(courses: Course[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  } catch (error) {
    console.error("Error saving courses to localStorage:", error);
  }
}

// Helper function to fetch courses from API
async function fetchCoursesFromAPI(): Promise<Course[]> {
  try {
    const response = await fetch("/api/courses", {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.statusText}`);
    }
    const courses = await response.json();
    return courses || [];
  } catch (error) {
    console.error("Error fetching courses from API:", error);
    throw error;
  }
}

// Helper function to save courses to API
async function saveCoursesToAPI(courses: Course[]): Promise<void> {
  try {
    console.log(`[saveCoursesToAPI] Attempting to save ${courses.length} courses to API`);
    console.log(`[saveCoursesToAPI] Course names:`, courses.map(c => c.name));
    
    const response = await fetch("/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courses),
    });

    console.log(`[saveCoursesToAPI] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[saveCoursesToAPI] Error response:`, errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || `Failed to save courses: ${response.statusText}` };
      }
      
      throw new Error(errorData.error || `Failed to save courses: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    console.log(`[saveCoursesToAPI] Successfully saved courses:`, responseData);
  } catch (error) {
    console.error("[saveCoursesToAPI] Error saving courses to API:", error);
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      console.error("[saveCoursesToAPI] Network error - is the server running?");
    }
    throw error;
  }
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch courses from API on mount (primary source of truth)
  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true);
      try {
        // 1. נסיון לקבל נתונים מה-API (השרת)
        const apiCourses = await fetchCoursesFromAPI();
        
        // אם ה-API הצליח, אנחנו משתמשים רק בו ומעדכנים את הגיבוי המקומי
          setCourses(apiCourses);
          saveCoursesToStorage(apiCourses);
        
      } catch (error) {
        console.error("Failed to load from API, using local backup:", error);
        // רק אם השרת נפל לגמרי, נשתמש במה שיש במחשב
        const cachedCourses = getCoursesFromStorage();
        if (cachedCourses.length > 0) {
        setCourses(cachedCourses);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  // Get all courses
  const getAllCourses = useCallback((): Course[] => {
    return courses;
  }, [courses]);

  // Get a single course by ID
  const getCourseById = useCallback(
    (id: number): Course | undefined => {
      return courses.find((course) => course.id === id);
    },
    [courses]
  );

  // Create a new course
  const createCourse = useCallback(
    async (courseData: Omit<Course, "id" | "createdAt">): Promise<Course> => {
      console.log("[createCourse] Creating new course with data:", courseData);
      
      const newCourse: Course = {
        ...courseData,
        id: Date.now(), // Simple ID generation
        createdAt: new Date(),
      };

      let updatedCourses: Course[] = [];
      
      // Use functional update to get the latest courses state
      setCourses((currentCourses) => {
        updatedCourses = [...currentCourses, newCourse];
        // Save to localStorage immediately
        saveCoursesToStorage(updatedCourses);
        return updatedCourses;
      });

      try {
        // Save to API (primary source of truth)
        console.log(`[createCourse] Saving ${updatedCourses.length} courses to API...`);
        await saveCoursesToAPI(updatedCourses);
        console.log("[createCourse] Course created and saved to API:", newCourse);
      } catch (error) {
        console.error("[createCourse] Failed to save course to API:", error);
        // Reload from API to get correct state
        try {
          const apiCourses = await fetchCoursesFromAPI();
          setCourses(apiCourses);
          saveCoursesToStorage(apiCourses);
        } catch (reloadError) {
          console.error("[createCourse] Failed to reload from API:", reloadError);
        }
        throw error;
      }

      return newCourse;
    },
    [] // No dependencies - uses functional update
  );

  // Update an existing course
  const updateCourse = useCallback(
    async (id: number, courseData: Partial<Course>): Promise<Course | null> => {
      console.log(`[updateCourse] Updating course ${id} with data:`, courseData);
      
      let updatedCourse: Course | null = null;
      let updatedCourses: Course[] = [];
      
      // Use functional update to get the latest courses state
      setCourses((currentCourses) => {
        const courseIndex = currentCourses.findIndex((course) => course.id === id);

        if (courseIndex === -1) {
          console.error(`[updateCourse] Course with id ${id} not found`);
          return currentCourses;
        }

        updatedCourse = {
          ...currentCourses[courseIndex],
          ...courseData,
          id, // Ensure ID doesn't change
        };

        updatedCourses = [...currentCourses];
        updatedCourses[courseIndex] = updatedCourse;
        
        // Save to localStorage immediately
        saveCoursesToStorage(updatedCourses);
        
        return updatedCourses;
      });

      if (!updatedCourse) {
        console.error(`[updateCourse] Could not find course ${id}`);
        return null;
      }

      try {
        // Save to API (primary source of truth)
        console.log(`[updateCourse] Saving ${updatedCourses.length} courses to API...`);
        await saveCoursesToAPI(updatedCourses);
        console.log("[updateCourse] Course updated and saved to API:", updatedCourse);
      } catch (error) {
        console.error("[updateCourse] Failed to update course in API:", error);
        // Reload from API to get correct state
        try {
          const apiCourses = await fetchCoursesFromAPI();
          setCourses(apiCourses);
          saveCoursesToStorage(apiCourses);
        } catch (reloadError) {
          console.error("[updateCourse] Failed to reload from API:", reloadError);
        }
        throw error;
      }

      return updatedCourse;
    },
    [] // No dependencies - uses functional update
  );

  // Delete a course
  const deleteCourse = useCallback(
    async (id: number): Promise<boolean> => {
      console.log(`[deleteCourse] Deleting course ${id}`);
      
      let updatedCourses: Course[] = [];
      let courseFound = false;
      
      // Use functional update to get the latest courses state
      setCourses((currentCourses) => {
        const courseIndex = currentCourses.findIndex((course) => course.id === id);

        if (courseIndex === -1) {
          console.error(`[deleteCourse] Course with id ${id} not found`);
          return currentCourses;
        }

        courseFound = true;
        updatedCourses = currentCourses.filter((course) => course.id !== id);
        
        // Save to localStorage immediately
        saveCoursesToStorage(updatedCourses);
        
        return updatedCourses;
      });

      if (!courseFound) {
        console.error(`[deleteCourse] Course ${id} not found`);
        return false;
      }

      try {
        // Save to API (primary source of truth)
        console.log(`[deleteCourse] Saving ${updatedCourses.length} courses to API...`);
        await saveCoursesToAPI(updatedCourses);
        console.log("[deleteCourse] Course deleted and saved to API:", id);
      } catch (error) {
        console.error("[deleteCourse] Failed to delete course from API:", error);
        // Reload from API to get correct state
        try {
          const apiCourses = await fetchCoursesFromAPI();
          setCourses(apiCourses);
          saveCoursesToStorage(apiCourses);
        } catch (reloadError) {
          console.error("[deleteCourse] Failed to reload from API:", reloadError);
        }
        throw error;
      }

      return true;
    },
    [] // No dependencies - uses functional update
  );

  return {
    courses,
    isLoading,
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
  };
}
