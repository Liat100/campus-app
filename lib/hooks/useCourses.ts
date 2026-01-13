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
    const response = await fetch("/api/courses");
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
    const response = await fetch("/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courses),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to save courses: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error saving courses to API:", error);
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
      const newCourse: Course = {
        ...courseData,
        id: Date.now(), // Simple ID generation
        createdAt: new Date(),
      };

      const updatedCourses = [...courses, newCourse];
      
      // Optimistic update
      setCourses(updatedCourses);
      saveCoursesToStorage(updatedCourses);

      try {
        // Save to API (primary source of truth)
        await saveCoursesToAPI(updatedCourses);
        console.log("Course created and saved to API:", newCourse);
      } catch (error) {
        console.error("Failed to save course to API:", error);
        // Revert optimistic update on error
        setCourses(courses);
        throw error;
      }

      return newCourse;
    },
    [courses]
  );

  // Update an existing course
  const updateCourse = useCallback(
    async (id: number, courseData: Partial<Course>): Promise<Course | null> => {
      const courseIndex = courses.findIndex((course) => course.id === id);

      if (courseIndex === -1) {
        console.error(`Course with id ${id} not found`);
        return null;
      }

      const updatedCourse: Course = {
        ...courses[courseIndex],
        ...courseData,
        id, // Ensure ID doesn't change
      };

      const updatedCourses = [...courses];
      updatedCourses[courseIndex] = updatedCourse;
      
      // Optimistic update
      const previousCourses = [...courses];
      setCourses(updatedCourses);
      saveCoursesToStorage(updatedCourses);

      try {
        // Save to API (primary source of truth)
        await saveCoursesToAPI(updatedCourses);
        console.log("Course updated and saved to API:", updatedCourse);
      } catch (error) {
        console.error("Failed to update course in API:", error);
        // Revert optimistic update on error
        setCourses(previousCourses);
        saveCoursesToStorage(previousCourses);
        throw error;
      }

      return updatedCourse;
    },
    [courses]
  );

  // Delete a course
  const deleteCourse = useCallback(
    async (id: number): Promise<boolean> => {
      const courseIndex = courses.findIndex((course) => course.id === id);

      if (courseIndex === -1) {
        console.error(`Course with id ${id} not found`);
        return false;
      }

      const updatedCourses = courses.filter((course) => course.id !== id);
      
      // Optimistic update
      const previousCourses = [...courses];
      setCourses(updatedCourses);
      saveCoursesToStorage(updatedCourses);

      try {
        // Save to API (primary source of truth)
        await saveCoursesToAPI(updatedCourses);
        console.log("Course deleted and saved to API:", id);
      } catch (error) {
        console.error("Failed to delete course from API:", error);
        // Revert optimistic update on error
        setCourses(previousCourses);
        saveCoursesToStorage(previousCourses);
        throw error;
      }

      return true;
    },
    [courses]
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
