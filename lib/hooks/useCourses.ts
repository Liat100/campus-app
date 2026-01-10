"use client";

import { useState, useEffect, useCallback } from "react";
import { Course } from "@/lib/types";
import { courses as initialCourses } from "@/lib/mockData";

const STORAGE_KEY = "campus-courses";

// Helper functions for localStorage
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

function initializeCourses(): Course[] {
  const stored = getCoursesFromStorage();
  
  // If no courses in storage, initialize with mock data
  if (stored.length === 0) {
    saveCoursesToStorage(initialCourses);
    return initialCourses;
  }

  return stored;
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize courses from localStorage on mount
  useEffect(() => {
    const loadedCourses = initializeCourses();
    setCourses(loadedCourses);
    setIsLoading(false);
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
    (courseData: Omit<Course, "id" | "createdAt">): Course => {
      const newCourse: Course = {
        ...courseData,
        id: Date.now(), // Simple ID generation
        createdAt: new Date(),
      };

      const updatedCourses = [...courses, newCourse];
      setCourses(updatedCourses);
      saveCoursesToStorage(updatedCourses);

      console.log("Course created:", newCourse);
      return newCourse;
    },
    [courses]
  );

  // Update an existing course
  const updateCourse = useCallback(
    (id: number, courseData: Partial<Course>): Course | null => {
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
      setCourses(updatedCourses);
      saveCoursesToStorage(updatedCourses);

      console.log("Course updated:", updatedCourse);
      return updatedCourse;
    },
    [courses]
  );

  // Delete a course
  const deleteCourse = useCallback(
    (id: number): boolean => {
      const courseIndex = courses.findIndex((course) => course.id === id);

      if (courseIndex === -1) {
        console.error(`Course with id ${id} not found`);
        return false;
      }

      const updatedCourses = courses.filter((course) => course.id !== id);
      setCourses(updatedCourses);
      saveCoursesToStorage(updatedCourses);

      console.log("Course deleted:", id);
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
